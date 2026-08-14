"use client";

export const dynamic = "force-dynamic";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Wallet, Plus, ShoppingCart, History, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState(0); // We will connect this to database later

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/20 py-10">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user.displayName || user.email}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Wallet Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <p className="text-blue-100 mb-1 flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Available Balance
                  </p>
                  <h2 className="text-4xl font-bold">
                    ${balance.toFixed(2)}
                  </h2>
                </div>
                <div className="flex gap-3">
                  <Link href="/dashboard/add-funds">
                    <Button size="lg" variant="secondary" className="rounded-full">
                      <Plus className="h-5 w-5 mr-2" />
                      Add Funds
                    </Button>
                  </Link>
                  <Link href="/dashboard/services">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 rounded-full">
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      New Order
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <Link href="/dashboard/services">
            <Card className="hover:shadow-lg transition cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <ShoppingCart className="h-10 w-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-lg">Place New Order</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Buy followers, likes, views & more
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/orders">
            <Card className="hover:shadow-lg transition cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <History className="h-10 w-10 text-purple-600 mb-4" />
                <h3 className="font-semibold text-lg">Order History</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Track all your past orders
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/add-funds">
            <Card className="hover:shadow-lg transition cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Wallet className="h-10 w-10 text-green-600 mb-4" />
                <h3 className="font-semibold text-lg">Add Funds</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  M-Pesa • Stripe • PayPal • Crypto
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <p>No orders yet.</p>
              <Link href="/dashboard/services" className="text-primary hover:underline mt-2 inline-block">
                Place your first order →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}