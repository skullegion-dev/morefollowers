import { NextRequest, NextResponse } from "next/server";
import { usdToKes } from "@/lib/currency";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, phone, userId } = body;

    if (!amount || !phone || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert USD to KES
    const kesAmount = usdToKes(Number(amount));

    // Format phone number (2547...)
    let formattedPhone = phone.replace(/\s+/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith("+")) {
      formattedPhone = formattedPhone.substring(1);
    }

    // ===== DARAJA CREDENTIALS =====
    // Add these to your .env.local and Vercel Environment Variables
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const shortcode = process.env.MPESA_SHORTCODE; // e.g. 174379 for sandbox
    const passkey = process.env.MPESA_PASSKEY;
    const callbackUrl = process.env.MPESA_CALLBACK_URL; // https://yourdomain.com/api/payments/mpesa/callback

    if (!consumerKey || !consumerSecret || !shortcode || !passkey) {
      return NextResponse.json(
        { success: false, error: "M-Pesa is not configured yet" },
        { status: 500 }
      );
    }

    // 1. Get Access Token
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

    const tokenRes = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "Failed to get M-Pesa access token" },
        { status: 500 }
      );
    }

    // 2. Generate Password
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);

    const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");

    // 3. STK Push
    const stkRes = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: kesAmount,
          PartyA: formattedPhone,
          PartyB: shortcode,
          PhoneNumber: formattedPhone,
          CallBackURL: callbackUrl || "https://yourdomain.com/api/payments/mpesa/callback",
          AccountReference: "MoreFollowers",
          TransactionDesc: `Wallet top-up $${amount}`,
        }),
      }
    );

    const stkData = await stkRes.json();

    if (stkData.ResponseCode === "0") {
      return NextResponse.json({
        success: true,
        message: "STK Push sent successfully",
        checkoutRequestId: stkData.CheckoutRequestID,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: stkData.errorMessage || "STK Push failed",
      });
    }
  } catch (error: any) {
    console.error("M-Pesa error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}