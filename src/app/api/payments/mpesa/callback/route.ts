import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { kesToUsd } from "@/lib/currency";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("M-Pesa Callback:", JSON.stringify(body, null, 2));

    const stkCallback = body?.Body?.stkCallback;

    if (!stkCallback) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: "Invalid payload" });
    }

    const resultCode = stkCallback.ResultCode;
    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultDesc = stkCallback.ResultDesc;

    // Payment failed or cancelled
    if (resultCode !== 0) {
      console.log("Payment failed/cancelled:", resultDesc);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    // Payment successful
    const metadata = stkCallback.CallbackMetadata?.Item || [];
    const amountItem = metadata.find((i: any) => i.Name === "Amount");
    const receiptItem = metadata.find((i: any) => i.Name === "MpesaReceiptNumber");
    const phoneItem = metadata.find((i: any) => i.Name === "PhoneNumber");

    const amountKES = amountItem?.Value || 0;
    const receipt = receiptItem?.Value || "";
    const phone = phoneItem?.Value || "";

    const amountUSD = kesToUsd(Number(amountKES));

    // For now we need a way to know which user this payment belongs to.
    // We will improve this next by storing pending transactions.
    // Temporary: log everything
    console.log("Successful payment:", {
      amountKES,
      amountUSD,
      receipt,
      phone,
      checkoutRequestId,
    });

    // TODO: Credit the correct user wallet here
    // (We will add pending transaction lookup in the next step)

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Error" });
  }
}