"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Wallet, ShoppingCart, History, LogOut } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type OrderItem = {
  id: string;
  serviceName?: string;
  link?: string;
  quantity?: number;
  chargeUSD?: number;
  status?: string;
  providerOrderId?: string;
  startCount?: number | null;
  remains?: number | null;
  createdAt?: { seconds?: number } | null;
};

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState<number>(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [ordersError, setOrdersError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) {
      setBalance(0);
      setBalanceLoading(false);
      return;
    }

    const userRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          setBalance(Number(snap.data().balance || 0));
        } else {
          setBalance(0);
        }
        setBalanceLoading(false);
      },
      (err) => {
        console.error("Balance listen error:", err);
        getDoc(userRef)
          .then((snap) => {
            if (snap.exists()) {
              setBalance(Number(snap.data().balance || 0));
            }
          })
          .finally(() => setBalanceLoading(false));
      }
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "orders"), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const items: OrderItem[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            serviceName: data.serviceName,
            link: data.link,
            quantity: data.quantity,
            chargeUSD: data.chargeUSD,
            status: data.status,
            providerOrderId: data.providerOrderId,
            startCount: data.startCount ?? null,
            remains: data.remains ?? null,
            createdAt: data.createdAt || null,
          };
        });

        items.sort((a, b) => {
          const aSec = a.createdAt?.seconds || 0;
          const bSec = b.createdAt?.seconds || 0;
          return bSec - aSec;
        });

        setOrders(items);
        setOrdersError("");
      },
      (err) => {
        console.error("Orders listen error:", err);
        setOrdersError(
          "Could not load order history. Check Firestore rules for the orders collection."
        );
      }
    );

    return () => unsubscribe();
  }, [user]);

  const refreshStatuses = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      await fetch("/api/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    refreshStatuses();
    const timer = setInterval(refreshStatuses, 30000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.displayName || user.email || "User"}
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Wallet Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {balanceLoading ? "…" : formatUSD(balance)}
              </p>
              <p className="text-sm opacity-80 mt-1">Available balance</p>
              <Button
                variant="secondary"
                className="mt-4 w-full"
                onClick={() => router.push("/dashboard/add-funds")}
              >
                Add Funds
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="h-5 w-5" />
              Place Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => router.push("/dashboard/services")}
            >
              Browse services
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-5 w-5" />
              Order History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {orders.length} order{orders.length === 1 ? "" : "s"}
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={refreshStatuses}
              disabled={refreshing}
            >
              {refreshing ? "Refreshing…" : "Refresh status"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
        </CardHeader>
        <CardContent>
          {ordersError && (
            <p className="text-sm text-red-600 mb-4">{ordersError}</p>
          )}

          {orders.length === 0 && !ordersError ? (
            <p className="text-sm text-muted-foreground">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-lg p-4 text-sm space-y-1"
                >
                  <div className="flex justify-between gap-3">
                    <p className="font-medium">{order.serviceName || "Service"}</p>
                    <p className="capitalize">{order.status || "unknown"}</p>
                  </div>
                  <p className="text-muted-foreground break-all">
                    {order.link}
                  </p>
                  <p>
                    Qty {Number(order.quantity || 0).toLocaleString()} ·{" "}
                    {formatUSD(Number(order.chargeUSD || 0))}
                  </p>
                  {(order.startCount != null || order.remains != null) && (
                    <p className="text-xs text-muted-foreground">
                      Start count: {order.startCount ?? "—"} · Remaining:{" "}
                      {order.remains ?? "—"}
                    </p>
                  )}
                  {order.providerOrderId && (
                    <p className="text-xs text-muted-foreground">
                      Provider ID: {order.providerOrderId}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}