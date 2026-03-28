"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Loader2, AlertCircle } from "lucide-react";

interface OrderData {
  id: number;
  tier: string;
  status: string;
  customerEmail: string;
  amount: number | null;
  paymentStatus: string;
}

const TIER_NAMES: Record<string, string> = {
  basic: "Starter",
  pro: "Professional",
  premium: "Enterprise",
};

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(
          `/api/orders?stripeSessionId=${encodeURIComponent(sessionId)}`
        );

        if (response.ok) {
          const data = await response.json();
          setOrder(data);
          setLoading(false);
        } else if (response.status === 404) {
          // Webhook hasn't processed yet — keep polling
          setPollCount((prev) => prev + 1);
          if (pollCount >= 10) {
            // 30 seconds of polling (3s intervals)
            setError(
              "Your payment was successful, but we're still processing your order. You'll receive an email shortly."
            );
            setLoading(false);
          }
        } else {
          setError("Failed to fetch order details");
          setLoading(false);
        }
      } catch {
        setError("Failed to connect to server");
        setLoading(false);
      }
    };

    // Initial fetch
    fetchOrder();

    // Poll every 3 seconds if order not found yet
    const interval = setInterval(() => {
      if (!order && !error && pollCount < 10) {
        fetchOrder();
      } else {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [sessionId, pollCount, order, error]);

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Invalid Session
          </h1>
          <p className="text-slate-600 mb-6">
            No session ID was provided. Please try again from the pricing page.
          </p>
          <Button onClick={() => (window.location.href = "/tiers")}>
            View Pricing
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Processing Your Payment
          </h1>
          <p className="text-slate-600">
            Please wait while we confirm your order...
          </p>
        </Card>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Payment Processing
          </h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <Button onClick={() => (window.location.href = "/")}>
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-slate-600">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-slate-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Order Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Order ID</span>
                <span className="font-medium text-slate-900">#{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tier</span>
                <span className="font-medium text-slate-900">
                  {TIER_NAMES[order.tier] || order.tier}
                </span>
              </div>
              {order.amount && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Amount</span>
                  <span className="font-medium text-slate-900">
                    ${(order.amount / 100).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-600">Status</span>
                <span className="font-medium text-green-600 capitalize">
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* What's Next */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            What&apos;s Next?
          </h2>
          <ol className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </span>
              <span className="text-slate-700">
                We&apos;re processing your order and generating your logo
                designs
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </span>
              <span className="text-slate-700">
                You&apos;ll receive an email with your dashboard link to review
                your logos
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </span>
              <span className="text-slate-700">
                Select your favorite logo and we&apos;ll create your complete
                brand kit
              </span>
            </li>
          </ol>
        </div>

        {/* CTA */}
        <Button
          onClick={() => (window.location.href = "/")}
          className="w-full"
          size="lg"
        >
          Return to Home
        </Button>
      </Card>
    </div>
  );
}
