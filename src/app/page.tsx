"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ArrowRight,
  Music2,
  Play,
  Users,
  Hash,
  Zap,
  Shield,
  CreditCard,
} from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-10 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-72 h-72 md:w-96 md:h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 px-4 py-1.5 text-sm" variant="secondary">
              🚀 Trusted by thousands of creators
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6"
          >
            Get{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              More Followers
            </span>
            <br />
            Instantly
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Real followers, likes & views for Instagram, TikTok, YouTube & X.
            <br className="hidden sm:block" />
            Pay easily with <strong>M-Pesa</strong>, Cards, PayPal or Crypto.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/login">
              <Button size="lg" className="h-12 sm:h-14 px-8 text-base sm:text-lg rounded-full w-full sm:w-auto">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/services">
              <Button
                size="lg"
                variant="outline"
                className="h-12 sm:h-14 px-8 text-base sm:text-lg rounded-full w-full sm:w-auto"
              >
                View Services
              </Button>
            </Link>
          </motion.div>

          {/* Platforms */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-6 sm:gap-8 mt-14 text-muted-foreground text-sm sm:text-base"
          >
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Instagram
            </div>
            <div className="flex items-center gap-2">
              <Music2 className="h-5 w-5" /> TikTok
            </div>
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5" /> YouTube
            </div>
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5" /> X
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16"
          >
            Why creators love MoreFollowers
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: <Zap className="h-8 w-8 text-blue-500" />,
                title: "Lightning Fast",
                description: "Most orders start within minutes and finish in a few hours.",
              },
              {
                icon: <Shield className="h-8 w-8 text-green-500" />,
                title: "100% Safe",
                description: "We never ask for your password. Completely risk-free.",
              },
              {
                icon: <CreditCard className="h-8 w-8 text-purple-500" />,
                title: "Easy Payments",
                description: "M-Pesa, Cards, PayPal and Crypto — all supported.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-0 shadow-md hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 md:p-8 text-center">
                    <div className="mb-5 flex justify-center">{feature.icon}</div>
                    <h3 className="text-lg md:text-xl font-semibold mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm md:text-base">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Payments Accepted Section */}
      <section className="py-16 md:py-20">
        <div className="container px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              We Accept Multiple Payment Methods
            </h2>
            <p className="text-muted-foreground">
              Fast, secure and convenient payments for everyone
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 max-w-5xl mx-auto">
            {/* M-Pesa */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card hover:shadow-md transition">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                <span className="font-bold text-green-600 text-sm">M-PESA</span>
              </div>
              <span className="text-sm font-medium">M-Pesa</span>
            </div>

            {/* Visa */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card hover:shadow-md transition">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                <span className="font-bold text-blue-700 text-sm">VISA</span>
              </div>
              <span className="text-sm font-medium">Visa</span>
            </div>

            {/* Mastercard */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card hover:shadow-md transition">
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-3">
                <span className="font-bold text-orange-600 text-xs">MC</span>
              </div>
              <span className="text-sm font-medium">Mastercard</span>
            </div>

            {/* PayPal */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card hover:shadow-md transition">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                <span className="font-bold text-blue-600 text-xs">PayPal</span>
              </div>
              <span className="text-sm font-medium">PayPal</span>
            </div>

            {/* Bitcoin */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card hover:shadow-md transition">
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-3">
                <span className="font-bold text-orange-500 text-lg">₿</span>
              </div>
              <span className="text-sm font-medium">Bitcoin</span>
            </div>

            {/* USDT */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card hover:shadow-md transition">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                <span className="font-bold text-green-600 text-xs">USDT</span>
              </div>
              <span className="text-sm font-medium">USDT</span>
            </div>

            {/* BNB */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card hover:shadow-md transition">
              <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-3">
                <span className="font-bold text-yellow-600 text-xs">BNB</span>
              </div>
              <span className="text-sm font-medium">BNB</span>
            </div>

            {/* More Crypto */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card hover:shadow-md transition">
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
                <span className="font-bold text-purple-600 text-xs">+</span>
              </div>
              <span className="text-sm font-medium">More Crypto</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24">
        <div className="container px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Ready to grow your account?
            </h2>
            <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-xl mx-auto">
              Create a free account in seconds and start getting more followers today.
            </p>
            <Link href="/login">
              <Button size="lg" className="h-12 sm:h-14 px-10 text-base sm:text-lg rounded-full">
                Create Free Account
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}