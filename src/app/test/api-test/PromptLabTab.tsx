"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Sparkles,
  Save,
  RotateCcw,
  FlaskConical
} from "lucide-react";

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
  duration?: number;
  provider?: string;
}

const baseTemplates: Record<string, string> = {
  "modern-minimalist": `Professional logo design for "{businessName}" in the {industry} industry.

VISUAL DIRECTION: Modern Minimalist - Clean geometric shapes, simple lines, refined elegance.

KEY ATTRIBUTES: {keywords}

COLOR PALETTE: {colors}

COMPOSITION: {composition}

TARGET AUDIENCE: {target}

BRAND ESSENCE: {archetype} archetype. {mission}.

TECHNICAL SPECIFICATIONS:
- Vector-art style, flat design, crisp clean lines
- Transparent or white background
- Centered, balanced composition
- Suitable for 1024×1024 output
- Professional, scalable, print-ready
- No photorealistic textures, no shadows, no gradients

Create a sophisticated, timeless logo that embodies {businessName}'s commitment to excellence.`,

  "bold-iconic": `Bold logo design for "{businessName}" in the {industry} industry.

VISUAL DIRECTION: Bold & Iconic - Strong visual impact, memorable mark, distinctive presence.

KEY ATTRIBUTES: {keywords}

COLOR PALETTE: {colors}

COMPOSITION: {composition}

TARGET AUDIENCE: {target}

BRAND ESSENCE: {archetype} archetype. {mission}.

TECHNICAL SPECIFICATIONS:
- Strong geometric forms, bold shapes
- High contrast, immediately recognizable
- Icon that works at small sizes (favicon)
- Transparent or white background
- 1024×1024 resolution
- Flat design, no 3D effects
- Vector style, clean edges

Create an iconic logo that commands attention and builds instant brand recognition.`,

  "elegant": `Elegant logo design for "{businessName}" in the {industry} industry.

VISUAL DIRECTION: Elegant & Refined - Sophisticated, premium feel, luxurious details.

KEY ATTRIBUTES: {keywords}

COLOR PALETTE: {colors}

COMPOSITION: {composition}

TARGET AUDIENCE: {target}

BRAND ESSENCE: {archetype} archetype. {mission}.

TECHNICAL SPECIFICATIONS:
- Refined typography, sophisticated letterforms
- Subtle details, premium aesthetic
- Balanced negative space
- Transparent or white background
- 1024×1024 resolution
- Clean lines, no clutter
- Luxury brand aesthetic

Create an elegant logo that conveys premium quality and refined taste.`,

  "creative": `Creative logo design for "{businessName}" in the {industry} industry.

VISUAL DIRECTION: Creative & Unique - Distinctive, artistic, memorable concept.

KEY ATTRIBUTES: {keywords}

COLOR PALETTE: {colors}

COMPOSITION: {composition}

TARGET AUDIENCE: {target}

BRAND ESSENCE: {archetype} archetype. {mission}.

TECHNICAL SPECIFICATIONS:
- Unique visual concept, creative interpretation
- Artistic but professional
- Memorable and distinctive
- Transparent or white background
- 1024×1024 resolution
- Balanced composition
- Vector style for scalability

Create a unique, creative logo that stands out from competitors and captures {businessName}'s distinctive personality.`,
};

const styleOptions = [
  { value: "minimalist", label: "Minimalist" },
  { value: "3d-isometric", label: "3D Isometric" },
  { value: "mascot", label: "Mascot" },
  { value: "vintage", label: "Vintage" },
  { value: "abstract", label: "Abstract" },
  { value: "wordmark", label: "Wordmark" },
  { value: "lettermark", label: "Lettermark" },
  { value: "emblem", label: "Emblem" },
];

const compositionOptions = [
  { value: "horizontal", label: "Horizontal" },
  { value: "vertical", label: "Vertical" },
  { value: "circular", label: "Circular" },
  { value: "icon-only", label: "Icon Only" },
  { value: "wordmark-only", label: "Wordmark Only" },
];

const archetypeOptions = [
  "Creator", "Sage", "Explorer", "Hero", "Rebel", "Magician", 
  "Lover", "Jester", "Caregiver", "Ruler", "Everyman", "Innocent"
];

