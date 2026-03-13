"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

type Provider = "pollinations" | "huggingface" | "google";

export default function TestPage() {
  const [prompt, setPrompt] = useState("A simple minimalist logo for a coffee shop called 'Bean There', flat design, warm brown colors");
  const [provider, setProvider] = useState<Provider>("pollinations");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const endpoints = {
      pollinations: "/api/test/logo-generation-pollinations",
      huggingface: "/api/test/logo-generation-huggingface",
      google: "/api/test/logo-generation",
    };

    try {
      const response = await fetch(endpoints[provider], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      console.log("Response:", data);

      if (data.success) {
        setResult(data);
      } else {
        setError(data.details?.message || data.error || "Unknown error");
        setResult(data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🎨 Free Image Generation Test</CardTitle>
            <CardDescription>
              Test different free AI image generation providers. No credit card required!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <Tabs value={provider} onValueChange={(v) => setProvider(v as Provider)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pollinations">
                  Pollinations.ai
                  <Badge variant="secondary" className="ml-2 text-xs">No API Key</Badge>
                </TabsTrigger>
                <TabsTrigger value="huggingface">
                  Hugging Face
                  <Badge variant="secondary" className="ml-2 text-xs">Free API</Badge>
                </TabsTrigger>
                <TabsTrigger value="google">
                  Google AI
                  <Badge variant="secondary" className="ml-2 text-xs">Free Tier</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pollinations" className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800">✅ Recommended for Quick Testing</h4>
                  <ul className="text-sm text-green-700 mt-2 space-y-1">
                    <li>• No API key required</li>
                    <li>• No signup needed</li>
                    <li>• Unlimited generations</li>
                    <li>• ⚠️ First load takes 5-10 seconds</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="huggingface" className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800">🔧 Higher Quality (Setup Required)</h4>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• Better image quality</li>
                    <li>• 1,000 requests/month free</li>
                    <li>• Multiple models available</li>
                    <li>• ⚠️ Requires free API key from huggingface.co</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="google" className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-800">⚠️ May Not Work on Free Tier</h4>
                  <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                    <li>• Tries multiple models automatically</li>
                    <li>• Requires Google AI Studio API key</li>
                    <li>• Image generation may be restricted</li>
                    <li>• Good for testing if you have paid access</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Describe the logo you want to generate..."
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <div className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  Generating with {provider}...
                </>
              ) : (
                `Generate with ${provider === "pollinations" ? "Pollinations.ai" : provider === "huggingface" ? "Hugging Face" : "Google AI"}`
              )}
            </Button>

            {loading && provider === "pollinations" && (
              <div className="text-center py-4 text-amber-600 bg-amber-50 rounded-lg">
                ⏳ Pollinations generates images on-the-fly. First load may take 10-15 seconds...
              </div>
            )}

            {loading && provider === "huggingface" && (
              <div className="text-center py-4 text-blue-600 bg-blue-50 rounded-lg">
                ⏳ Hugging Face models may need warmup if idle (20-30 seconds)...
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">❌ Error</h3>
                <p className="text-red-700">{error}</p>
                {result?.setup && (
                  <div className="mt-3 p-3 bg-red-100 rounded text-sm">
                    <strong>Setup required:</strong>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      <li>{result.setup.instructions}</li>
                      <li>{result.setup.step2}</li>
                      <li>{result.setup.step3}</li>
                    </ol>
                  </div>
                )}
                {result?.errors && (
                  <div className="mt-3">
                    <strong className="text-red-800">Errors by Model:</strong>
                    <div className="mt-1 space-y-1 max-h-40 overflow-auto">
                      {Object.entries(result.errors).map(([model, err]) => (
                        <div key={model} className="text-xs text-red-600">
                          <strong>{model}:</strong> {String(err).substring(0, 80)}...
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {result?.success && result.imageUrl && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-4">✅ Success!</h3>
                <p className="text-green-700 mb-2">
                  {result.duration && `Generated in ${result.duration}ms`}
                  {result.note && (
                    <span className="text-green-600 text-sm block mt-1">{result.note}</span>
                  )}
                </p>
                {result.provider && (
                  <p className="text-green-700 mb-4 text-sm">
                    <strong>Provider:</strong> {result.provider}
                    {result.modelUsed && ` | Model: ${result.modelUsed}`}
                    {result.model && ` | Model: ${result.model}`}
                  </p>
                )}
                <div className="border rounded-lg overflow-hidden bg-white">
                  <img 
                    src={result.imageUrl} 
                    alt="Generated logo"
                    className="w-full max-w-md mx-auto"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>1. <strong>Test with Pollinations.ai first</strong> - no setup required</p>
            <p>2. If quality is good enough, we can use it for the full app</p>
            <p>3. For higher quality, get a free Hugging Face token</p>
            <p>4. Once working, I&apos;ll update all the AI flows to use the working provider</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
