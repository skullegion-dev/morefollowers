"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatUSD, formatKES, usdToKes, kesToUsd } from "@/lib/currency";
import { ArrowLeft, Smartphone, CreditCard, Bitcoin } from "lucide-react";
import Image from "next/image";

const PRESET_USD = [5, 10, 20, 50, 100, 200];
const PRESET_KES = [500, 1000, 2000, 5000, 10000, 20000];

export default function AddFundsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [method, setMethod] = useState<"stripe" | "paypal" | "crypto" | "mpesa">("stripe");
  const [amountUSD, setAmountUSD] = useState<number>(10);
  const [amountKES, setAmountKES] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");

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

  // Calculate final amounts
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
    if (finalUSD < 1) {
      setMessage("Minimum amount is $1.00");
      return;
    }

    if (isMpesa && (!phone || phone.length < 9)) {
      setMessage("Please enter a valid M-Pesa phone number");
      return;
    }

    setProcessing(true);
    setMessage("");

    try {
      if (method === "mpesa") {
        const res = await fetch("/api/payments/mpesa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amountUSD: finalUSD,
            amountKES: finalKES,
            phone: phone,
            userId: user.uid,
          }),
        });

        const data = await res.json();

        if (data.success) {
          setMessage(
            "STK Push sent! Check your phone and enter your M-Pesa PIN."
          );
        } else {
          setMessage(data.error || "M-Pesa payment failed");
        }
      }

      if (method === "stripe") {
        setMessage("Stripe will be connected next...");
      }
      if (method === "paypal") {
        setMessage("PayPal will be connected next...");
      }
      if (method === "crypto") {
        setMessage("Crypto will be connected next...");
      }
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Network error. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const getButtonText = () => {
    if (processing) return "Processing...";
    if (method === "mpesa") return `Pay ${formatKES(finalKES)} with M-Pesa`;
    if (method === "stripe") return `Pay ${formatUSD(finalUSD)} with Card`;
    if (method === "paypal") return `Pay ${formatUSD(finalUSD)} with PayPal`;
    return `Pay ${formatUSD(finalUSD)} with Crypto`;
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push("/dashboard")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <h1 className="text-3xl font-bold mb-2">Add Funds</h1>
      <p className="text-muted-foreground mb-8">
        Top up your wallet
      </p>

      {/* Payment Methods - New Order */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Stripe */}
          <div
            className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition ${
              method === "stripe" ? "border-primary bg-primary/5" : ""
            }`}
            onClick={() => {
              setMethod("stripe");
              setCustomAmount("");
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

          {/* PayPal */}
          <div
            className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition ${
              method === "paypal" ? "border-primary bg-primary/5" : ""
            }`}
            onClick={() => {
              setMethod("paypal");
              setCustomAmount("");
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

          {/* Crypto */}
          <div
            className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition ${
              method === "crypto" ? "border-primary bg-primary/5" : ""
            }`}
            onClick={() => {
              setMethod("crypto");
              setCustomAmount("");
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

          {/* M-Pesa - Last */}
          <div
            className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition ${
              method === "mpesa" ? "border-primary bg-primary/5" : ""
            }`}
            onClick={() => {
              setMethod("mpesa");
              setCustomAmount("");
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
              <p className="text-sm text-muted-foreground">Instant mobile money</p>
            </div>
            <Smartphone className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Amount Selection */}
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
                {isMpesa ? `Ksh ${value.toLocaleString()}` : `$${value}`}
              </Button>
            ))}
          </div>

          <div>
            <label className="text-sm text-muted-foreground">
              Custom amount ({isMpesa ? "KES" : "USD"})
            </label>
            <Input
              type="number"
              placeholder={isMpesa ? "Enter amount in KES" : "Enter amount in USD"}
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

      {/* M-Pesa Phone */}
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
            <p className="text-xs text-muted-foreground mt-2">
              Enter the Safaricom number registered with M-Pesa
            </p>
          </CardContent>
        </Card>
      )}

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg text-sm text-center ${
            message.toLowerCase().includes("success") ||
            message.toLowerCase().includes("sent")
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
        disabled={processing || finalUSD < 1}
      >
        {getButtonText()}
      </Button>
    </div>
  );
}