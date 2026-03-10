"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Clock, FileText, Mail } from "lucide-react";

export default function ConfirmationPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a full implementation, fetch order details from API
    // For now, just show confirmation
    setLoading(false);
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Order Received! 🎉
          </h1>
          <p className="text-xl text-slate-600">
            Thank you for choosing us. Your brand journey is about to begin.
          </p>
        </div>

        {/* Order Details Card */}
        <Card className="p-8 mb-8 shadow-lg">
          <div className="space-y-6">
            {/* Order ID */}
            <div className="pb-6 border-b border-slate-200">
              <p className="text-sm font-semibold text-slate-600 uppercase mb-2">
                Order ID
              </p>
              <p className="text-2xl font-mono font-bold text-slate-900">
                {orderId}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Save this ID for your records
              </p>
            </div>

            {/* Next Steps Timeline */}
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-600 uppercase mb-4">
                What Happens Next
              </p>

              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-600 text-white">
                      1
                    </div>
                  </div>
                  <div className="pt-1">
                    <p className="font-semibold text-slate-900">
                      We Review Your Order
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      Our team will review your brand requirements and begin the design
                      process immediately.
                    </p>
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 2-4 hours
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white">
                      2
                    </div>
                  </div>
                  <div className="pt-1">
                    <p className="font-semibold text-slate-900">
                      Logo Generation & Mockups
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      We generate 4 unique logo variants and showcase them on 3 different
                      mockup templates (letterhead, t-shirt, business card) for your
                      review.
                    </p>
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 4-8 hours
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white">
                      3
                    </div>
                  </div>
                  <div className="pt-1">
                    <p className="font-semibold text-slate-900">
                      Quality Review & Selection
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      We review the designs for quality and send you a link to select your
                      favorite variant and view it on the mockups.
                    </p>
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 2-4 hours
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white">
                      4
                    </div>
                  </div>
                  <div className="pt-1">
                    <p className="font-semibold text-slate-900">
                      Assets & Dashboard Access
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      Once approved, you'll get immediate access to your complete brand
                      package including logos, guides, and assets via your personal dashboard.
                    </p>
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 24-48 hours total
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="pt-6 border-t border-slate-200 bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-slate-900 mb-3">
                📧 Keep an eye on your email
              </p>
              <p className="text-sm text-slate-700">
                We'll send updates to the email associated with your order. Check your
                spam folder if you don't see our messages.
              </p>
            </div>
          </div>
        </Card>

        {/* Additional Info */}
        <Card className="p-6 mb-8 bg-slate-50">
          <div className="space-y-4">
            <div className="flex gap-3">
              <FileText className="h-5 w-5 text-slate-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">Download Your Checklist</p>
                <p className="text-sm text-slate-600 mt-1">
                  We've prepared a brand questionnaire checklist you can reference.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Mail className="h-5 w-5 text-slate-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">Need Support?</p>
                <p className="text-sm text-slate-600 mt-1">
                  Email us at support@logogenius.com with your order ID for any questions.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full" size="lg">
              Back to Home
            </Button>
          </Link>
          <Link href="/tiers" className="flex-1">
            <Button className="w-full" size="lg">
              Create Another Order
            </Button>
          </Link>
        </div>

        {/* Timeline Summary */}
        <div className="mt-12 p-6 bg-white rounded-lg border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Timeline Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Order received:</span>
              <span className="font-medium text-slate-900">Now</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Design generation:</span>
              <span className="font-medium text-slate-900">2-6 hours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Quality review:</span>
              <span className="font-medium text-slate-900">2-4 hours</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-slate-200">
              <span className="text-slate-600">Total time to delivery:</span>
              <span className="font-bold text-slate-900">24-48 hours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
