"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const dynamic = "force-dynamic";

type Provider = "pollinations" | "huggingface" | "together" | "google";

const HUGGINGFACE_MODELS = [
  { value: "stabilityai/stable-diffusion-xl-base-1.0", label: "SDXL Base 1.0 (Best Quality)", desc: "Best overall quality, slower" },
  { value: "runwayml/stable-diffusion-v1-5", label: "SD v1.5 (Fast)", desc: "Good balance of speed and quality" },
  { value: "prompthero/openjourney", label: "Openjourney (Artistic)", desc: "Midjourney-style artistic images" },
  { value: "dreamlike-art/dreamlike-diffusion-1.0", label: "Dreamlike (Surreal)", desc: "Dreamy, artistic style" },
  { value: "CompVis/stable-diffusion-v1-4", label: "SD v1.4 (Reliable)", desc: "Stable, well-tested" },
];

export default function TestPage() {
  const [prompt, setPrompt] = useState("A simple minimalist logo for a coffee shop called 'Bean There', flat design, warm brown colors");
  const [provider, setProvider] = useState<Provider>("together");
  const [hfModel, setHfModel] = useState(HUGGINGFACE_MODELS[0].value);
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
      together: "/api/test/logo-generation-together",
      google: "/api/test/logo-generation",
    };

    try {
      const body: any = { prompt };
      if (provider === "huggingface") {
        body.model = hfModel;
      }
      
      const response = await fetch(endpoints[provider], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="together">
                  Together AI
                  <Badge className="ml-2 text-xs bg-green-500">RECOMMENDED</Badge>
                </TabsTrigger>
                <TabsTrigger value="huggingface">
                  Hugging Face
                  <Badge variant="destructive" className="ml-2 text-xs">Issues</Badge>
                </TabsTrigger>
                <TabsTrigger value="pollinations">
                  Pollinations
                  <Badge variant="secondary" className="ml-2 text-xs">No Key</Badge>
                </TabsTrigger>
                <TabsTrigger value="google">
                  Google AI
                  <Badge variant="secondary" className="ml-2 text-xs">Limited</Badge>
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
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-semibold text-orange-800">⚠️ Currently Unreliable</h4>
                  <p className="text-sm text-orange-700 mt-2">
                    Hugging Face has deprecated many free inference endpoints (410 errors).
                    The endpoint now tries multiple models automatically.
                  </p>
                  <p className="text-sm text-orange-700 mt-2 font-semibold">
                    💡 RECOMMENDATION: Use Together AI instead - much more reliable!
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800">🔧 If you still want to try:</h4>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• Will try 6 different models automatically</li>
                    <li>• 1,000 requests/month free</li>
                    <li>• ⚠️ Most models return 410 errors now</li>
                    <li>• Requires free API key from huggingface.co</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="together" className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800">💎 Most Reliable ($5 Free)</h4>
                  <ul className="text-sm text-purple-700 mt-2 space-y-1">
                    <li>• $5 free credit on signup (~2,500 images)</li>
                    <li>• No warmup time</li>
                    <li>• Very reliable API</li>
                    <li>• ⚠️ Requires signup at together.ai</li>
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
                  {provider === "pollinations" ? (
                    <div className="relative">
                      <img 
                        src={result.imageUrl} 
                        alt="Generated logo"
                        className="w-full max-w-md mx-auto"
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.classList.remove('opacity-0');
                        }}
                        style={{ opacity: 0, transition: 'opacity 0.5s' }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse" id="pollinations-loading">
                        <span className="text-gray-500">⏳ Loading image from Pollinations...</span>
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={result.imageUrl} 
                      alt="Generated logo"
                      className="w-full max-w-md mx-auto"
                    />
                  )}
                </div>
                {(provider === "pollinations" || provider === "together") && (
                  <p className="text-xs text-green-600 mt-2">
                    💡 Tip: If image doesn&apos;t appear immediately, wait a few seconds and refresh.
                  </p>
                )}
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
