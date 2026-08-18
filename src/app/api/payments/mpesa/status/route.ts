import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { checkoutRequestId, userId } = body;

    if (!checkoutRequestId || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing checkoutRequestId or userId" },
        { status: 400 }
      );
    }

    const pendingRef = adminDb.collection("pending_mpesa").doc(checkoutRequestId);
    const pendingSnap = await pendingRef.get();

    if (!pendingSnap.exists) {
      return NextResponse.json({
        success: false,
        status: "not_found",
        error: "Transaction not found in Firestore",
      });
    }

    const pending = pendingSnap.data()!;

    if (pending.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    if (pending.status === "completed") {
      return NextResponse.json({
        success: true,
        status: "completed",
        amountUSD: pending.amountUSD,
        receipt: pending.mpesaReceiptNumber || null,
      });
    }

    if (pending.status === "failed") {
      return NextResponse.json({
        success: false,
        status: "failed",
        error: pending.resultDesc || "Payment failed",
      });
    }

    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;

    if (!consumerKey || !consumerSecret || !shortcode || !passkey) {
      return NextResponse.json({
        success: false,
        status: "pending",
        error: "M-Pesa env vars missing on server",
      });
    }

    const authHeader = Buffer.from(
      `${consumerKey}:${consumerSecret}`
    ).toString("base64");

    const tokenRes = await fetch(
      "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${authHeader}` } }
    );
    const tokenJson = await tokenRes.json();
    const token = tokenJson.access_token;

    if (!token) {
      return NextResponse.json({
        success: false,
        status: "pending",
        error: "Could not get M-Pesa access token",
        details: tokenJson,
      });
    }

    const timestamp = new Date()
      .toLocaleString("sv-SE", { timeZone: "Africa/Nairobi" })
      .replace(/[-: ]/g, "")
      .slice(0, 14);

    const password = Buffer.from(shortcode + passkey + timestamp).toString(
      "base64"
    );

    const queryRes = await fetch(
      "https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestId,
        }),
      }
    );

    const queryJson = await queryRes.json();
    console.log("STK Query result:", JSON.stringify(queryJson));

    const resultCodeRaw = queryJson.ResultCode;
    const resultCode =
      resultCodeRaw === undefined || resultCodeRaw === null || resultCodeRaw === ""
        ? null
        : Number(resultCodeRaw);
    const resultDesc = String(queryJson.ResultDesc || queryJson.errorMessage || "");

    // Still processing / waiting for PIN
    if (
      resultCode === 4999 ||
      resultCodeRaw === "4999" ||
      resultDesc.toLowerCase().includes("waiting") ||
      resultDesc.toLowerCase().includes("being processed")
    ) {
      return NextResponse.json({
        success: true,
        status: "pending",
        message: resultDesc || "Waiting for PIN / processing",
        details: queryJson,
      });
    }

    // Explicit failure codes from Safaricom
    if (resultCode !== null && resultCode !== 0 && !Number.isNaN(resultCode)) {
      await pendingRef.update({
        status: "failed",
        resultCode,
        resultDesc: resultDesc || "Failed",
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({
        success: false,
        status: "failed",
        error: resultDesc || "Payment failed or cancelled",
        details: queryJson,
      });
    }

    // Success
    if (resultCode === 0 || resultCodeRaw === "0") {
      const amountUSD = Number(pending.amountUSD) || 0;
      const userRef = adminDb.collection("users").doc(userId);

      if (amountUSD > 0) {
        await adminDb.runTransaction(async (tx) => {
          const freshPending = await tx.get(pendingRef);
          if (!freshPending.exists) return;
          if (freshPending.data()?.status === "completed") return;

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
            resultDesc: resultDesc || "Success",
            creditedUSD: amountUSD,
            creditedVia: "stk_query",
            updatedAt: FieldValue.serverTimestamp(),
          });
        });
      }

      return NextResponse.json({
        success: true,
        status: "completed",
        amountUSD: pending.amountUSD,
        details: queryJson,
      });
    }

    // No clear ResultCode yet
    return NextResponse.json({
      success: true,
      status: "pending",
      message: resultDesc || "Still waiting for Safaricom confirmation",
      details: queryJson,
    });
  } catch (error: any) {
    console.error("Status check error:", error);
    return NextResponse.json(
      {
        success: false,
        status: "error",
        error: error?.message || "Server error",
      },
      { status: 500 }
    );
  }
}