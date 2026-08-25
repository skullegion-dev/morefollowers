import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE || "live";
  const base =
    mode === "sandbox"
      ? "https://api-m.sandbox.paypal.com"
      : "https://api-m.paypal.com";

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  return { token: data.access_token as string, base };
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

    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      return NextResponse.json(
        { success: false, error: "PayPal is not configured" },
        { status: 500 }
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://www.morefollowers.shop";

    const { token, base } = await getPayPalAccessToken();

    const orderRes = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount.toFixed(2),
            },
            description: "MoreFollowers Wallet Top-up",
            custom_id: userId,
          },
        ],
        application_context: {
          brand_name: "MoreFollowers",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
          return_url: `${appUrl}/dashboard/add-funds?paypal=success`,
          cancel_url: `${appUrl}/dashboard/add-funds?paypal=cancel`,
        },
      }),
    });

    const order = await orderRes.json();

    if (!order.id) {
      return NextResponse.json(
        {
          success: false,
          error: order.message || "Could not create PayPal order",
          details: order,
        },
        { status: 500 }
      );
    }

    const approveLink = (order.links || []).find(
      (l: any) => l.rel === "approve"
    )?.href;

    await adminDb.collection("pending_payments").doc(order.id).set({
      userId,
      amountUSD: amount,
      method: "paypal",
      status: "pending",
      orderId: order.id,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      url: approveLink,
    });
  } catch (error: any) {
    console.error("PayPal create-order error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "PayPal error" },
      { status: 500 }
    );
  }
}