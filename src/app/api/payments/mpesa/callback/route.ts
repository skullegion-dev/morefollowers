import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("M-Pesa Callback:", JSON.stringify(body, null, 2));

    const stkCallback = body?.Body?.stkCallback;

    if (!stkCallback) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const resultCode = stkCallback.ResultCode;
    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultDesc = stkCallback.ResultDesc || "";

    // Always look up the pending transaction
    const pendingRef = adminDb.collection("pending_mpesa").doc(checkoutRequestId);
    const pendingSnap = await pendingRef.get();

    if (!pendingSnap.exists) {
      console.log("No pending transaction found for:", checkoutRequestId);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const pending = pendingSnap.data()!;

    // Already processed – do nothing (idempotent)
    if (pending.status === "completed" || pending.status === "failed") {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    // Payment failed or cancelled by user
    if (resultCode !== 0) {
      await pendingRef.update({
        status: "failed",
        resultCode,
        resultDesc,
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log("Payment failed/cancelled:", resultDesc);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    // ===== Payment successful =====
    const metadata = stkCallback.CallbackMetadata?.Item || [];
    const amountItem = metadata.find((i: any) => i.Name === "Amount");
    const receiptItem = metadata.find((i: any) => i.Name === "MpesaReceiptNumber");
    const phoneItem = metadata.find((i: any) => i.Name === "PhoneNumber");

    const amountKES = amountItem?.Value || pending.amountKES || 0;
    const receipt = receiptItem?.Value || "";
    const phone = phoneItem?.Value || pending.phone || "";

    const amountUSD = Number(pending.amountUSD) || 0;
    const userId = pending.userId;

    if (!userId || amountUSD <= 0) {
      console.error("Missing userId or amountUSD in pending transaction");
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    // Credit wallet + mark transaction completed (atomic)
    const userRef = adminDb.collection("users").doc(userId);

    await adminDb.runTransaction(async (tx) => {
      const userSnap = await tx.get(userRef);
      const currentBalance = userSnap.exists
        ? Number(userSnap.data()?.balance || 0)
        : 0;

      tx.set(
        userRef,
        {
          balance: Number((currentBalance + amountUSD).toFixed(2)),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      tx.update(pendingRef, {
        status: "completed",
        resultCode: 0,
        resultDesc,
        mpesaReceiptNumber: receipt,
        phone,
        amountKES,
        creditedUSD: amountUSD,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    console.log("Wallet credited:", {
      userId,
      amountUSD,
      receipt,
      checkoutRequestId,
    });

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("Callback error:", error);
    // Still return 0 so Safaricom does not keep retrying aggressively
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}