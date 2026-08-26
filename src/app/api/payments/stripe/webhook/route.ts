import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(key, {
    apiVersion: "2025-07-30.basil" as any,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("Stripe webhook signature error:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status !== "paid") {
        return NextResponse.json({ received: true });
      }

      const sessionId = session.id;
      const pendingSnap = await adminDb
        .collection("pending_payments")
        .doc(sessionId)
        .get();

      const userId =
        session.metadata?.userId || pendingSnap.data()?.userId;

      const amountUSD = Number(
        session.metadata?.amountUSD ||
          (session.amount_total ? session.amount_total / 100 : 0)
      );

      if (!userId || amountUSD <= 0) {
        console.error("Stripe webhook missing userId or amount", sessionId);
        return NextResponse.json({ received: true });
      }

      const pendingRef = adminDb.collection("pending_payments").doc(sessionId);
      const userRef = adminDb.collection("users").doc(userId);

      await adminDb.runTransaction(async (tx) => {
        const pending = await tx.get(pendingRef);
        if (pending.exists && pending.data()?.status === "completed") {
          return;
        }

        const userSnap = await tx.get(userRef);
        const current = userSnap.exists
          ? Number(userSnap.data()?.balance || 0)
          : 0;

        tx.set(
          userRef,
          {
            balance: Number((current + amountUSD).toFixed(2)),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        tx.set(
          pendingRef,
          {
            userId,
            amountUSD,
            method: "stripe",
            status: "completed",
            sessionId,
            paymentIntent: session.payment_intent || null,
            creditedUSD: amountUSD,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      });

      console.log("Stripe wallet credited:", { userId, amountUSD, sessionId });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handler error:", error);
    return NextResponse.json({ received: true });
  }
}