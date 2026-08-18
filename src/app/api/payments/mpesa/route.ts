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
    if (isNaN(amount) || amount < 0.5) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      );
    }

    const kesAmount = Math.round(usdToKes(amount));

    // Format phone to 2547XXXXXXXX
    let formattedPhone = phone.toString().replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith("7") && formattedPhone.length === 9) {
      formattedPhone = "254" + formattedPhone;
    } else if (formattedPhone.startsWith("+")) {
      formattedPhone = formattedPhone.slice(1);
    }

    if (!formattedPhone.startsWith("254") || formattedPhone.length !== 12) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid phone number. Use format 0712345678",
        },
        { status: 400 }
      );
    }

    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;

    if (!consumerKey || !consumerSecret || !shortcode || !passkey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "M-Pesa credentials missing. Add MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, MPESA_PASSKEY in Vercel.",
        },
        { status: 500 }
      );
    }

    // LIVE Daraja endpoints
    const tokenUrl =
      "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
    const stkUrl =
      "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

    const authHeader = Buffer.from(
      `${consumerKey}:${consumerSecret}`
    ).toString("base64");

    const tokenResponse = await fetch(tokenUrl, {
      method: "GET",
      headers: {
        Authorization: `Basic ${authHeader}`,
      },
    });

    const tokenJson = await tokenResponse.json();
    const token = tokenJson.access_token;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not get M-Pesa token. Check Consumer Key/Secret.",
        },
        { status: 500 }
      );
    }

    const ts = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);
    const pwd = Buffer.from(shortcode + passkey + ts).toString("base64");

    const stkResponse = await fetch(stkUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: pwd,
        Timestamp: ts,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(kesAmount),
        PartyA: formattedPhone,
        PartyB: shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: callbackUrl,
        AccountReference: "MoreFollowers",
        TransactionDesc: "MoreFollowers top-up",
      }),
    });

    const stkJson = await stkResponse.json();

    if (stkJson.ResponseCode === "0") {
      return NextResponse.json({
        success: true,
        checkoutRequestId: stkJson.CheckoutRequestID,
      });
    }

    return NextResponse.json({
      success: false,
      error:
        stkJson.errorMessage ||
        stkJson.ResponseDescription ||
        "STK Push failed",
      details: stkJson,
    });
  } catch (error: any) {
    console.error("M-Pesa error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Server error",
      },
      { status: 500 }
    );
  }
}