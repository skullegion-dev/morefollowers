import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import crypto from "crypto";

function sortObject(obj: any): any {
  return Object.keys(obj)
    .sort()
    .reduce((acc: any, key) => {
      acc[key] =
        obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key])
          ? sortObject(obj[key])
          : obj[key];
      return acc;
    }, {});
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const signature = req.headers.get("x-nowpayments-sig") || "";

    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
    if (ipnSecret && signature) {
      const sorted = sortObject(body);
      const hmac = crypto
        .createHmac("sha512", ipnSecret)
        .update(JSON.stringify(sorted))
        .digest("hex");

      if (hmac !== signature) {
        console.error("NOWPayments IPN invalid signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    console.log("NOWPayments IPN:", JSON.stringify(body));

    const paymentStatus = String(body.payment_status || "").toLowerCase();
    const invoiceId = String(body.invoice_id || body.id || "");
    const orderId = String(body.order_id || "");

    // finished / confirmed = paid
    if (!["finished", "confirmed"].includes(paymentStatus)) {
      return NextResponse.json({ ok: true });
    }

    let pendingRef = invoiceId
      ? adminDb.collection("pending_payments").doc(invoiceId)
      : null;

    let pendingSnap = pendingRef ? await pendingRef.get() : null;

    // Fallback: find by orderId
    if (!pendingSnap?.exists && orderId) {
      const q = await adminDb
        .collection("pending_payments")
        .where("orderId", "==", orderId)
        .limit(1)
        .get();
      if (!q.empty) {
        pendingRef = q.docs[0].ref;
        pendingSnap = q.docs[0];
      }
    }

    if (!pendingRef || !pendingSnap?.exists) {
      console.error("Crypto IPN: pending not found", { invoiceId, orderId });
      return NextResponse.json({ ok: true });
    }

    const pending = pendingSnap.data()!;
    if (pending.status === "completed") {
      return NextResponse.json({ ok: true });
    }

    const userId = pending.userId;
    const amountUSD = Number(pending.amountUSD) || 0;
    if (!userId || amountUSD <= 0) {
      return NextResponse.json({ ok: true });
    }

    const userRef = adminDb.collection("users").doc(userId);

    await adminDb.runTransaction(async (tx) => {
      const fresh = await tx.get(pendingRef!);
      if (fresh.exists && fresh.data()?.status === "completed") return;

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

      tx.update(pendingRef!, {
        status: "completed",
        creditedUSD: amountUSD,
        paymentStatus,
        paymentId: body.payment_id || null,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    console.log("Crypto wallet credited:", { userId, amountUSD, invoiceId });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Crypto IPN error:", error);
    return NextResponse.json({ ok: true });
  }
}