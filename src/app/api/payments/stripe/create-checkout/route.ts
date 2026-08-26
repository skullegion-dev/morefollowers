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
  try {
    const body = await req.json();
    const { amountUSD, userId } = body;

    const amount = Number(amountUSD);
    if (!userId || !amount || amount < 1) {
      return NextResponse.json(
        { success: false, error: "Invalid amount or user" },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://www.morefollowers.shop";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "MoreFollowers Wallet Top-up",
              description: `Add $${amount.toFixed(2)} to wallet`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        amountUSD: amount.toFixed(2),
        purpose: "wallet_topup",
      },
      success_url: `${appUrl}/dashboard/add-funds?stripe=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/add-funds?stripe=cancel`,
    });

    await adminDb.collection("pending_payments").doc(session.id).set({
      userId,
      amountUSD: amount,
      method: "stripe",
      status: "pending",
      sessionId: session.id,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error("Stripe create-checkout error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Stripe error" },
      { status: 500 }
    );
  }
}