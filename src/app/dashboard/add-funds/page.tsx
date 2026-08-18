"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatUSD, formatKES, usdToKes, kesToUsd } from "@/lib/currency";
import { ArrowLeft, CreditCard, Bitcoin } from "lucide-react";
import Image from "next/image";

const PRESET_USD = [5, 10, 20, 50, 100, 200];
const PRESET_KES = [50, 100, 200, 300, 500, 1000];

export default function AddFundsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [method, setMethod] = useState<"stripe" | "paypal" | "crypto" | "mpesa">("stripe");
  const [amountUSD, setAmountUSD] = useState<number>(10);
  const [amountKES, setAmountKES] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

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
            "STK Push sent! Enter your M-Pesa PIN on your phone. Confirming payment… This can take up to 1 minute. Your wallet will be credited automatically when payment succeeds."
          );
        } else {
          setMessage(data.error || "M-Pesa payment failed");
        }
      }

      if (method === "stripe") setMessage("Stripe coming next...");
      if (method === "paypal") setMessage("PayPal coming next...");
      if (method === "crypto") setMessage("Crypto coming next...");
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
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <Button variant="ghost" className="mb-6" onClick={() => router.push("/dashboard")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <h1 className="text-3xl font-bold mb-2">Add Funds</h1>
      <p className="text-muted-foreground mb-8">Top up your wallet</p>

      {/* Payment Methods */}
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
              <p className="text-sm text-muted-foreground">BTC, BNB, LTC, USDT, USDC</p>
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

      {/* Amount */}
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

      {isMpesa && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <label className="text-sm font-medium">M-Pesa Phone Number</label>
            <Input
              type="tel"
              placeholder="0712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2"
            />
          </CardContent>
        </Card>
      )}

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg text-sm text-center ${
            message.toLowerCase().includes("sent") || confirming
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
    </div>
  );
}