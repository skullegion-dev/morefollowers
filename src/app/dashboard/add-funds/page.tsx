"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatUSD, formatKES, usdToKes } from "@/lib/currency";
import { ArrowLeft, Smartphone, CreditCard, Bitcoin } from "lucide-react";
import Image from "next/image";

const PRESET_AMOUNTS = [5, 10, 20, 50, 100, 200];

export default function AddFundsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [amount, setAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState("");
  const [method, setMethod] = useState<"mpesa" | "stripe" | "paypal" | "crypto">("mpesa");
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

  const selectedAmount = customAmount ? Number(customAmount) : amount;
  const kesAmount = usdToKes(selectedAmount);

  const handlePreset = (value: number) => {
    setAmount(value);
    setCustomAmount("");
  };

  const handlePay = async () => {
    if (selectedAmount < 1) {
      setMessage("Minimum amount is $1");
      return;
    }

    if (method === "mpesa") {
      if (!phone || phone.length < 9) {
        setMessage("Please enter a valid M-Pesa phone number");
        return;
      }
    }

    setProcessing(true);
    setMessage("");

    try {
      if (method === "mpesa") {
        const res = await fetch("/api/payments/mpesa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amountUSD: selectedAmount,
            phone: phone,
            userId: user.uid,
          }),
        });

        const data = await res.json();

        if (data.success) {
          setMessage(
            "STK Push sent successfully! Check your phone and enter your M-Pesa PIN."
          );
        } else {
          setMessage(data.error || "Failed to initiate M-Pesa payment");
        }
      }

      if (method === "stripe") {
        setMessage("Stripe will be added next...");
      }
      if (method === "paypal") {
        setMessage("PayPal will be added next...");
      }
      if (method === "crypto") {
        setMessage("Crypto will be added next...");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Dynamic button text
  const getButtonText = () => {
    if (processing) return "Processing...";

    if (method === "mpesa") {
      return `Pay ${formatKES(kesAmount)} with M-Pesa`;
    }
    if (method === "stripe") {
      return `Pay ${formatUSD(selectedAmount)} with Card`;
    }
    if (method === "paypal") {
      return `Pay ${formatUSD(selectedAmount)} with PayPal`;
    }
    return `Pay ${formatUSD(selectedAmount)} with Crypto`;
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
        Top up your wallet in USD
      </p>

      {/* Amount Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Amount (USD)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {PRESET_AMOUNTS.map((value) => (
              <Button
                key={value}
                variant={amount === value && !customAmount ? "default" : "outline"}
                onClick={() => handlePreset(value)}
              >
                ${value}
              </Button>
            ))}
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Custom amount (USD)</label>
            <Input
              type="number"
              placeholder="Enter amount in USD"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              min="1"
              step="0.01"
            />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm">
              You will receive: <strong>{formatUSD(selectedAmount)}</strong>
            </p>
            {method === "mpesa" && (
              <p className="text-sm text-muted-foreground mt-1">
                You will pay: <strong>{formatKES(kesAmount)}</strong>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* M-Pesa */}
          <div
            className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition ${
              method === "mpesa" ? "border-primary bg-primary/5" : ""
            }`}
            onClick={() => setMethod("mpesa")}
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
              <p className="text-sm text-muted-foreground">Kenya only • Instant</p>
            </div>
            <Smartphone className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Stripe */}
          <div
            className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition ${
              method === "stripe" ? "border-primary bg-primary/5" : ""
            }`}
            onClick={() => setMethod("stripe")}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded flex items-center justify-center text-white text-xs font-bold">
              Card
            </div>
            <div className="flex-1">
              <p className="font-medium">Credit / Debit Card</p>
              <p className="text-sm text-muted-foreground">Visa, Mastercard (Stripe)</p>
            </div>
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* PayPal */}
          <div
            className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition ${
              method === "paypal" ? "border-primary bg-primary/5" : ""
            }`}
            onClick={() => setMethod("paypal")}
          >
            <div className="w-10 h-10 flex items-center justify-center font-bold">
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
            onClick={() => setMethod("crypto")}
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
        </CardContent>
      </Card>

      {/* M-Pesa Phone Input */}
      {method === "mpesa" && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <label className="text-sm font-medium">M-Pesa Phone Number</label>
            <Input
              type="tel"
              placeholder="0712345678 or 254712345678"
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
            message.includes("successfully")
              ? "bg-green-50 text-green-700 dark:bg-green-900/20"
              : "bg-muted"
          }`}
        >
          {message}
        </div>
      )}

      <Button
        className="w-full h-12 text-base"
        onClick={handlePay}
        disabled={processing || selectedAmount < 1}
      >
        {getButtonText()}
      </Button>
    </div>
  );
}