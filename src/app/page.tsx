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
  Globe,
  Headphones,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <section className="relative py-20 md:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-72 h-72 md:w-96 md:h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 px-4 py-1.5 text-sm" variant="secondary">
              Trusted by thousands of creators worldwide
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
            Real followers, likes, views, plays and traffic for Instagram,
            TikTok, YouTube, Spotify, Facebook, X and more.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-14"
          >
            <Link href="/login">
              <Button
                size="lg"
                className="h-12 sm:h-14 px-8 text-base sm:text-lg rounded-full w-full sm:w-auto"
              >
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
                View All Services
              </Button>
            </Link>
          </motion.div>

          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="max-w-4xl mx-auto"
          >
            <p className="text-sm text-muted-foreground mb-4 font-medium">
              We accept
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border rounded-full px-4 py-2 shadow-sm">
                <Image
                  src="/payments/mpesa.png"
                  alt="M-Pesa"
                  width={28}
                  height={28}
                  className="object-contain"
                />
                <span className="text-sm font-medium">M-Pesa</span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border rounded-full px-4 py-2 shadow-sm">
                <span className="text-sm font-medium">Visa</span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border rounded-full px-4 py-2 shadow-sm">
                <span className="text-sm font-medium">Mastercard</span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border rounded-full px-4 py-2 shadow-sm">
                <span className="text-sm font-medium">PayPal</span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border rounded-full px-4 py-2 shadow-sm">
                <span className="text-sm font-medium">Crypto</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-10 border-y bg-muted/20">
        <div className="container px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-muted-foreground">
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
              <Headphones className="h-5 w-5" /> Spotify
            </div>
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5" /> X
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" /> Website Traffic
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why creators choose MoreFollowers
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Fast delivery, real results, and secure payments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="h-8 w-8 text-blue-500" />,
                title: "Lightning Fast",
                description:
                  "Most orders start within minutes and complete quickly.",
              },
              {
                icon: <Shield className="h-8 w-8 text-green-500" />,
                title: "100% Safe",
                description:
                  "We never ask for your password. Completely risk-free.",
              },
              {
                icon: <CreditCard className="h-8 w-8 text-purple-500" />,
                title: "Multiple Payments",
                description:
                  "M-Pesa, Cards, PayPal and Crypto supported worldwide.",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-0 shadow-md hover:shadow-lg transition">
                  <CardContent className="p-8 text-center">
                    <div className="mb-5 flex justify-center">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Popular Services
            </h2>
            <p className="text-muted-foreground">
              We offer services across all major platforms
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Instagram", icon: <Users className="h-6 w-6" /> },
              { name: "TikTok", icon: <Music2 className="h-6 w-6" /> },
              { name: "YouTube", icon: <Play className="h-6 w-6" /> },
              { name: "Spotify", icon: <Headphones className="h-6 w-6" /> },
              { name: "Website Traffic", icon: <Globe className="h-6 w-6" /> },
              { name: "X (Twitter)", icon: <Hash className="h-6 w-6" /> },
            ].map((item) => (
              <Card
                key={item.name}
                className="hover:shadow-md transition cursor-pointer"
              >
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    {item.icon}
                  </div>
                  <span className="font-medium text-sm">{item.name}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container px-4 max-w-4xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create Account",
                desc: "Sign up free with Google or email",
              },
              {
                step: "2",
                title: "Add Funds",
                desc: "Pay with M-Pesa, Card, PayPal or Crypto",
              },
              {
                step: "3",
                title: "Place Order",
                desc: "Choose service and watch your account grow",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to grow your account?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of creators using MoreFollowers every day.
            </p>
            <Link href="/login">
              <Button
                size="lg"
                className="h-12 sm:h-14 px-10 text-base sm:text-lg rounded-full"
              >
                Create Free Account
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}