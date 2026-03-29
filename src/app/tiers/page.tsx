"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Check,
  Zap,
  Crown,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface TierOption {
  id: "basic" | "pro" | "premium";
  name: string;
  displayName: string;
  description: string;
  price: string;
  icon: React.ReactNode;
  features: string[];
  highlighted: boolean;
}

const TIER_OPTIONS: TierOption[] = [
  {
    id: "basic",
    name: "Starter",
    displayName: "Starter",
    description: "Perfect for getting started",
    price: "$29",
    icon: <Sparkles className="h-6 w-6" />,
    features: [
      "AI-Generated Logo (4 variants)",
      "Brand Archetype Selection",
      "Basic Brand Guide",
      "Logo Mockups (3 templates)",
      "24-48 hour turnaround",
    ],
    highlighted: false,
  },
  {
    id: "pro",
    name: "Professional",
    displayName: "Professional",
    description: "Most popular for growing businesses",
    price: "$49",
    icon: <Zap className="h-6 w-6" />,
    features: [
      "Everything in Starter +",
      "Comprehensive Brand Guide",
      "Color Palette with Swatches",
      "Typography Guide",
      "PDF Brand Guide Export",
      "Social Media Templates (10 platforms)",
      "Email Support",
    ],
    highlighted: true,
  },
  {
    id: "premium",
    name: "Enterprise",
    displayName: "Enterprise",
    description: "Complete brand ecosystem",
    price: "$99",
    icon: <Crown className="h-6 w-6" />,
    features: [
      "Everything in Professional +",
      "Photo-Realistic Product Mockups",
      "Premium Social Media Assets",
      "Favicon & App Icon",
      "Priority Support",
      "2 Revision Rounds",
    ],
    highlighted: false,
  },
];

export default function TiersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleStartTier(tierId: "basic" | "pro" | "premium") {
    setIsLoading(true);
    setSelectedTier(tierId);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tier: tierId }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: error.error || "Failed to start checkout",
        });
        return;
      }

      const data = await response.json();
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Get a professional AI-powered brand identity tailored to your business.
            Each tier includes customized logo generation, brand guidelines, and design assets.
          </p>
        </div>

        {/* Tier Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {TIER_OPTIONS.map((tier) => (
            <Card
              key={tier.id}
              className={`relative flex flex-col transition-all duration-300 ${
                tier.highlighted
                  ? "md:scale-105 shadow-2xl border-2 border-blue-500 bg-blue-50"
                  : "shadow-lg hover:shadow-xl"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8 flex-1 flex flex-col">
                {/* Icon and Name */}
                <div className="mb-4 flex items-center gap-3">
                  <div className={tier.highlighted ? "text-blue-600" : "text-slate-600"}>
                    {tier.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {tier.displayName}
                    </h2>
                    <p className="text-sm text-slate-600">{tier.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900">
                    {tier.price}
                  </span>
                  <span className="text-slate-600 ml-2">one-time</span>
                </div>

                {/* Features */}
                <div className="mb-8 flex-1">
                  <p className="text-sm font-semibold text-slate-900 mb-4">
                    What's Included:
                  </p>
                  <ul className="space-y-3">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handleStartTier(tier.id)}
                  disabled={isLoading && selectedTier === tier.id}
                  className={`w-full ${
                    tier.highlighted
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-slate-200 hover:bg-slate-300 text-slate-900"
                  }`}
                  size="lg"
                  onMouseEnter={() => setSelectedTier(tier.id)}
                  onMouseLeave={() => setSelectedTier(null)}
                >
                  {isLoading && selectedTier === tier.id ? (
                    "Redirecting to Checkout..."
                  ) : (
                    <>
                      Buy {tier.displayName}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Detailed Comparison
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-300">
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">
                    Feature
                  </th>
                  {TIER_OPTIONS.map((tier) => (
                    <th
                      key={tier.id}
                      className="px-6 py-4 text-center font-semibold text-slate-900"
                    >
                      {tier.displayName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="px-6 py-4 font-medium text-slate-900">Logo Variants</td>
                  <td className="px-6 py-4 text-center text-slate-700">4 variants</td>
                  <td className="px-6 py-4 text-center text-slate-700">4 variants</td>
                  <td className="px-6 py-4 text-center text-slate-700">4 variants</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="px-6 py-4 font-medium text-slate-900">Logo Mockups</td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-600 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="px-6 py-4 font-medium text-slate-900">Brand Guide</td>
                  <td className="px-6 py-4 text-center text-slate-700">Basic</td>
                  <td className="px-6 py-4 text-center text-slate-700">Comprehensive</td>
                  <td className="px-6 py-4 text-center text-slate-700">Comprehensive</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="px-6 py-4 font-medium text-slate-900">PDF Export</td>
                  <td className="px-6 py-4 text-center text-slate-500">—</td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-600 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="px-6 py-4 font-medium text-slate-900">Figma Template</td>
                  <td className="px-6 py-4 text-center text-slate-500">—</td>
                  <td className="px-6 py-4 text-center text-slate-500">—</td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-600 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-slate-900">Revisions</td>
                  <td className="px-6 py-4 text-center text-slate-500">—</td>
                  <td className="px-6 py-4 text-center text-slate-700">1 round</td>
                  <td className="px-6 py-4 text-center text-slate-700">2 rounds</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Can I upgrade my tier later?
              </h3>
              <p className="text-slate-700">
                Yes! You can upgrade from Basic to Pro or Premium at any time. Contact support
                for pricing details.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                What's included in the brand guide?
              </h3>
              <p className="text-slate-700">
                All tiers include a guide covering logo usage, colors, and basic branding.
                Pro and Premium include comprehensive 12+ section guides with typography,
                imagery, voice guidelines, and more.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                How long does it take?
              </h3>
              <p className="text-slate-700">
                Most orders are completed within 24-48 hours. Premium orders with extensive
                customization may take up to 3 business days.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-slate-700">
                We offer a 7-day satisfaction guarantee. If you're not happy with your order,
                we'll provide one full revision round at no extra cost.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
