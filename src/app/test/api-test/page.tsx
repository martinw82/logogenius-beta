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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ImageIcon, 
  Shirt, 
  Share2, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Info,
  Bug,
  Copy,
  Sparkles,
  FlaskConical
} from "lucide-react";
import { PromptLabTab } from "./PromptLabTab";

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
  duration?: number;
  provider?: string;
  rawResponse?: any; // For debugging
  creditWarning?: string;
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
  const [mockupProductType, setMockupProductType] = useState<string>("tshirt");
  const [mockupResult, setMockupResult] = useState<TestResult | null>(null);
  const [mockupLoading, setMockupLoading] = useState(false);
  const [showMockupDebug, setShowMockupDebug] = useState(false);

  // Social test state
  const [socialBusinessName, setSocialBusinessName] = useState("Test Company");
  const [socialColors, setSocialColors] = useState("#2563eb, #1e40af, #f59e0b");
  const [socialIndustry, setSocialIndustry] = useState("technology");
  const [socialTagline, setSocialTagline] = useState("Innovation for everyone");
  const [socialPlatform, setSocialPlatform] = useState<string>("instagramPost");
  const [socialResult, setSocialResult] = useState<TestResult | null>(null);
  const [socialLoading, setSocialLoading] = useState(false);
  const [showSocialDebug, setShowSocialDebug] = useState(false);

  // Prompt Lab component is defined below

  // Test Logo Generation (1 credit)
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
          prompt: logoPrompt,
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
          rawResponse: data,
        });
      } else {
        setLogoResult({
          success: false,
          error: data.error || "Unknown error",
          duration,
          rawResponse: data,
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

  // Test Single Mockup Generation (1 credit) - CREDIT SAVER!
  const testSingleMockup = async () => {
    setMockupLoading(true);
    setMockupResult(null);
    setShowMockupDebug(false);
    const startTime = Date.now();

    try {
      const response = await fetch("/api/test/single-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testType: "single-mockup",
          logoUrl: mockupLogoUrl,
          productType: mockupProductType,
          businessName: mockupBusinessName,
          industry: mockupIndustry,
          brandColors: mockupColors.split(",").map(c => c.trim()),
        }),
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      console.log("[Mockup Test] Raw response:", data);

      if (data.success) {
        setMockupResult({
          success: true,
          data: data.result,
          duration,
          provider: data.result?._provider,
          rawResponse: data,
        });
      } else {
        setMockupResult({
          success: false,
          error: data.error || "Unknown error",
          duration,
          rawResponse: data,
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

  // Test All Mockups Generation (3 credits)
  const testAllMockups = async () => {
    setMockupLoading(true);
    setMockupResult(null);
    setShowMockupDebug(false);
    const startTime = Date.now();

    try {
      const response = await fetch("/api/test/single-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testType: "mockup",
          logoUrl: mockupLogoUrl,
          businessName: mockupBusinessName,
          industry: mockupIndustry,
          brandColors: mockupColors.split(",").map(c => c.trim()),
        }),
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      console.log("[All Mockups Test] Raw response:", data);

      if (data.success) {
        setMockupResult({
          success: true,
          data: data.result,
          duration,
          creditWarning: data._creditWarning,
          rawResponse: data,
        });
      } else {
        setMockupResult({
          success: false,
          error: data.error || "Unknown error",
          duration,
          rawResponse: data,
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

  // Test Single Social Asset (1 credit) - CREDIT SAVER!
  const testSingleSocial = async () => {
    setSocialLoading(true);
    setSocialResult(null);
    setShowSocialDebug(false);
    const startTime = Date.now();

    try {
      const response = await fetch("/api/test/single-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testType: "single-social",
          platform: socialPlatform,
          businessName: socialBusinessName,
          industry: socialIndustry,
          tagline: socialTagline,
          brandColors: socialColors.split(",").map(c => c.trim()),
        }),
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      console.log("[Social Test] Raw response:", data);

      if (data.success) {
        setSocialResult({
          success: true,
          data: data.result,
          duration,
          rawResponse: data,
        });
      } else {
        setSocialResult({
          success: false,
          error: data.error || "Unknown error",
          duration,
          rawResponse: data,
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

  // Test All Social Assets (3 credits)
  const testAllSocial = async () => {
    setSocialLoading(true);
    setSocialResult(null);
    setShowSocialDebug(false);
    const startTime = Date.now();

    try {
      const response = await fetch("/api/test/single-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testType: "social",
          businessName: socialBusinessName,
          industry: socialIndustry,
          tagline: socialTagline,
          brandColors: socialColors.split(",").map(c => c.trim()),
        }),
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      console.log("[All Social Test] Raw response:", data);

      if (data.success) {
        setSocialResult({
          success: true,
          data: data.result,
          duration,
          creditWarning: data._creditWarning,
          rawResponse: data,
        });
      } else {
        setSocialResult({
          success: false,
          error: data.error || "Unknown error",
          duration,
          rawResponse: data,
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
            Test each generation API individually. <strong>New:</strong> Single-item testing to save credits!
          </p>
        </div>

        {/* Credit Info */}
        <Alert className="bg-green-50 border-green-200">
          <Info className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Credit-Efficient Testing Options</AlertTitle>
          <AlertDescription className="text-green-700">
            <strong>NEW:</strong> Test single items (1 credit each) or all items (3 credits). 
            Use single-item tests to conserve credits! | 
            Logo: 1 credit | Single Mockup: 1 credit | All Mockups: 3 credits | 
            Single Social: 1 credit | All Social: 3 credits
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="logo" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="logo" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Logo
            </TabsTrigger>
            <TabsTrigger value="mockup" className="flex items-center gap-2">
              <Shirt className="w-4 h-4" />
              Mockups
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Social
            </TabsTrigger>
            <TabsTrigger value="promptlab" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Prompt Lab
            </TabsTrigger>
          </TabsList>

          {/* LOGO GENERATION TAB */}
          <TabsContent value="logo">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Test Logo Generation
                  <Badge className="ml-2 bg-green-500">1 Credit</Badge>
                </CardTitle>
                <CardDescription>
                  Generates a single logo using the configured provider (Together AI by default)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logoPrompt">Prompt</Label>
                  <Textarea
                    id="logoPrompt"
                    value={logoPrompt}
                    onChange={(e) => setLogoPrompt(e.target.value)}
                    rows={3}
                    placeholder="Describe the logo you want to generate..."
                  />
                </div>

                <Button 
                  onClick={testLogoGeneration} 
                  disabled={logoLoading}
                  className="w-full"
                >
                  {logoLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Logo (1 credit)...
                    </>
                  ) : (
                    <>Generate Logo (1 credit)</>
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
                              onError={(e) => {
                                console.error("Logo image failed to load:", e);
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
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
                  Test with 1 credit (single) or 3 credits (all). Use single to save credits!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800">Requires Logo URL</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    You need a logo image URL. Generate a logo first, or paste a public URL below.
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

                {/* SINGLE MOCKUP TEST (1 CREDIT) */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500">RECOMMENDED - 1 Credit</Badge>
                    <span className="text-sm font-medium text-green-800">Test Single Mockup</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Select Product Type</Label>
                    <Select value={mockupProductType} onValueChange={setMockupProductType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tshirt">👕 T-Shirt</SelectItem>
                        <SelectItem value="mug">☕ Coffee Mug</SelectItem>
                        <SelectItem value="totebag">🛍️ Tote Bag</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={testSingleMockup} 
                    disabled={mockupLoading || !mockupLogoUrl}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {mockupLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating {mockupProductType} (1 credit)...
                      </>
                    ) : (
                      <>Generate Single Mockup (1 credit)</>
                    )}
                  </Button>
                </div>

                <Separator />

                {/* ALL MOCKUPS TEST (3 CREDITS) */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">3 Credits</Badge>
                    <span className="text-sm font-medium text-amber-800">Test All Mockups</span>
                  </div>
                  <p className="text-xs text-amber-700">
                    Generates T-Shirt + Mug + Tote Bag in one call. Uses 3 API credits.
                  </p>

                  <Button 
                    onClick={testAllMockups} 
                    disabled={mockupLoading || !mockupLogoUrl}
                    variant="outline"
                    className="w-full border-amber-400 text-amber-800 hover:bg-amber-100"
                  >
                    {mockupLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating All Mockups (3 credits)...
                      </>
                    ) : (
                      <>Generate All Mockups (3 credits)</>
                    )}
                  </Button>
                </div>

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

                    {mockupResult.creditWarning && (
                      <Alert className="mb-3 bg-amber-50 border-amber-200">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-700">
                          {mockupResult.creditWarning}
                        </AlertDescription>
                      </Alert>
                    )}

                    {mockupResult.success && mockupResult.data && (
                      <div className="space-y-4">
                        {/* Debug info - ALWAYS SHOW DATA STRUCTURE */}
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                          <p className="font-semibold text-blue-800 mb-1">Response Data Structure:</p>
                          <p className="text-blue-700">
                            <strong>Provider:</strong> {mockupResult.provider || mockupResult.data?._provider || 'N/A'}<br/>
                            <strong>Product Type:</strong> {mockupResult.data?._productType || 'N/A'}<br/>
                            <strong>Keys in data:</strong> {Object.keys(mockupResult.data).join(', ')}
                          </p>
                        </div>
                        
                        {/* Show the actual URL for debugging */}
                        {(() => {
                          // Find which key has the image URL
                          const imageUrl = mockupResult.data.tshirt || 
                                          mockupResult.data.mug || 
                                          mockupResult.data.totebag || 
                                          mockupResult.data.toteBag ||
                                          Object.values(mockupResult.data).find(v => typeof v === 'string' && (v.startsWith('http') || v.startsWith('data:image')));
                          
                          return imageUrl ? (
                            <div className="p-2 bg-gray-100 rounded text-xs">
                              <p className="font-semibold">Image URL Preview:</p>
                              <p className="truncate font-mono">{imageUrl.substring(0, 100)}...</p>
                            </div>
                          ) : (
                            <div className="p-2 bg-red-100 rounded text-xs text-red-700">
                              <p className="font-semibold">⚠️ No image URL found in response!</p>
                              <p>Check Debug Info below for full response.</p>
                            </div>
                          );
                        })()}
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* T-Shirt */}
                          <div className="text-center">
                            <p className="text-sm font-medium mb-2 text-green-800">T-Shirt</p>
                            {mockupResult.data.tshirt ? (
                              <div className="border rounded-lg overflow-hidden bg-white">
                                <img 
                                  src={mockupResult.data.tshirt} 
                                  alt="T-shirt mockup"
                                  className="w-full"
                                  onLoad={() => console.log("[Mockup] T-shirt image loaded successfully")}
                                  onError={(e) => {
                                    console.error("[Mockup] T-shirt image failed to load:", mockupResult.data.tshirt?.substring(0, 100));
                                    (e.target as HTMLImageElement).parentElement!.innerHTML = '<p class="p-4 text-red-500 text-xs">Image failed to load</p>';
                                  }}
                                />
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 p-4 bg-gray-50 rounded">No tshirt data</p>
                            )}
                          </div>
                          
                          {/* Coffee Mug */}
                          <div className="text-center">
                            <p className="text-sm font-medium mb-2 text-green-800">Coffee Mug</p>
                            {(mockupResult.data.coffeeMug || mockupResult.data.mug) ? (
                              <div className="border rounded-lg overflow-hidden bg-white">
                                <img 
                                  src={mockupResult.data.coffeeMug || mockupResult.data.mug} 
                                  alt="Mug mockup"
                                  className="w-full"
                                  onLoad={() => console.log("[Mockup] Mug image loaded successfully")}
                                  onError={(e) => {
                                    console.error("[Mockup] Mug image failed to load");
                                    (e.target as HTMLImageElement).parentElement!.innerHTML = '<p class="p-4 text-red-500 text-xs">Image failed to load</p>';
                                  }}
                                />
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 p-4 bg-gray-50 rounded">No mug data</p>
                            )}
                          </div>
                          
                          {/* Tote Bag */}
                          <div className="text-center">
                            <p className="text-sm font-medium mb-2 text-green-800">Tote Bag</p>
                            {(mockupResult.data.toteBag || mockupResult.data.totebag) ? (
                              <div className="border rounded-lg overflow-hidden bg-white">
                                <img 
                                  src={mockupResult.data.toteBag || mockupResult.data.totebag} 
                                  alt="Tote bag mockup"
                                  className="w-full"
                                  onLoad={() => console.log("[Mockup] Tote image loaded successfully")}
                                  onError={(e) => {
                                    console.error("[Mockup] Tote image failed to load");
                                    (e.target as HTMLImageElement).parentElement!.innerHTML = '<p class="p-4 text-red-500 text-xs">Image failed to load</p>';
                                  }}
                                />
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 p-4 bg-gray-50 rounded">No tote data</p>
                            )}
                          </div>
                        </div>

                        {/* Debug Toggle */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setShowMockupDebug(!showMockupDebug)}
                          className="text-xs"
                        >
                          <Bug className="w-3 h-3 mr-1" />
                          {showMockupDebug ? 'Hide' : 'Show'} Full Debug Info
                        </Button>

                        {showMockupDebug && mockupResult.rawResponse && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-60">
                            <pre>{JSON.stringify(mockupResult.rawResponse, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    )}

                    {!mockupResult.success && mockupResult.error && (
                      <div className="text-red-700 text-sm space-y-1">
                        <p><strong>Error:</strong> {mockupResult.error}</p>
                        {mockupResult.error.includes("DYNAMIC_MOCKUPS_API_KEY") && (
                          <p className="text-xs mt-2">
                            Make sure DYNAMIC_MOCKUPS_API_KEY is set in your Vercel dashboard.
                            Without it, the system falls back to AI-generated mockups (still works, just not pixel-perfect).
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
                  Test with 1 credit (single) or 3 credits (all platforms)
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

                {/* SINGLE SOCIAL TEST (1 CREDIT) */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500">RECOMMENDED - 1 Credit</Badge>
                    <span className="text-sm font-medium text-green-800">Test Single Social Asset</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Select Platform</Label>
                    <Select value={socialPlatform} onValueChange={setSocialPlatform}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagramPost">📷 Instagram Post (1:1)</SelectItem>
                        <SelectItem value="youtubeThumbnail">🎬 YouTube Thumbnail (16:9)</SelectItem>
                        <SelectItem value="websiteHero">🌐 Website Hero (16:9)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={testSingleSocial} 
                    disabled={socialLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {socialLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating {socialPlatform} (1 credit)...
                      </>
                    ) : (
                      <>Generate Single Social Asset (1 credit)</>
                    )}
                  </Button>
                </div>

                <Separator />

                {/* ALL SOCIAL TEST (3 CREDITS) */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">3 Credits</Badge>
                    <span className="text-sm font-medium text-amber-800">Test All Social Assets</span>
                  </div>
                  <p className="text-xs text-amber-700">
                    Generates Instagram + YouTube + Website Hero in one call. Uses 3 API credits.
                  </p>

                  <Button 
                    onClick={testAllSocial} 
                    disabled={socialLoading}
                    variant="outline"
                    className="w-full border-amber-400 text-amber-800 hover:bg-amber-100"
                  >
                    {socialLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating All Social Assets (3 credits)...
                      </>
                    ) : (
                      <>Generate All Social Assets (3 credits)</>
                    )}
                  </Button>
                </div>

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

                    {socialResult.creditWarning && (
                      <Alert className="mb-3 bg-amber-50 border-amber-200">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-700">
                          {socialResult.creditWarning}
                        </AlertDescription>
                      </Alert>
                    )}

                    {socialResult.success && socialResult.data && (
                      <div className="space-y-4">
                        <div className="text-xs text-gray-500 mb-2">
                          <strong>Keys:</strong> {Object.keys(socialResult.data).join(', ')}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {(socialResult.data.instagramPost || socialResult.data.instagram_post) && (
                            <div className="text-center">
                              <p className="text-sm font-medium mb-2 text-green-800">Instagram Post</p>
                              <div className="border rounded-lg overflow-hidden bg-white">
                                <img 
                                  src={socialResult.data.instagramPost || socialResult.data.instagram_post} 
                                  alt="Instagram Post"
                                  className="w-full"
                                  onError={(e) => {
                                    console.error("Instagram image failed to load:", e);
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          {(socialResult.data.youtubeThumbnail || socialResult.data.youtube_thumbnail) && (
                            <div className="text-center">
                              <p className="text-sm font-medium mb-2 text-green-800">YouTube Thumbnail</p>
                              <div className="border rounded-lg overflow-hidden bg-white">
                                <img 
                                  src={socialResult.data.youtubeThumbnail || socialResult.data.youtube_thumbnail} 
                                  alt="YouTube Thumbnail"
                                  className="w-full"
                                  onError={(e) => {
                                    console.error("YouTube image failed to load:", e);
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          {(socialResult.data.websiteHero || socialResult.data.website_hero) && (
                            <div className="text-center">
                              <p className="text-sm font-medium mb-2 text-green-800">Website Hero</p>
                              <div className="border rounded-lg overflow-hidden bg-white">
                                <img 
                                  src={socialResult.data.websiteHero || socialResult.data.website_hero} 
                                  alt="Website Hero"
                                  className="w-full"
                                  onError={(e) => {
                                    console.error("Hero image failed to load:", e);
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Debug Toggle */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setShowSocialDebug(!showSocialDebug)}
                          className="text-xs"
                        >
                          <Bug className="w-3 h-3 mr-1" />
                          {showSocialDebug ? 'Hide' : 'Show'} Debug Info
                        </Button>

                        {showSocialDebug && socialResult.rawResponse && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-40">
                            <pre>{JSON.stringify(socialResult.rawResponse, null, 2)}</pre>
                          </div>
                        )}
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

          {/* PROMPT LAB TAB */}
          <TabsContent value="promptlab">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="w-5 h-5" />
                  Prompt Lab
                  <Badge className="ml-2 bg-purple-500">Test & Refine</Badge>
                </CardTitle>
                <CardDescription>
                  Edit prompt templates with placeholders, test variations, and save what works
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PromptLabTab />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Links */}
        <Separator className="my-6" />
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild size="sm">
                <a href="/test">Logo Provider Test</a>
              </Button>
              <Button variant="outline" asChild size="sm">
                <a href="/api/test/mockup-generation" target="_blank">Mockup API Info</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
