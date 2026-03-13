"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const dynamic = "force-dynamic";

export default function TestPage() {
  const [prompt, setPrompt] = useState("A simple minimalist logo for a coffee shop called 'Bean There', flat design, warm brown colors");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/test/logo-generation", {
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
            <CardTitle>🧪 Image Generation Test</CardTitle>
            <CardDescription>
              Simple test to verify the Google AI image generation is working
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              {loading ? "Generating..." : "Generate Image"}
            </Button>

            {loading && (
              <div className="text-center py-8 text-gray-600">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mr-2" />
                Generating image... (this may take 10-30 seconds)
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">❌ Error</h3>
                <p className="text-red-700">{error}</p>
                {result?.details && (
                  <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                )}
              </div>
            )}

            {result?.success && result.imageUrl && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-4">✅ Success!</h3>
                <p className="text-green-700 mb-4">
                  Generated in {result.duration}ms
                </p>
                <div className="border rounded-lg overflow-hidden bg-white">
                  <img 
                    src={result.imageUrl} 
                    alt="Generated logo"
                    className="w-full max-w-md mx-auto"
                  />
                </div>
                <div className="mt-4">
                  <Label>Image URL (first 100 chars):</Label>
                  <Input 
                    value={result.imageUrl.substring(0, 100) + "..."} 
                    readOnly 
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {result && !result.success && result.debug && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Debug Info</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(result.debug, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to use this test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>1. Make sure you have a Google AI API key in your <code>.env.local</code> file:</p>
            <pre className="bg-gray-100 p-2 rounded">
              GENKIT_API_KEY=your_key_here
            </pre>
            <p>2. Click "Generate Image" above</p>
            <p>3. Check the browser console and server terminal for detailed logs</p>
            <p>4. If it fails, the error details will show here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
