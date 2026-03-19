"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Sparkles,
  Save,
  RotateCcw,
  FlaskConical,
  Info,
  Lightbulb
} from "lucide-react";

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
  duration?: number;
  provider?: string;
}

// FIXED TEMPLATES - SD/Flux Optimized (comma-separated, anti-pattern, quantity-locked)
const baseTemplates: Record<string, string> = {
  "modern-minimalist": `Single isolated minimalist logomark for {industry} company, 
{elementCount} {graphicMotif} arranged in {arrangement}, 
{centered} composition with generous white space on all sides, 
isolated on {backgroundType} background, 
not a pattern, not repeating, not tessellated, not scattered, one cohesive symbol only, 
{colors} solid flat colors, no gradients, no shadows, 
2D vector graphic style, crisp clean edges, perfect symmetry, 
{styleReference} aesthetic, Paul Rand inspired, 
{industry} sector, {keywords}, 
app icon design, favicon style, centered logomark, 
corporate identity symbol, timeless emblem, 
{composition}`,

  "bold-iconic": `Single bold iconic logomark for {industry} company, 
{elementCount} strong {graphicMotif} arranged in {arrangement}, 
{centered} composition with ample padding, 
isolated on {backgroundType} background, 
not a pattern, not repeating, not scattered, single focal point only, 
{colors} solid flat colors, high contrast, no gradients, 
2D vector graphic, bold shapes, crisp edges, immediate recognition, 
{styleReference} aesthetic, 
{industry} sector, {keywords}, 
app icon style, favicon design, centered symbol, 
distinctive memorable mark, 
{composition}`,

  "elegant": `Single elegant refined logomark for {industry} company, 
{elementCount} sophisticated {graphicMotif} arranged in {arrangement}, 
{centered} composition with elegant negative space, 
isolated on {backgroundType} background, 
not a pattern, not repeating, one cohesive refined symbol only, 
{colors} solid flat colors, premium aesthetic, no gradients, 
2D vector graphic, refined details, crisp clean lines, 
{styleReference} aesthetic, luxury brand style, 
{industry} sector, {keywords}, 
app icon design, favicon style, centered mark, 
sophisticated identity symbol, 
{composition}`,

  "creative": `Single creative unique logomark for {industry} company, 
{elementCount} distinctive {graphicMotif} arranged in {arrangement}, 
{centered} composition with balanced spacing, 
isolated on {backgroundType} background, 
not a pattern, not repeating, not scattered, one unique symbol only, 
{colors} solid flat colors, artistic but professional, no gradients, 
2D vector graphic, distinctive concept, crisp edges, 
{styleReference} aesthetic, creative identity, 
{industry} sector, {keywords}, 
app icon style, favicon design, centered emblem, 
memorable distinctive mark, 
{composition}`,
};

// Default negative prompt to prevent patterns/wallpapers
const DEFAULT_NEGATIVE_PROMPT = `text, words, letters, typography, font, watermark, signature, 
mockup, 3d render, drop shadow, gradient, 
multiple logos, collage, business cards, letterhead, scattered objects, 
pattern, repeating, tessellation, wallpaper, textile, all-over print,
photography, photorealistic texture, blurry, busy composition,
many shapes, scattered elements, random placement`;

// Options for dropdowns
const styleOptions = [
  { value: "minimalist", label: "Minimalist" },
  { value: "modern", label: "Modern" },
  { value: "geometric", label: "Geometric" },
  { value: "abstract", label: "Abstract" },
];

const compositionOptions = [
  { value: "icon-only", label: "Icon Only (Recommended)" },
  { value: "horizontal", label: "Horizontal" },
  { value: "vertical", label: "Vertical" },
  { value: "circular", label: "Circular" },
];

const archetypeOptions = [
  "Creator", "Sage", "Explorer", "Hero", "Rebel", "Magician", 
  "Lover", "Jester", "Caregiver", "Ruler", "Everyman", "Innocent"
];

// NEW: Anti-pattern control options
const elementCountOptions = [
  { value: "single central icon", label: "Single Shape (Recommended)" },
  { value: "2 overlapping forms", label: "2 Overlapping Forms" },
  { value: "3 geometric elements", label: "3 Geometric Elements" },
];

const arrangementOptions = [
  { value: "centered", label: "Centered (Recommended)" },
  { value: "vertically stacked", label: "Vertically Stacked" },
  { value: "enclosed circle", label: "Enclosed Circle" },
  { value: "left-to-right flow", label: "Left-to-Right Flow" },
  { value: "pyramid formation", label: "Pyramid Formation" },
];

const graphicMotifOptions = [
  { value: "abstract geometric", label: "Abstract Geometric" },
  { value: "nature-inspired", label: "Nature-Inspired" },
  { value: "letter-based", label: "Letter-Based" },
  { value: "tech circuit", label: "Tech Circuit" },
  { value: "interlocking shapes", label: "Interlocking Shapes" },
  { value: "continuous line", label: "Continuous Line" },
  { value: "ascending triangles", label: "Ascending Triangles" },
];

const backgroundTypeOptions = [
  { value: "pure white", label: "Pure White (Recommended)" },
  { value: "transparent black", label: "Transparent Black" },
  { value: "solid color block", label: "Solid Color Block" },
];

const styleReferenceOptions = [
  { value: "Swiss International Style", label: "Swiss International" },
  { value: "Y2K Tech", label: "Y2K Tech" },
  { value: "Art Deco", label: "Art Deco" },
  { value: "Brutalist", label: "Brutalist" },
  { value: "Paul Rand", label: "Paul Rand" },
  { value: "Mid-Century Modern", label: "Mid-Century Modern" },
  { value: "Bauhaus", label: "Bauhaus" },
];

