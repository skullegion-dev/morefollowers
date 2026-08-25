import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amountUSD, userId, payCurrency } = body;
    const amount = Number(amountUSD);

    if (!userId || !amount || amount < 1) {
      return NextResponse.json(
        { success: false, error: "Invalid amount or user" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Crypto payments are not configured" },
        { status: 500 }
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://www.morefollowers.shop";

    // Optional: btc, bnb, ltc, usdttrc20, usdterc20, usdc
    const payload: Record<string, any> = {
      price_amount: amount,
      price_currency: "usd",
      order_id: `${userId}_${Date.now()}`,
      order_description: "MoreFollowers Wallet Top-up",
      ipn_callback_url: `${appUrl}/api/payments/crypto/ipn`,
      success_url: `${appUrl}/dashboard/add-funds?crypto=success`,
      cancel_url: `${appUrl}/dashboard/add-funds?crypto=cancel`,
    };

    if (payCurrency) {
      payload.pay_currency = payCurrency;
    }

    const res = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!data.id && !data.invoice_id) {
      return NextResponse.json(
        {
          success: false,
          error: data.message || "Could not create crypto payment",
          details: data,
        },
        { status: 500 }
      );
    }

    const invoiceId = String(data.id || data.invoice_id);
    const paymentUrl = data.invoice_url || data.payment_url;

    await adminDb.collection("pending_payments").doc(invoiceId).set({
      userId,
      amountUSD: amount,
      method: "crypto",
      status: "pending",
      invoiceId,
      orderId: payload.order_id,
      payCurrency: payCurrency || null,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      invoiceId,
      url: paymentUrl,
    });
  } catch (error: any) {
    console.error("Crypto create-payment error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Crypto error" },
      { status: 500 }
    );
  }
}