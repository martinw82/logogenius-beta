"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  ImageIcon, 
  Shirt, 
  Share2, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Info
} from "lucide-react";

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
  duration?: number;
  provider?: string;
}

export default function ApiTestPage() {
  // Logo test state
  const [logoPrompt, setLogoPrompt] = useState("Professional minimalist logo for a coffee shop called 'Bean There', flat design, warm brown and cream colors, clean vector style");
  const [logoResult, setLogoResult] = useState<TestResult | null>(null);
  const [logoLoading, setLogoLoading] = useState(false);

  // Mockup test state
  const [mockupLogoUrl, setMockupLogoUrl] = useState("");
  const [mockupBusinessName, setMockupBusinessName] = useState("Test Company");
  const [mockupColors, setMockupColors] = useState("#2563eb, #1e40af, #f59e0b");
  const [mockupIndustry, setMockupIndustry] = useState("technology");
  const [mockupResult, setMockupResult] = useState<TestResult | null>(null);
  const [mockupLoading, setMockupLoading] = useState(false);

  // Social test state
  const [socialBusinessName, setSocialBusinessName] = useState("Test Company");
  const [socialColors, setSocialColors] = useState("#2563eb, #1e40af, #f59e0b");
  const [socialIndustry, setSocialIndustry] = useState("technology");
  const [socialTagline, setSocialTagline] = useState("Innovation for everyone");
  const [socialResult, setSocialResult] = useState<TestResult | null>(null);
  const [socialLoading, setSocialLoading] = useState(false);

  // Test Logo Generation
  const testLogoGeneration = async () => {
    setLogoLoading(true);
    setLogoResult(null);
    const startTime = Date.now();

    try {
      const response = await fetch("/api/test/single-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testType: "logo",
        }),
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (data.success) {
        setLogoResult({
          success: true,
          data: data.result,
          duration,
          provider: data.result?.provider,
        });
      } else {
        setLogoResult({
          success: false,
          error: data.error || "Unknown error",
          duration,
        });
      }
    } catch (err) {
      setLogoResult({
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch",
        duration: Date.now() - startTime,
      });
    } finally {
      setLogoLoading(false);
    }
  };

  // Test Mockup Generation
  const testMockupGeneration = async () => {
    setMockupLoading(true);
    setMockupResult(null);
    const startTime = Date.now();

    try {
      const response = await fetch("/api/test/single-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testType: "mockup",
          logoUrl: mockupLogoUrl || undefined,
        }),
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (data.success) {
        setMockupResult({
          success: true,
          data: data.result,
          duration,
        });
      } else {
        setMockupResult({
          success: false,
          error: data.error || "Unknown error",
          duration,
        });
      }
    } catch (err) {
      setMockupResult({
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch",
        duration: Date.now() - startTime,
      });
    } finally {
      setMockupLoading(false);
    }
  };

  // Test Social Generation
  const testSocialGeneration = async () => {
    setSocialLoading(true);
    setSocialResult(null);
    const startTime = Date.now();

    try {
      const response = await fetch("/api/test/single-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testType: "social",
        }),
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (data.success) {
        setSocialResult({
          success: true,
          data: data.result,
          duration,
        });
      } else {
        setSocialResult({
          success: false,
          error: data.error || "Unknown error",
          duration,
        });
      }
    } catch (err) {
      setSocialResult({
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch",
        duration: Date.now() - startTime,
      });
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🔧 API Component Testing</h1>
          <p className="text-gray-600">
            Test each generation API individually with single calls. Perfect for debugging and credit conservation.
          </p>
        </div>

        {/* Cost Info */}
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Credit-Efficient Testing</AlertTitle>
          <AlertDescription className="text-blue-700">
            Each test makes exactly <strong>one API call</strong>. Estimated costs: Logo ~$0.001 | Mockup ~$0.01-0.15 | Social ~$0.003
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="logo" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="logo" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              1. Logo Generation
            </TabsTrigger>
            <TabsTrigger value="mockup" className="flex items-center gap-2">
              <Shirt className="w-4 h-4" />
              2. Mockup Generation
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              3. Social Assets
            </TabsTrigger>
          </TabsList>

          {/* LOGO GENERATION TAB */}
          <TabsContent value="logo">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Test Logo Generation
                </CardTitle>
                <CardDescription>
                  Generates a single logo using the configured provider (Together AI by default)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logoPrompt">Prompt (Optional)</Label>
                  <Textarea
                    id="logoPrompt"
                    value={logoPrompt}
                    onChange={(e) => setLogoPrompt(e.target.value)}
                    rows={3}
                    placeholder="Describe the logo you want to generate..."
                  />
                  <p className="text-xs text-gray-500">
                    Uses a default test prompt if left empty
                  </p>
                </div>

                <Button 
                  onClick={testLogoGeneration} 
                  disabled={logoLoading}
                  className="w-full"
                >
                  {logoLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Logo...
                    </>
                  ) : (
                    <>Test Logo Generation</>
                  )}
                </Button>

                {/* Results */}
                {logoResult && (
                  <div className={`p-4 rounded-lg ${logoResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {logoResult.success ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <h3 className={`font-semibold ${logoResult.success ? 'text-green-800' : 'text-red-800'}`}>
                        {logoResult.success ? 'Success!' : 'Failed'}
                      </h3>
                      {logoResult.duration && (
                        <Badge variant="secondary" className="ml-auto">
                          {logoResult.duration}ms
                        </Badge>
                      )}
                    </div>

                    {logoResult.success && logoResult.data && (
                      <div className="space-y-3">
                        <p className="text-sm text-green-700">
                          <strong>Provider:</strong> {logoResult.provider}<br />
                          <strong>Model:</strong> {logoResult.data.model}
                        </p>
                        {logoResult.data.imageUrl && (
                          <div className="border rounded-lg overflow-hidden bg-white">
                            <img 
                              src={logoResult.data.imageUrl} 
                              alt="Generated logo"
                              className="w-full max-w-md mx-auto"
                            />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              if (logoResult.data?.imageUrl) {
                                setMockupLogoUrl(logoResult.data.imageUrl);
                              }
                            }}
                          >
                            Use for Mockup Test →
                          </Button>
                        </div>
                      </div>
                    )}

                    {!logoResult.success && logoResult.error && (
                      <p className="text-red-700 text-sm">{logoResult.error}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* MOCKUP GENERATION TAB */}
          <TabsContent value="mockup">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shirt className="w-5 h-5" />
                  Test Mockup Generation
                </CardTitle>
                <CardDescription>
                  Generates product mockups (t-shirt, mug, tote bag) using Dynamic Mockups API or AI fallback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800">Requires Logo URL</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    You need a logo image URL to test mockup generation. 
                    Generate a logo first, or paste a public URL below.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="mockupLogoUrl">Logo Image URL *</Label>
                  <Input
                    id="mockupLogoUrl"
                    value={mockupLogoUrl}
                    onChange={(e) => setMockupLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png or data:image/png;base64,..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mockupBusinessName">Business Name</Label>
                    <Input
                      id="mockupBusinessName"
                      value={mockupBusinessName}
                      onChange={(e) => setMockupBusinessName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mockupIndustry">Industry</Label>
                    <Input
                      id="mockupIndustry"
                      value={mockupIndustry}
                      onChange={(e) => setMockupIndustry(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mockupColors">Brand Colors (comma-separated)</Label>
                  <Input
                    id="mockupColors"
                    value={mockupColors}
                    onChange={(e) => setMockupColors(e.target.value)}
                    placeholder="#2563eb, #1e40af, #f59e0b"
                  />
                </div>

                <Button 
                  onClick={testMockupGeneration} 
                  disabled={mockupLoading || !mockupLogoUrl}
                  className="w-full"
                >
                  {mockupLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Mockups...
                    </>
                  ) : (
                    <>Test Mockup Generation</>
                  )}
                </Button>

                {!mockupLogoUrl && (
                  <p className="text-xs text-amber-600 text-center">
                    Please enter a logo URL to enable testing
                  </p>
                )}

                {/* Results */}
                {mockupResult && (
                  <div className={`p-4 rounded-lg ${mockupResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {mockupResult.success ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <h3 className={`font-semibold ${mockupResult.success ? 'text-green-800' : 'text-red-800'}`}>
                        {mockupResult.success ? 'Success!' : 'Failed'}
                      </h3>
                      {mockupResult.duration && (
                        <Badge variant="secondary" className="ml-auto">
                          {mockupResult.duration}ms
                        </Badge>
                      )}
                    </div>

                    {mockupResult.success && mockupResult.data && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {mockupResult.data.tshirt && (
                            <div className="text-center">
                              <p className="text-sm font-medium mb-2 text-green-800">T-Shirt</p>
                              <div className="border rounded-lg overflow-hidden bg-white">
                                <img 
                                  src={mockupResult.data.tshirt} 
                                  alt="T-shirt mockup"
                                  className="w-full"
                                />
                              </div>
                            </div>
                          )}
                          {mockupResult.data.coffeeMug && (
                            <div className="text-center">
                              <p className="text-sm font-medium mb-2 text-green-800">Coffee Mug</p>
                              <div className="border rounded-lg overflow-hidden bg-white">
                                <img 
                                  src={mockupResult.data.coffeeMug} 
                                  alt="Mug mockup"
                                  className="w-full"
                                />
                              </div>
                            </div>
                          )}
                          {mockupResult.data.toteBag && (
                            <div className="text-center">
                              <p className="text-sm font-medium mb-2 text-green-800">Tote Bag</p>
                              <div className="border rounded-lg overflow-hidden bg-white">
                                <img 
                                  src={mockupResult.data.toteBag} 
                                  alt="Tote bag mockup"
                                  className="w-full"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {!mockupResult.success && mockupResult.error && (
                      <div className="text-red-700 text-sm space-y-1">
                        <p><strong>Error:</strong> {mockupResult.error}</p>
                        {mockupResult.error.includes("DYNAMIC_MOCKUPS_API_KEY") && (
                          <p className="text-xs mt-2">
                            Make sure DYNAMIC_MOCKUPS_API_KEY is set in your .env.local file.
                            Without it, the system will fall back to AI-generated mockups.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SOCIAL ASSETS TAB */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Test Social Asset Generation
                </CardTitle>
                <CardDescription>
                  Generates social media assets (Instagram Post, YouTube Thumbnail, Website Hero)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="socialBusinessName">Business Name</Label>
                    <Input
                      id="socialBusinessName"
                      value={socialBusinessName}
                      onChange={(e) => setSocialBusinessName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="socialIndustry">Industry</Label>
                    <Input
                      id="socialIndustry"
                      value={socialIndustry}
                      onChange={(e) => setSocialIndustry(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="socialTagline">Tagline</Label>
                  <Input
                    id="socialTagline"
                    value={socialTagline}
                    onChange={(e) => setSocialTagline(e.target.value)}
                    placeholder="Your company tagline..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="socialColors">Brand Colors (comma-separated)</Label>
                  <Input
                    id="socialColors"
                    value={socialColors}
                    onChange={(e) => setSocialColors(e.target.value)}
                    placeholder="#2563eb, #1e40af, #f59e0b"
                  />
                </div>

                <Button 
                  onClick={testSocialGeneration} 
                  disabled={socialLoading}
                  className="w-full"
                >
                  {socialLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Social Assets...
                    </>
                  ) : (
                    <>Test Social Generation</>
                  )}
                </Button>

                {/* Results */}
                {socialResult && (
                  <div className={`p-4 rounded-lg ${socialResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {socialResult.success ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <h3 className={`font-semibold ${socialResult.success ? 'text-green-800' : 'text-red-800'}`}>
                        {socialResult.success ? 'Success!' : 'Failed'}
                      </h3>
                      {socialResult.duration && (
                        <Badge variant="secondary" className="ml-auto">
                          {socialResult.duration}ms
                        </Badge>
                      )}
                    </div>

                    {socialResult.success && socialResult.data && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {socialResult.data.instagramPost && (
                            <div className="text-center">
                              <p className="text-sm font-medium mb-2 text-green-800">Instagram Post</p>
                              <div className="border rounded-lg overflow-hidden bg-white">
                                <img 
                                  src={socialResult.data.instagramPost} 
                                  alt="Instagram Post"
                                  className="w-full"
                                />
                              </div>
                            </div>
                          )}
                          {socialResult.data.youtubeThumbnail && (
                            <div className="text-center">
                              <p className="text-sm font-medium mb-2 text-green-800">YouTube Thumbnail</p>
                              <div className="border rounded-lg overflow-hidden bg-white">
                                <img 
                                  src={socialResult.data.youtubeThumbnail} 
                                  alt="YouTube Thumbnail"
                                  className="w-full"
                                />
                              </div>
                            </div>
                          )}
                          {socialResult.data.websiteHero && (
                            <div className="text-center">
                              <p className="text-sm font-medium mb-2 text-green-800">Website Hero</p>
                              <div className="border rounded-lg overflow-hidden bg-white">
                                <img 
                                  src={socialResult.data.websiteHero} 
                                  alt="Website Hero"
                                  className="w-full"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {!socialResult.success && socialResult.error && (
                      <p className="text-red-700 text-sm">{socialResult.error}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Additional Test Links */}
        <Separator className="my-6" />
        
        <Card>
          <CardHeader>
            <CardTitle>Other Test Pages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <a href="/test">Logo Provider Test</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/api/test/mockup-generation" target="_blank">Mockup API Info</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