export function PromptLabTab() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("modern-minimalist");
  const [customTemplate, setCustomTemplate] = useState<string>("");
  const [savedTemplates, setSavedTemplates] = useState<{name: string, template: string, timestamp: number}[]>([]);
  const [promptResult, setPromptResult] = useState<TestResult | null>(null);
  const [promptLoading, setPromptLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  
  // Negative prompt state
  const [negativePrompt, setNegativePrompt] = useState(DEFAULT_NEGATIVE_PROMPT);
  const [useNegativePrompt, setUseNegativePrompt] = useState(true);
  
  // Template variables - updated with new anti-pattern fields
  const [vars, setVars] = useState({
    businessName: "Acme Corporation",
    industry: "Technology",
    style: "minimalist",
    keywords: "innovative, modern, professional",
    colors: "deep navy blue and white",
    composition: "icon-only",
    target: "tech-savvy professionals",
    archetype: "Creator",
    mission: "Making technology accessible to everyone",
    // NEW: Anti-pattern control fields
    elementCount: "single central icon",
    arrangement: "centered",
    graphicMotif: "abstract geometric",
    backgroundType: "pure white",
    styleReference: "Swiss International Style",
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
    .replace(/{mission}/g, vars.mission)
    // NEW: Anti-pattern replacements
    .replace(/{elementCount}/g, vars.elementCount)
    .replace(/{arrangement}/g, vars.arrangement)
    .replace(/{graphicMotif}/g, vars.graphicMotif)
    .replace(/{backgroundType}/g, vars.backgroundType)
    .replace(/{styleReference}/g, vars.styleReference)
    .replace(/{centered}/g, vars.arrangement === "centered" ? "centered" : vars.arrangement);

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
          negativePrompt: useNegativePrompt ? negativePrompt : undefined,
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
      {/* Educational Alert */}
      <Alert className="bg-amber-50 border-amber-200">
        <Lightbulb className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Prompt Engineering Tips</AlertTitle>
        <AlertDescription className="text-amber-700 text-sm">
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li><strong>&quot;Single&quot;</strong> and <strong>&quot;not a pattern&quot;</strong> prevent wallpaper chaos</li>
            <li><strong>&quot;Icon only&quot;</strong> avoids garbled text (SD can&apos;t reliably render words)</li>
            <li><strong>&quot;App icon&quot;</strong> and <strong>&quot;favicon&quot;</strong> keywords force single centered objects</li>
            <li><strong>Comma-separated</strong> format works better than paragraphs for SD/Flux</li>
          </ul>
        </AlertDescription>
      </Alert>

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
          rows={10}
          className="font-mono text-sm"
        />
        <p className="text-xs text-gray-500">
          Placeholders: {"{elementCount}"}, {"{graphicMotif}"}, {"{arrangement}"}, {"{backgroundType}"}, {"{styleReference}"}, {"{colors}"}, {"{keywords}"}, {"{industry}"}
        </p>
      </div>

      {/* Composition Control Section */}
      <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Info className="w-4 h-4" />
          Composition Control (Prevents Pattern Chaos)
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Element Count</Label>
            <Select value={vars.elementCount} onValueChange={(v) => setVars({ ...vars, elementCount: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {elementCountOptions.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs">Arrangement</Label>
            <Select value={vars.arrangement} onValueChange={(v) => setVars({ ...vars, arrangement: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {arrangementOptions.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs">Graphic Motif</Label>
            <Select value={vars.graphicMotif} onValueChange={(v) => setVars({ ...vars, graphicMotif: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {graphicMotifOptions.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs">Background</Label>
            <Select value={vars.backgroundType} onValueChange={(v) => setVars({ ...vars, backgroundType: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {backgroundTypeOptions.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Variable Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Industry</Label>
          <Input
            value={vars.industry}
            onChange={(e) => setVars({ ...vars, industry: e.target.value })}
            placeholder="e.g., Technology, Healthcare"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Style Reference</Label>
          <Select value={vars.styleReference} onValueChange={(v) => setVars({ ...vars, styleReference: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {styleReferenceOptions.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Colors</Label>
          <Input
            value={vars.colors}
            onChange={(e) => setVars({ ...vars, colors: e.target.value })}
            placeholder="e.g., deep navy blue and white"
          />
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
        
        <div className="space-y-2 col-span-2">
          <Label>Keywords</Label>
          <Input
            value={vars.keywords}
            onChange={(e) => setVars({ ...vars, keywords: e.target.value })}
            placeholder="innovative, modern, professional"
          />
        </div>
      </div>

      {/* Negative Prompt Section */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox 
            id="useNegative"
            checked={useNegativePrompt}
            onCheckedChange={(checked) => setUseNegativePrompt(checked as boolean)}
          />
          <Label htmlFor="useNegative" className="font-semibold cursor-pointer">
            Use Negative Prompt (Recommended)
          </Label>
          <Badge variant="secondary" className="text-xs">Blocks patterns</Badge>
        </div>
        
        {useNegativePrompt && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs text-gray-500">Negative Prompt (what to exclude)</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNegativePrompt(DEFAULT_NEGATIVE_PROMPT)}
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset Default
              </Button>
            </div>
            <Textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              rows={4}
              className="font-mono text-xs"
            />
            <p className="text-xs text-gray-500">
              These terms help prevent wallpapers, mockups, and scattered elements
            </p>
          </div>
        )}
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
            Generate with Anti-Pattern Prompt (1 credit)
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
            placeholder="e.g., My Anti-Pattern Tech Prompt"
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
