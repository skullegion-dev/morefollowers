"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Wallet, ShoppingCart, History, LogOut } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState<number>(0);
  const [balanceLoading, setBalanceLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Load + live-update wallet balance from Firestore users/{uid}.balance
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
          const data = snap.data();
          setBalance(Number(data.balance || 0));
        } else {
          setBalance(0);
        }
        setBalanceLoading(false);
      },
      (err) => {
        console.error("Balance listen error:", err);
        // Fallback one-time read
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
        {/* Wallet Card */}
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

        {/* Place Order */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="h-5 w-5" />
              Place Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              Coming soon
            </Button>
          </CardContent>
        </Card>

        {/* Order History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-5 w-5" />
              Order History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No orders yet</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}