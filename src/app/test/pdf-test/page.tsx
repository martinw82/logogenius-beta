"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const dynamic = "force-dynamic";

// ─── Presets ────────────────────────────────────────────────────────────────

const PRESETS = {
  THUNDERFORGE: {
    businessName: "THUNDERFORGE",
    tagline: "Strength Through Innovation",
    archetype: "The Hero",
    industry: "Technology",
    primaryColor: "#2563eb",
    secondaryColor: "#1e40af",
    accentColor: "#f59e0b",
    primaryColors: ["#2563eb", "#3b82f6", "#60a5fa"],
    secondaryColors: ["#1e40af", "#1e3a8a"],
    accentColors: ["#f59e0b", "#fbbf24"],
    fontHeadings: "Playfair Display",
    fontBody: "Inter",
    projectOverview: "THUNDERFORGE is a forward-thinking technology company dedicated to creating powerful solutions that empower businesses to achieve more. Founded with a vision to democratize enterprise-grade tools, we have grown into a trusted partner for organizations seeking to transform their digital presence.",
    brandIdentityVoice: "The THUNDERFORGE brand embodies strength, innovation, and reliability. We speak with confidence and clarity, avoiding jargon while maintaining technical credibility. Our voice is bold but never arrogant, authoritative but approachable.",
    logoPhilosophy: "The THUNDERFORGE logo represents our core values of power and precision. The geometric forms suggest stability and forward momentum, while the color palette evokes trust and energy.",
    colorPaletteText: "Our primary color palette centers on deep blues and vibrant accents. The primary blue (#2563eb) conveys trust and professionalism, while the energetic orange accent (#f59e0b) adds warmth and approachability.",
    colorAccessibility: "All color combinations meet WCAG AA standards. Primary text uses a 4.5:1 contrast ratio against backgrounds. Avoid using color alone to convey meaning.",
    typographyText: "Our typography pairs Playfair Display for headings with Inter for body text. This combination conveys both authority and accessibility.",
    imageryStyle: "Photography should feel authentic and aspirational. Use natural lighting, diverse subjects, and real-world contexts. Avoid generic stock imagery.",
    graphicElements: "Geometric shapes derived from the logo can be used as background patterns. Maintain consistent corner radii and line weights.",
    brandVoiceTone: "We are confident but not cocky. Technical but not cryptic. Professional but not stuffy.",
    visualStyleGuide: "Maintain consistent spacing using an 8px grid system. Use subtle shadows for depth. Border radius: 4px for UI elements, 8px for cards.",
    usageRulesText: "Always use approved logo files, maintain clear space, and follow color guidelines. When in doubt, contact the brand team.",
    appendix: "This brand guide is a living document. Version 1.0 reflects our brand expression as of 2026.",
  },
  LUMINA: {
    businessName: "LUMINA",
    tagline: "Light the Way to Wellbeing",
    archetype: "The Caregiver",
    industry: "Wellness & Health",
    primaryColor: "#16a34a",
    secondaryColor: "#15803d",
    accentColor: "#0d9488",
    primaryColors: ["#16a34a", "#22c55e", "#4ade80"],
    secondaryColors: ["#15803d", "#166534"],
    accentColors: ["#0d9488", "#14b8a6"],
    fontHeadings: "Merriweather",
    fontBody: "Source Sans Pro",
    projectOverview: "LUMINA is a wellness brand dedicated to nurturing holistic health and personal growth. We believe that true wellbeing encompasses mind, body, and spirit, and our products and services reflect this philosophy.",
    brandIdentityVoice: "LUMINA communicates with warmth, empathy, and expertise. We are a trusted companion on your wellness journey—encouraging, knowledgeable, and genuinely caring.",
    logoPhilosophy: "The LUMINA logo embodies light, growth, and vitality. Soft organic shapes reflect our connection to nature, while the clean typography signals professionalism and reliability.",
    colorPaletteText: "Our green palette evokes growth, health, and nature. The primary green (#16a34a) represents vitality, while teal accents bring clarity and calm.",
    colorAccessibility: "All text meets WCAG AA contrast requirements. We ensure our gentle color palette remains accessible without sacrificing warmth.",
    typographyText: "Merriweather headings convey trustworthiness and tradition, while Source Sans Pro body text provides excellent readability across all devices.",
    imageryStyle: "Use soft, natural lighting with warm tones. Feature real people in authentic moments of wellness—yoga, cooking, meditation, outdoor activity.",
    graphicElements: "Flowing botanical elements and organic shapes reinforce our connection to nature. Use sparingly as supporting details.",
    brandVoiceTone: "Warm, encouraging, and knowledgeable. We inspire without pressuring. We educate without lecturing.",
    visualStyleGuide: "Generous white space creates calm. Use 12px grid system. Rounded corners (12px) create approachability.",
    usageRulesText: "The LUMINA mark should always appear on light backgrounds. Minimum clear space equals the height of the 'L' in LUMINA.",
    appendix: "Questions about brand usage? Contact brand@lumina.health. Version 1.0, 2026.",
  },
  NEXUS: {
    businessName: "NEXUS",
    tagline: "Where Ideas Become Reality",
    archetype: "The Creator",
    industry: "Design & Creative",
    primaryColor: "#7c3aed",
    secondaryColor: "#6d28d9",
    accentColor: "#f59e0b",
    primaryColors: ["#7c3aed", "#8b5cf6", "#a78bfa"],
    secondaryColors: ["#6d28d9", "#5b21b6"],
    accentColors: ["#f59e0b", "#fbbf24"],
    fontHeadings: "Montserrat",
    fontBody: "Lato",
    projectOverview: "NEXUS is a creative studio that transforms bold ideas into compelling visual experiences. We work with visionary brands to create identities, campaigns, and digital products that resonate and endure.",
    brandIdentityVoice: "NEXUS is bold, curious, and craft-obsessed. We think big and execute with precision. Our voice balances creative enthusiasm with strategic intelligence.",
    logoPhilosophy: "The NEXUS mark is a study in elegant geometry—nodes connected by precise lines, symbolizing the intersection of creativity, strategy, and technology.",
    colorPaletteText: "Rich violet anchors our palette with creative authority and imagination. The warm amber accent injects energy and optimism into our communications.",
    colorAccessibility: "Violet and amber are used purposefully—always with sufficient contrast. We test every color combination before production.",
    typographyText: "Montserrat's geometric boldness matches our creative confidence, while Lato ensures our written content is always readable and approachable.",
    imageryStyle: "High-contrast, compositionally bold photography. Abstract details alongside human connection. Always intentional, never accidental.",
    graphicElements: "Geometric line networks derived from the logomark. Use as subtle backgrounds or structural elements—never clutter.",
    brandVoiceTone: "Creative and smart. Playful but purposeful. We talk about ideas with genuine excitement.",
    visualStyleGuide: "Bold typography contrasted with open space. 8px grid. Consistent use of hairline rules to define sections.",
    usageRulesText: "The NEXUS wordmark must never be distorted, recolored outside the palette, or placed on busy backgrounds.",
    appendix: "For project inquiries or brand questions: hello@nexus.studio. Brand Standards v1.0, 2026.",
  },
};

