"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LeaderboardAd, NativeAd, SkyscraperAd } from "@/components/ads/AdSlots";

type ServiceItem = {
  id: number;
  name: string;
  type: string;
  category: string;
  min: number;
  max: number;
  refill: boolean;
  cancel: boolean;
  rate: number;
  desc: string;
};

export default function ServicesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);
  const [balance, setBalance] = useState(0);

  const [selected, setSelected] = useState<ServiceItem | null>(null);
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [ordering, setOrdering] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      setBalance(snap.exists() ? Number(snap.data().balance || 0) : 0);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    const load = async () => {
      setFetching(true);
      try {
        const res = await fetch("/api/services");
        const data = await res.json();
        if (!data.success) {
          setError(data.error || "Could not load services");
          return;
        }
        setServices(data.services || []);
        setCategories(data.categories || []);
      } catch {
        setError("Could not load services");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((s) => {
      const catOk = category === "All" || s.category === category;
      const text = `${s.name} ${s.category} ${s.type}`.toLowerCase();
      return catOk && (!q || text.includes(q));
    });
  }, [services, search, category]);

  const qtyNum = Number(quantity) || 0;
  const orderTotal =
    selected && qtyNum > 0
      ? Number(((selected.rate * qtyNum) / 1000).toFixed(4))
      : 0;

  const handleOrder = async () => {
    if (!user || !selected) return;
    setMessage("");

    if (!link.trim()) {
      setMessage("Enter the profile or post link");
      return;
    }
    if (qtyNum < selected.min || qtyNum > selected.max) {
      setMessage(`Quantity must be between ${selected.min} and ${selected.max}`);
      return;
    }
    if (balance < orderTotal) {
      setMessage("Insufficient wallet balance. Add funds first.");
      return;
    }

    setOrdering(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          serviceId: selected.id,
          link: link.trim(),
          quantity: qtyNum,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setMessage(data.error || "Could not place order");
        return;
      }
      setMessage(
        `Order placed. ${formatUSD(data.chargeUSD)} deducted from your wallet.`
      );
      setLink("");
      setQuantity("");
      setSelected(null);
    } catch {
      setMessage("Could not place order");
    } finally {
      setOrdering(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push("/dashboard")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Services</h1>
          <p className="text-muted-foreground">
            Choose a service and pay from your wallet.
          </p>
        </div>
        <p className="text-sm font-medium">
          Wallet: <span className="text-emerald-600">{formatUSD(balance)}</span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Instagram, TikTok, YouTube..."
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm sm:w-72"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="All">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg text-sm bg-red-50 text-red-700 dark:bg-red-900/20">
          {error}
        </div>
      )}

      {selected && (
        <Card className="mb-6 border-primary">
          <CardHeader>
            <CardTitle className="text-lg">{selected.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{selected.category}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Link</label>
              <Input
                className="mt-2"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Example: https://instagram.com/username
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Quantity</label>
              <Input
                className="mt-2"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onWheel={(e) => e.currentTarget.blur()}
                min={selected.min}
                max={selected.max}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Min {selected.min.toLocaleString()} · Max{" "}
                {selected.max.toLocaleString()}
              </p>
            </div>
            <p className="text-sm">
              You will pay: <strong>{formatUSD(orderTotal)}</strong>
            </p>
            {message && (
              <p
                className={`text-sm ${
                  message.toLowerCase().includes("placed")
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}
            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={handleOrder}
                disabled={ordering}
              >
                {ordering ? "Placing order…" : "Pay from wallet"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelected(null);
                  setMessage("");
                }}
              >
                Cancel
              </Button>
            </div>
            <div className="pt-2 flex justify-center overflow-x-auto">
              <LeaderboardAd />
            </div>
          </CardContent>
        </Card>
      )}

      {!selected && (
        <div className="mb-6 flex justify-center overflow-x-auto">
          <LeaderboardAd />
        </div>
      )}

      {fetching ? (
        <p className="text-muted-foreground">Loading services…</p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Showing {Math.min(filtered.length, 200)} of {services.length}{" "}
            services
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_160px] gap-4 items-start">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.slice(0, 200).map((s) => (
                <Card key={s.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base leading-snug">
                      {s.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{s.category}</p>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>
                      Price: <strong>{formatUSD(s.rate)}</strong> / 1,000
                    </p>
                    <p className="text-muted-foreground">
                      Min {s.min.toLocaleString()} · Max {s.max.toLocaleString()}
                      {s.refill ? " · Refill" : ""}
                    </p>
                    <Button className="w-full mt-2" onClick={() => {
                      setSelected(s);
                      setQuantity(String(s.min));
                      setMessage("");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}>
                      Select
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-center">
              <SkyscraperAd />
            </div>
          </div>
          <div className="mt-8">
            <NativeAd />
          </div>
        </>
      )}
    </div>
  );
}