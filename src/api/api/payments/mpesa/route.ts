import { NextRequest, NextResponse } from "next/server";
import { usdToKes } from "@/lib/currency";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amountUSD, phone, userId } = body;

    if (!amountUSD || !phone || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const amount = Number(amountUSD);
    if (isNaN(amount) || amount < 1) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      );
    }

    const kesAmount = usdToKes(amount);

    // Format phone to 2547XXXXXXXX
    let formattedPhone = phone.toString().replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith("7")) {
      formattedPhone = "254" + formattedPhone;
    } else if (formattedPhone.startsWith("+254")) {
      formattedPhone = formattedPhone.slice(1);
    }

    if (!formattedPhone.startsWith("254") || formattedPhone.length !== 12) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    const consumerKey = process.env.MPESA_CONSUMER_KEY!;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
    const shortcode = process.env.MPESA_SHORTCODE!;
    const passkey = process.env.MPESA_PASSKEY!;
    const callbackUrl = process.env.MPESA_CALLBACK_URL!;

    if (!consumerKey || !consumerSecret || !shortcode || !passkey || !callbackUrl) {
      return NextResponse.json(
        { success: false, error: "M-Pesa is not fully configured" },
        { status: 500 }
      );
    }

    // 1. Get Access Token (LIVE)
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

    const tokenRes = await fetch(
      "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("Token error:", tokenData);
      return NextResponse.json(
        { success: false, error: "Failed to get M-Pesa access token" },
        { status: 500 }
      );
    }

    // 2. Generate Timestamp & Password
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);

    const password = Buffer.from(shortcode + passkey + timestamp).toString(
      "base64"
    );

    // 3. Initiate STK Push (LIVE)
    const stkRes = await fetch(
      "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
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
          TransactionType: "CustomerPayBillOnline", // or CustomerBuyGoodsOnline for Till
          Amount: kesAmount,
          PartyA: formattedPhone,
          PartyB: shortcode,
          PhoneNumber: formattedPhone,
          CallBackURL: callbackUrl,
          AccountReference: "MoreFollowers",
          TransactionDesc: `Wallet top-up $${amount}`,
        }),
      }
    );

    const stkData = await stkRes.json();

    if (stkData.ResponseCode === "0") {
      // Optionally save pending transaction here
      return NextResponse.json({
        success: true,
        message: "STK Push sent",
        checkoutRequestId: stkData.CheckoutRequestID,
        merchantRequestId: stkData.MerchantRequestID,
      });
    }

    console.error("STK Error:", stkData);
    return NextResponse.json({
      success: false,
      error: stkData.errorMessage || stkData.ResponseDescription || "STK Push failed",
    });
  } catch (error: any) {
    console.error("M-Pesa route error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}