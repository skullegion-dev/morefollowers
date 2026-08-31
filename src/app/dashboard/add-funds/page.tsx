"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatUSD, formatKES, usdToKes, kesToUsd } from "@/lib/currency";
import { ArrowLeft, CreditCard, Bitcoin, Wallet } from "lucide-react";
import Image from "next/image";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LeaderboardAd, NativeAd, SkyscraperAd } from "@/components/ads/AdSlots";

const PRESET_USD = [5, 10, 20, 50, 100, 200];
const PRESET_KES = [50, 100, 200, 300, 500, 1000];

const CRYPTO_OPTIONS = [
  { id: "", label: "Any coin (user chooses)" },
  { id: "btc", label: "BTC" },
  { id: "bnbmainnet", label: "BNB" },
  { id: "ltc", label: "LTC" },
  { id: "usdttrc20", label: "USDT (TRC20)" },
  { id: "usdterc20", label: "USDT (ERC20)" },
  { id: "usdc", label: "USDC" },
];

export default function AddFundsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [method, setMethod] = useState<"stripe" | "paypal" | "crypto" | "mpesa">(
    "stripe"
  );
  const [amountUSD, setAmountUSD] = useState<number>(10);
  const [amountKES, setAmountKES] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [cryptoCoin, setCryptoCoin] = useState("");
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [balanceHighlight, setBalanceHighlight] = useState(false);
  const [showBalancePopup, setShowBalancePopup] = useState(false);
  const [creditedAmount, setCreditedAmount] = useState<number | null>(null);

  const prevBalanceRef = useRef<number | null>(null);
  const paypalHandled = useRef(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      const newBalance = snap.exists() ? Number(snap.data().balance || 0) : 0;

      if (
        prevBalanceRef.current !== null &&
        newBalance > prevBalanceRef.current
      ) {
        const added = Number((newBalance - prevBalanceRef.current).toFixed(2));
        setCreditedAmount(added);
        setBalanceHighlight(true);
        setShowBalancePopup(true);
        setTimeout(() => setBalanceHighlight(false), 4000);
        setTimeout(() => setShowBalancePopup(false), 5000);
      }

      prevBalanceRef.current = newBalance;
      setBalance(newBalance);
    });

    return () => unsubscribe();
  }, [user]);

  // Read return URLs in the browser only (avoids useSearchParams build error)
  useEffect(() => {
    if (!user || typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const stripe = params.get("stripe");
    const paypal = params.get("paypal");
    const cryptoStatus = params.get("crypto");

    if (stripe === "success") {
      setMessage(
        "Card payment received. Your wallet will update in a few seconds."
      );
      setMethod("stripe");
    }
    if (stripe === "cancel") {
      setMessage("Card payment was cancelled.");
      setMethod("stripe");
    }

    if (paypal === "cancel") {
      setMessage("PayPal payment was cancelled.");
      setMethod("paypal");
    }

    if (cryptoStatus === "success") {
      setMessage(
        "Crypto payment submitted. Balance updates after network confirmation."
      );
      setMethod("crypto");
    }
    if (cryptoStatus === "cancel") {
      setMessage("Crypto payment was cancelled.");
      setMethod("crypto");
    }

    if (paypal === "success" && !paypalHandled.current) {
      paypalHandled.current = true;
      setMethod("paypal");
      setConfirming(true);
      setMessage("Confirming PayPal payment…");

      const token = params.get("token");
      if (token) {
        fetch("/api/payments/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: token, userId: user.uid }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.success && data.status === "completed") {
              setMessage(
                `Payment confirmed! $${Number(data.amountUSD).toFixed(2)} added to your wallet.`
              );
            } else {
              setMessage(
                data.error ||
                  "PayPal capture pending. Balance will update shortly if paid."
              );
            }
          })
          .catch(() => {
            setMessage(
              "Could not confirm PayPal payment. Check balance shortly."
            );
          })
          .finally(() => setConfirming(false));
      } else {
        setMessage(
          "PayPal returned without order id. Check your balance shortly."
        );
        setConfirming(false);
      }
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const isMpesa = method === "mpesa";

  const finalKES = isMpesa
    ? customAmount
      ? Number(customAmount)
      : amountKES
    : usdToKes(customAmount ? Number(customAmount) : amountUSD);

  const finalUSD = isMpesa
    ? kesToUsd(finalKES)
    : customAmount
      ? Number(customAmount)
      : amountUSD;

  const handlePreset = (value: number) => {
    if (isMpesa) {
      setAmountKES(value);
    } else {
      setAmountUSD(value);
    }
    setCustomAmount("");
  };

  const preventScrollChange = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  const handlePay = async () => {
    if (isMpesa && finalKES < 1) {
      setMessage("Minimum M-Pesa amount is Ksh 1");
      return;
    }

    if (!isMpesa && finalUSD < 1) {
      setMessage("Minimum amount is $1");
      return;
    }

    if (isMpesa && (!phone || phone.length < 9)) {
      setMessage("Please enter a valid M-Pesa phone number");
      return;
    }

    setProcessing(true);
    setMessage("");
    setConfirming(false);

    try {
      if (method === "stripe") {
        const res = await fetch("/api/payments/stripe/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amountUSD: finalUSD,
            userId: user.uid,
          }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          window.location.href = data.url;
          return;
        }
        setMessage(data.error || "Could not start card payment");
      }

      if (method === "paypal") {
        const res = await fetch("/api/payments/paypal/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amountUSD: finalUSD,
            userId: user.uid,
          }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          window.location.href = data.url;
          return;
        }
        setMessage(data.error || "Could not start PayPal payment");
      }

      if (method === "crypto") {
        const res = await fetch("/api/payments/crypto/create-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amountUSD: finalUSD,
            userId: user.uid,
            payCurrency: cryptoCoin || undefined,
          }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          window.location.href = data.url;
          return;
        }
        setMessage(data.error || "Could not start crypto payment");
      }

      if (method === "mpesa") {
        const res = await fetch("/api/payments/mpesa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amountUSD: finalUSD,
            amountKES: Math.round(finalKES),
            phone: phone,
            userId: user.uid,
          }),
        });

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          setMessage("Server error: API did not return JSON");
          return;
        }

        const data = await res.json();

        if (data.success) {
          setConfirming(true);
          setMessage(
            "Confirming payment… Enter your M-Pesa PIN on your phone."
          );

          const checkoutRequestId = data.checkoutRequestId;
          let attempts = 0;
          const maxAttempts = 24;

          const poll = async () => {
            attempts++;
            try {
              const statusRes = await fetch("/api/payments/mpesa/status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  checkoutRequestId,
                  userId: user.uid,
                }),
              });

              const statusData = await statusRes.json();

              if (statusData.status === "completed") {
                setMessage(
                  `Payment confirmed! $${Number(statusData.amountUSD).toFixed(2)} added to your wallet.`
                );
                setConfirming(false);
                return;
              }

              if (statusData.status === "failed") {
                setMessage(
                  statusData.error || "Payment failed or was cancelled."
                );
                setConfirming(false);
                return;
              }

              if (
                statusData.status === "error" ||
                statusData.status === "not_found"
              ) {
                setMessage(statusData.error || "Could not verify payment.");
                setConfirming(false);
                return;
              }

              if (attempts < maxAttempts) {
                setTimeout(poll, 5000);
              } else {
                setMessage(
                  "Still confirming… If you paid, your balance will update shortly. You can refresh the page."
                );
                setConfirming(false);
              }
            } catch {
              if (attempts < maxAttempts) {
                setTimeout(poll, 5000);
              } else {
                setMessage(
                  "Could not confirm payment status. Check your balance shortly."
                );
                setConfirming(false);
              }
            }
          };

          setTimeout(poll, 8000);
        } else {
          setMessage(data.error || "M-Pesa payment failed");
        }
      }
    } catch (error: any) {
      setMessage(error.message || "Something went wrong");
    } finally {
      setProcessing(false);
    }
  };

  const getButtonText = () => {
    if (processing) return "Processing...";
    if (confirming) return "Confirming payment…";
    if (method === "mpesa") return `Pay ${formatKES(finalKES)} with M-Pesa`;
    if (method === "stripe") return `Pay ${formatUSD(finalUSD)} with Card`;
    if (method === "paypal") return `Pay ${formatUSD(finalUSD)} with PayPal`;
    return `Pay ${formatUSD(finalUSD)} with Crypto`;
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl relative">
      {showBalancePopup && creditedAmount !== null && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg bg-emerald-600 text-white text-sm font-medium">
          +{formatUSD(creditedAmount)} added to your wallet
        </div>
      )}

      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push("/dashboard")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <h1 className="text-3xl font-bold mb-2">Add Funds</h1>
      <p className="text-muted-foreground mb-6">Top up your wallet</p>

      <div
        className={`mb-8 p-4 rounded-xl border flex items-center justify-between transition-all duration-500 ${
          balanceHighlight
            ? "bg-emerald-500/15 border-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.35)]"
            : "bg-muted/60 border-border"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center ${
              balanceHighlight
                ? "bg-emerald-500 text-white"
                : "bg-primary/10 text-primary"
            }`}
          >
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Current balance</p>
            <p
              className={`text-xl font-bold ${
                balanceHighlight ? "text-emerald-600 dark:text-emerald-400" : ""
              }`}
            >
              {formatUSD(balance)}
            </p>
          </div>
        </div>
        {balanceHighlight && (
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Updated
          </span>
        )}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div
            className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer ${
              method === "stripe" ? "border-primary bg-primary/5" : ""
            }`}
            onClick={() => {
              setMethod("stripe");
              setCustomAmount("");
              setConfirming(false);
            }}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded flex items-center justify-center text-white text-xs font-bold">
              Card
            </div>
            <div className="flex-1">
              <p className="font-medium">Credit / Debit Card</p>
              <p className="text-sm text-muted-foreground">Visa, Mastercard</p>
            </div>
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </div>

          <div
            className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer ${
              method === "paypal" ? "border-primary bg-primary/5" : ""
            }`}
            onClick={() => {
              setMethod("paypal");
              setCustomAmount("");
              setConfirming(false);
            }}
          >
            <div className="w-10 h-10 flex items-center justify-center font-bold text-sm">
              <span className="text-blue-600">Pay</span>
              <span className="text-blue-800">Pal</span>
            </div>
            <div className="flex-1">
              <p className="font-medium">PayPal</p>
              <p className="text-sm text-muted-foreground">International</p>
            </div>
          </div>

          <div
            className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer ${
              method === "crypto" ? "border-primary bg-primary/5" : ""
            }`}
            onClick={() => {
              setMethod("crypto");
              setCustomAmount("");
              setConfirming(false);
            }}
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <Bitcoin className="h-6 w-6 text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Cryptocurrency</p>
              <p className="text-sm text-muted-foreground">
                BTC, BNB, LTC, USDT, USDC
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer ${
              method === "mpesa" ? "border-primary bg-primary/5" : ""
            }`}
            onClick={() => {
              setMethod("mpesa");
              setCustomAmount("");
              setConfirming(false);
            }}
          >
            <div className="w-10 h-10 relative flex items-center justify-center">
              <Image
                src="/payments/mpesa.png"
                alt="M-Pesa"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div className="flex-1">
              <p className="font-medium">M-Pesa</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {isMpesa ? "Enter Amount (KES)" : "Enter Amount (USD)"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {(isMpesa ? PRESET_KES : PRESET_USD).map((value) => (
              <Button
                key={value}
                variant={
                  (isMpesa ? amountKES : amountUSD) === value && !customAmount
                    ? "default"
                    : "outline"
                }
                onClick={() => handlePreset(value)}
              >
                {isMpesa ? `Ksh ${value}` : `$${value}`}
              </Button>
            ))}
          </div>

          <div>
            <label className="text-sm text-muted-foreground">
              {isMpesa ? "Enter any amount (KES)" : "Enter any amount (USD)"}
            </label>
            <Input
              type="number"
              placeholder={isMpesa ? "e.g. 50" : "e.g. 5"}
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              onWheel={preventScrollChange}
              min="1"
            />
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-1">
            {isMpesa ? (
              <>
                <p className="text-sm">
                  You will pay: <strong>{formatKES(finalKES)}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  You will receive: <strong>{formatUSD(finalUSD)}</strong>
                </p>
              </>
            ) : (
              <p className="text-sm">
                You will receive: <strong>{formatUSD(finalUSD)}</strong>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {method === "crypto" && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <label className="text-sm font-medium">
              Preferred coin (optional)
            </label>
            <select
              className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={cryptoCoin}
              onChange={(e) => setCryptoCoin(e.target.value)}
            >
              {CRYPTO_OPTIONS.map((c) => (
                <option key={c.id || "any"} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      )}

      {isMpesa && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <label className="text-sm font-medium">M-Pesa Phone Number</label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2"
              inputMode="numeric"
              autoComplete="tel"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Example format: <span className="font-medium">0712345678</span>
            </p>
          </CardContent>
        </Card>
      )}

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg text-sm text-center ${
            message.toLowerCase().includes("confirmed") ||
            message.toLowerCase().includes("confirming") ||
            message.toLowerCase().includes("received") ||
            message.toLowerCase().includes("submitted") ||
            confirming
              ? "bg-green-50 text-green-700 dark:bg-green-900/20"
              : "bg-red-50 text-red-700 dark:bg-red-900/20"
          }`}
        >
          {message}
        </div>
      )}

      <Button
        className="w-full h-12 text-base"
        onClick={handlePay}
        disabled={processing || confirming}
      >
        {getButtonText()}
      </Button>

      <div className="mt-8 flex justify-center overflow-x-auto">
        <LeaderboardAd />
      </div>
      <div className="mt-6 flex justify-center">
        <SkyscraperAd />
      </div>
      <div className="mt-6">
        <NativeAd />
      </div>
    </div>
  );
}