export function PromptLabTab() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("modern-minimalist");
  const [customTemplate, setCustomTemplate] = useState<string>("");
  const [savedTemplates, setSavedTemplates] = useState<{name: string, template: string, timestamp: number}[]>([]);
  const [promptResult, setPromptResult] = useState<TestResult | null>(null);
  const [promptLoading, setPromptLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  
  // Template variables
  const [vars, setVars] = useState({
    businessName: "Acme Corporation",
    industry: "Technology",
    style: "minimalist",
    keywords: "innovative, modern, professional",
    colors: "blue and white",
    composition: "horizontal",
    target: "tech-savvy professionals",
    archetype: "Creator",
    mission: "Making technology accessible to everyone",
  });

  // Load saved templates from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("savedPromptTemplates");
    if (saved) {
      try {
        setSavedTemplates(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved templates", e);
      }
    }
  }, []);

  const currentTemplate = customTemplate || baseTemplates[selectedTemplate] || baseTemplates["modern-minimalist"];

  const renderedPrompt = currentTemplate
    .replace(/{businessName}/g, vars.businessName)
    .replace(/{industry}/g, vars.industry)
    .replace(/{style}/g, styleOptions.find(s => s.value === vars.style)?.label || vars.style)
    .replace(/{keywords}/g, vars.keywords)
    .replace(/{colors}/g, vars.colors)
    .replace(/{composition}/g, compositionOptions.find(c => c.value === vars.composition)?.label || vars.composition)
    .replace(/{target}/g, vars.target)
    .replace(/{archetype}/g, vars.archetype)
    .replace(/{mission}/g, vars.mission);

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    if (value !== "custom") {
      setCustomTemplate(baseTemplates[value] || "");
    }
  };

  const handleGenerate = async () => {
    setPromptLoading(true);
    setPromptResult(null);
    const startTime = Date.now();

    try {
      const response = await fetch("/api/test/single-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testType: "logo",
          prompt: renderedPrompt,
        }),
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (data.success) {
        setPromptResult({
          success: true,
          data: data.result,
          duration,
          provider: data.result?.provider,
        });
      } else {
        setPromptResult({
          success: false,
          error: data.error || "Unknown error",
          duration,
        });
      }
    } catch (err) {
      setPromptResult({
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch",
        duration: Date.now() - startTime,
      });
    } finally {
      setPromptLoading(false);
    }
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    const newTemplate = { name: templateName, template: currentTemplate, timestamp: Date.now() };
    const updated = [...savedTemplates, newTemplate];
    setSavedTemplates(updated);
    localStorage.setItem("savedPromptTemplates", JSON.stringify(updated));
    setShowSaveDialog(false);
    setTemplateName("");
  };

  const loadSavedTemplate = (template: string) => {
    setCustomTemplate(template);
    setSelectedTemplate("custom");
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div className="space-y-2">
        <Label>Base Template</Label>
        <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="modern-minimalist">Modern Minimalist</SelectItem>
            <SelectItem value="bold-iconic">Bold & Iconic</SelectItem>
            <SelectItem value="elegant">Elegant & Refined</SelectItem>
            <SelectItem value="creative">Creative & Unique</SelectItem>
            <SelectItem value="custom">Custom (Edit Below)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Saved Templates */}
      {savedTemplates.length > 0 && (
        <div className="space-y-2">
          <Label>Saved Templates</Label>
          <div className="flex flex-wrap gap-2">
            {savedTemplates.map((t, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => loadSavedTemplate(t.template)}
              >
                {t.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Template Editor */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Prompt Template (Editable)</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCustomTemplate(baseTemplates[selectedTemplate] || "")}
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </div>
        <Textarea
          value={currentTemplate}
          onChange={(e) => {
            setCustomTemplate(e.target.value);
            setSelectedTemplate("custom");
          }}
          rows={12}
          className="font-mono text-sm"
        />
        <p className="text-xs text-gray-500">
          Use placeholders: {"{businessName}"}, {"{industry}"}, {"{style}"}, {"{keywords}"}, {"{colors}"}, {"{composition}"}, {"{target}"}, {"{archetype}"}, {"{mission}"}
        </p>
      </div>

      {/* Variable Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Business Name</Label>
          <Input
            value={vars.businessName}
            onChange={(e) => setVars({ ...vars, businessName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Industry</Label>
          <Input
            value={vars.industry}
            onChange={(e) => setVars({ ...vars, industry: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Style</Label>
          <Select value={vars.style} onValueChange={(v) => setVars({ ...vars, style: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {styleOptions.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Composition</Label>
          <Select value={vars.composition} onValueChange={(v) => setVars({ ...vars, composition: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {compositionOptions.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Archetype</Label>
          <Select value={vars.archetype} onValueChange={(v) => setVars({ ...vars, archetype: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {archetypeOptions.map(a => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Colors</Label>
          <Input
            value={vars.colors}
            onChange={(e) => setVars({ ...vars, colors: e.target.value })}
            placeholder="e.g., blue and gold"
          />
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Keywords</Label>
          <Input
            value={vars.keywords}
            onChange={(e) => setVars({ ...vars, keywords: e.target.value })}
            placeholder="innovative, modern, professional"
          />
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Target Audience</Label>
          <Input
            value={vars.target}
            onChange={(e) => setVars({ ...vars, target: e.target.value })}
          />
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Mission Statement</Label>
          <Textarea
            value={vars.mission}
            onChange={(e) => setVars({ ...vars, mission: e.target.value })}
            rows={2}
          />
        </div>
      </div>

      {/* Rendered Prompt Preview */}
      <div className="space-y-2">
        <Label>Rendered Prompt Preview</Label>
        <div className="p-4 bg-gray-50 border rounded-lg">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">{renderedPrompt}</pre>
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={promptLoading}
        className="w-full"
      >
        {promptLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating Logo (1 credit)...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate with Custom Prompt (1 credit)
          </>
        )}
      </Button>

      {/* Results */}
      {promptResult && (
        <div className={`p-4 rounded-lg ${promptResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            {promptResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <h3 className={`font-semibold ${promptResult.success ? 'text-green-800' : 'text-red-800'}`}>
              {promptResult.success ? 'Success!' : 'Failed'}
            </h3>
            {promptResult.success && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSaveDialog(true)}
                className="ml-auto"
              >
                <Save className="w-3 h-3 mr-1" />
                Save Template
              </Button>
            )}
          </div>

          {promptResult.success && promptResult.data?.imageUrl && (
            <div className="border rounded-lg overflow-hidden bg-white">
              <img
                src={promptResult.data.imageUrl}
                alt="Generated logo"
                className="w-full max-w-md mx-auto"
              />
            </div>
          )}

          {!promptResult.success && promptResult.error && (
            <p className="text-red-700 text-sm">{promptResult.error}</p>
          )}
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
          <Label>Template Name</Label>
          <Input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="e.g., My Custom Tech Prompt"
          />
          <div className="flex gap-2">
            <Button onClick={handleSaveTemplate} disabled={!templateName.trim()}>
              Save
            </Button>
            <Button variant="ghost" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
