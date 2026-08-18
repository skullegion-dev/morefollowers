import { NextRequest, NextResponse } from "next/server";
import { usdToKes } from "@/lib/currency";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amountUSD, amountKES, phone, userId } = body;

    if (!phone || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Prefer amountKES if provided (from the new UI), otherwise convert from USD
    let kesAmount = amountKES
      ? Math.round(Number(amountKES))
      : Math.round(usdToKes(Number(amountUSD)));

    if (!kesAmount || kesAmount < 1) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Store the exact USD amount we will credit later
    const creditUSD =
      amountUSD !== undefined && amountUSD !== null
        ? Number(Number(amountUSD).toFixed(2))
        : Number((kesAmount / 129.5).toFixed(2));

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
    const shortcode = process.env.MPESA_SHORTCODE; // 3566323 (Daraja Short Code)
    const tillNumber = process.env.MPESA_TILL_NUMBER || shortcode; // 6723649 (customer Till)
    const passkey = process.env.MPESA_PASSKEY;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;

    if (!consumerKey || !consumerSecret || !shortcode || !passkey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "M-Pesa credentials missing. Check environment variables.",
        },
        { status: 500 }
      );
    }

    // LIVE endpoints
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
          error: "Could not get M-Pesa access token. Check Consumer Key/Secret.",
        },
        { status: 500 }
      );
    }

    // Timestamp MUST be Africa/Nairobi (UTC+3)
    const timestamp = new Date()
      .toLocaleString("sv-SE", { timeZone: "Africa/Nairobi" })
      .replace(/[-: ]/g, "")
      .slice(0, 14);

    const password = Buffer.from(shortcode + passkey + timestamp).toString(
      "base64"
    );

    // BusinessShortCode = Daraja Short Code (3566323)
    // PartyB            = actual Till Number (6723649)
    const stkResponse = await fetch(stkUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerBuyGoodsOnline",
        Amount: kesAmount,
        PartyA: formattedPhone,
        PartyB: tillNumber,
        PhoneNumber: formattedPhone,
        CallBackURL: callbackUrl,
        AccountReference: "MoreFollowers",
        TransactionDesc: "MoreFollowers Wallet Top-up",
      }),
    });

    const stkJson = await stkResponse.json();

    if (stkJson.ResponseCode === "0") {
      // Save pending transaction so the callback can credit the correct user
      const checkoutRequestId = stkJson.CheckoutRequestID;

      await adminDb
        .collection("pending_mpesa")
        .doc(checkoutRequestId)
        .set({
          userId,
          checkoutRequestId,
          merchantRequestId: stkJson.MerchantRequestID || "",
          amountUSD: creditUSD,
          amountKES: kesAmount,
          phone: formattedPhone,
          status: "pending",
          createdAt: FieldValue.serverTimestamp(),
        });

      return NextResponse.json({
        success: true,
        checkoutRequestId,
        merchantRequestId: stkJson.MerchantRequestID,
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