const ARCHETYPES = [
  "The Hero", "The Rebel", "The Explorer", "The Everyman",
  "The Innocent", "The Caregiver", "The Sage", "The Ruler",
  "The Creator", "The Magician", "The Lover", "The Jester",
];

// ─── Sample SVG Logos ────────────────────────────────────────────────────────

const SAMPLE_LOGOS: Record<string, string> = {
  none: "",
  geometric: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <polygon points="100,20 180,160 20,160" fill="currentColor" opacity="0.9"/>
  <polygon points="100,60 150,150 50,150" fill="white" opacity="0.3"/>
</svg>`,
  wordmark: `<svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="35" width="8" height="50" fill="currentColor"/>
  <text x="20" y="80" font-family="Arial Black, sans-serif" font-size="62" font-weight="900" fill="currentColor">BRAND</text>
</svg>`,
  circle: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" stroke-width="12"/>
  <circle cx="100" cy="100" r="50" fill="currentColor"/>
  <circle cx="100" cy="100" r="25" fill="white"/>
</svg>`,
  diamond: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="40" y="40" width="120" height="120" transform="rotate(45 100 100)" fill="currentColor"/>
  <rect x="60" y="60" width="80" height="80" transform="rotate(45 100 100)" fill="white" opacity="0.2"/>
</svg>`,
};

// ─── Types ───────────────────────────────────────────────────────────────────

type PresetKey = keyof typeof PRESETS;

interface FormData {
  businessName: string;
  tagline: string;
  archetype: string;
  industry: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  primaryColors: string[];
  secondaryColors: string[];
  accentColors: string[];
  fontHeadings: string;
  fontBody: string;
  projectOverview: string;
  brandIdentityVoice: string;
  logoPhilosophy: string;
  colorPaletteText: string;
  colorAccessibility: string;
  typographyText: string;
  imageryStyle: string;
  graphicElements: string;
  brandVoiceTone: string;
  visualStyleGuide: string;
  usageRulesText: string;
  appendix: string;
  logoSvg: string;
}

interface GenerateResult {
  html: string;
  pdfBase64: string | null;
  assetsUsed: Record<string, unknown>;
  htmlMs: number;
  totalMs: number;
  pdfSizeKb: number | null;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PDFTestPage() {
  const [form, setForm] = useState<FormData>({ ...PRESETS.THUNDERFORGE, logoSvg: "" });
  const [selectedLogo, setSelectedLogo] = useState<string>("none");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "source">("preview");
  const [coverOnly, setCoverOnly] = useState(false);

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev: FormData) => ({ ...prev, [field]: value }));
  };

  const loadPreset = (key: PresetKey) => {
    setForm({ ...PRESETS[key], logoSvg: selectedLogo !== "none" ? SAMPLE_LOGOS[selectedLogo] : "" });
  };

  const handleLogoChange = (val: string) => {
    setSelectedLogo(val);
    setForm((prev: FormData) => ({ ...prev, logoSvg: val !== "none" ? SAMPLE_LOGOS[val] : "" }));
  };

  const call = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/test/pdf-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          generatePdf: false,
          coverOnly,
          orderId: Date.now(),
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Generation failed");
      setResult(data);
      setActiveTab("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [form, coverOnly]);

  // Client-side PDF: open the rendered HTML in a new window and trigger browser print.
  // The browser's "Save as PDF" destination produces an identical result to Puppeteer
  // and works without any server-side Chromium binary.
  const printAsPdf = () => {
    if (!result?.html) return;
    const win = window.open("", "_blank");
    if (!win) { alert("Allow pop-ups for this page to use Save as PDF."); return; }
    win.document.open();
    win.document.write(result.html);
    win.document.close();
    // Small delay lets the browser finish rendering fonts/images before print dialog
    setTimeout(() => { win.focus(); win.print(); }, 600);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900 px-6 py-4">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-xl font-bold text-white">PDF Generation Test Suite</h1>
            <p className="text-sm text-gray-400 mt-0.5">Adjust any field, pick a logo, and preview the brand guide PDF</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Load preset:</span>
            {(Object.keys(PRESETS) as PresetKey[]).map(key => (
              <Button key={key} size="sm" variant="outline" onClick={() => loadPreset(key)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 text-xs">
                {key}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto flex gap-0 h-[calc(100vh-73px)]">

        {/* ── Left: Form ─────────────────────────────────────────────────── */}
        <div className="w-[480px] flex-shrink-0 border-r border-gray-800 overflow-y-auto bg-gray-900/50">
          <div className="p-5 space-y-5">

            {/* Identity */}
            <Section title="Brand Identity">
              <FieldRow>
                <Field label="Business Name">
                  <Input value={form.businessName} onChange={e => updateField("businessName", e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white" />
                </Field>
                <Field label="Tagline">
                  <Input value={form.tagline} onChange={e => updateField("tagline", e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white" />
                </Field>
              </FieldRow>
              <FieldRow>
                <Field label="Archetype">
                  <Select value={form.archetype} onValueChange={v => updateField("archetype", v)}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ARCHETYPES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Industry">
                  <Input value={form.industry} onChange={e => updateField("industry", e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white" />
                </Field>
              </FieldRow>
            </Section>

            {/* Colors */}
            <Section title="Colors">
              <div className="grid grid-cols-3 gap-3">
                {(["primaryColor", "secondaryColor", "accentColor"] as const).map(key => (
                  <Field key={key} label={key.replace("Color", "")}>
                    <div className="flex items-center gap-2">
                      <input type="color" value={form[key]}
                        onChange={e => updateField(key, e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
                      <Input value={form[key]} onChange={e => updateField(key, e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white font-mono text-sm" />
                    </div>
                  </Field>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Field label="Heading Font">
                  <Input value={form.fontHeadings} onChange={e => updateField("fontHeadings", e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white" placeholder="Playfair Display" />
                </Field>
                <Field label="Body Font">
                  <Input value={form.fontBody} onChange={e => updateField("fontBody", e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white" placeholder="Inter" />
                </Field>
              </div>
            </Section>

            {/* Logo */}
            <Section title="Logo">
              <Field label="Sample Logo">
                <Select value={selectedLogo} onValueChange={handleLogoChange}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No logo (show business name)</SelectItem>
                    <SelectItem value="geometric">Triangle geometric mark</SelectItem>
                    <SelectItem value="wordmark">Bold wordmark</SelectItem>
                    <SelectItem value="circle">Circle mark</SelectItem>
                    <SelectItem value="diamond">Diamond mark</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Custom SVG (paste)">
                <Textarea
                  value={form.logoSvg}
                  onChange={e => { setSelectedLogo("none"); updateField("logoSvg", e.target.value); }}
                  className="bg-gray-800 border-gray-700 text-white font-mono text-xs"
                  rows={3}
                  placeholder='<svg viewBox="0 0 200 200">...</svg>'
                />
              </Field>
            </Section>

            {/* AI Content Sections */}
            <Section title="Brand Copy (AI Content Sections)">
              {([
                ["projectOverview", "Project Overview"],
                ["brandIdentityVoice", "Brand Identity & Voice"],
                ["logoPhilosophy", "Logo Philosophy"],
                ["colorPaletteText", "Color Palette Description"],
                ["colorAccessibility", "Color Accessibility"],
                ["typographyText", "Typography Description"],
                ["imageryStyle", "Imagery Style"],
                ["graphicElements", "Graphic Elements"],
                ["brandVoiceTone", "Brand Voice & Tone"],
                ["visualStyleGuide", "Visual Style Guide"],
                ["usageRulesText", "Usage Rules"],
                ["appendix", "Appendix"],
              ] as [keyof FormData, string][]).map(([field, label]) => (
                <Field key={field} label={label}>
                  <Textarea
                    value={form[field] as string}
                    onChange={e => updateField(field, e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white text-xs"
                    rows={2}
                  />
                </Field>
              ))}
            </Section>
          </div>
        </div>

        {/* ── Right: Preview ─────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Controls bar */}
          <div className="border-b border-gray-800 bg-gray-900 px-5 py-3 flex items-center gap-3 flex-shrink-0">
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer select-none">
              <input type="checkbox" checked={coverOnly} onChange={e => setCoverOnly(e.target.checked)}
                className="rounded" />
              Cover page only
            </label>
            <div className="flex-1" />
            {result && (
              <div className="text-xs text-gray-500">
                {result.htmlMs}ms
                {result.assetsUsed && (
                  <Badge variant="outline" className="ml-2 border-gray-600 text-gray-400 text-xs">
                    {(result.assetsUsed as any).packName}
                  </Badge>
                )}
              </div>
            )}
            <Button size="sm" onClick={() => call()} disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {loading ? (
                <><span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Rendering…</>
              ) : "Preview HTML"}
            </Button>
            {result?.html && (
              <Button size="sm" onClick={printAsPdf}
                className="bg-purple-600 hover:bg-purple-700 text-white">
                Save as PDF
              </Button>
            )}
          </div>

          {/* Tab bar */}
          <div className="border-b border-gray-800 bg-gray-900/50 px-5 flex gap-0 flex-shrink-0">
            {(["preview", "source"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-indigo-500 text-white"
                    : "border-transparent text-gray-500 hover:text-gray-300"
                }`}>
                {tab === "preview" ? "HTML Preview" : "HTML Source"}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 bg-gray-950 relative">
            {error && (
              <div className="absolute inset-0 flex items-start justify-center p-8">
                <Card className="bg-red-950/50 border-red-800 max-w-lg w-full">
                  <CardHeader><CardTitle className="text-red-400 text-base">Generation Error</CardTitle></CardHeader>
                  <CardContent>
                    <pre className="text-red-300 text-xs whitespace-pre-wrap font-mono">{error}</pre>
                  </CardContent>
                </Card>
              </div>
            )}

            {!result && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
                <div className="text-5xl mb-4">📄</div>
                <p className="text-sm">Click <span className="text-indigo-400">Preview HTML</span> to render the brand guide</p>
                <p className="text-xs mt-1 text-gray-700">then <span className="text-purple-400">Save as PDF</span> opens the browser print dialog</p>
              </div>
            )}

            {result && activeTab === "preview" && (
              <iframe
                srcDoc={result.html}
                className="w-full h-full border-0"
                title="PDF Preview"
                sandbox="allow-same-origin"
              />
            )}

            {result && activeTab === "source" && (
              <div className="h-full overflow-auto p-4">
                <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-all leading-5">
                  {result.html}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helper sub-components ───────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="block w-4 h-px bg-gray-700" />
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-gray-400">{label}</Label>
      {children}
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}
