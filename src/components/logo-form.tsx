
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { LogoFormData, ExtendedLogoGenerationInputs } from "./logo-form-types";
import { logoFormSchema, mapFormDataToAiInput, brandArchetypes, colorPaletteMoods } from "./logo-form-types";
import { useToast } from "@/hooks/use-toast";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Wand2, FileImage, Save, FolderOpen, FileDown, FileUp, ChevronDown, Settings, BookOpen, Palette, Feather, MessageSquare, ShieldAlert, SlidersHorizontal, BrainCircuit, Paintbrush, Type, Activity } from "lucide-react";

interface LogoFormProps {
  onSubmit: (data: ExtendedLogoGenerationInputs & { userApiKey?: string }) => Promise<void>;
  isLoading: boolean;
  initialValues?: Partial<LogoFormData>;
}

const FORM_SETTINGS_KEY = "logoFormSettingsV3"; // Incremented version for new fields

export function LogoForm({ onSubmit, isLoading, initialValues }: LogoFormProps) {
  const { toast } = useToast();
  const form = useForm<LogoFormData>({
    resolver: zodResolver(logoFormSchema),
    defaultValues: initialValues || {
      businessName: "",
      industry: "",
      aestheticKeywords: "",
      emotionalKeywords: "",
      functionalKeywords: "",
      primaryColors: "",
      secondaryColors: "",
      accentColors: "",
      colorPaletteMood: "",
      preferredLogoStyle: "",
      composition: "",
      iconPlacement: "",
      fontStyle: "",
      iconComplexity: "",
      iconSpecifics: "",
      fontHeadings: "",
      fontBody: "",
      fontOther: "",
      targetAudience: "",
      inspirationReferences: "",
      usageContext: "",
      negativeKeywords: "",
      competitorsToAvoid: "",
      variationInstructions: "",
      numberOfLogos: 4,
      referenceImageFile: null,
      missionStatement: "",
      brandPillars: "",
      brandArchetype: "",
      keyTagline: "",
    },
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const currentRefImageFile = form.watch("referenceImageFile");

  const handleSubmit = async (data: LogoFormData) => {
    const extendedAiInput = await mapFormDataToAiInput(data);
    await onSubmit(extendedAiInput);
  };

  const handleSaveToBrowser = () => {
    const currentData = form.getValues();
    const dataToSave = { ...currentData };
    delete dataToSave.referenceImageFile;

    try {
      localStorage.setItem(FORM_SETTINGS_KEY, JSON.stringify(dataToSave));
      toast({
        title: "Settings Saved to Browser",
        description: "Your form settings have been saved in your browser's local storage.",
      });
    } catch (error) {
      console.error("Error saving settings to localStorage:", error);
      toast({
        title: "Save Failed",
        description: "Could not save settings to local storage. Storage might be full.",
        variant: "destructive",
      });
    }
  };

  const handleLoadFromBrowser = () => {
    const savedDataString = localStorage.getItem(FORM_SETTINGS_KEY);
    if (savedDataString) {
      try {
        const savedData = JSON.parse(savedDataString);
        // Ensure all fields, including new ones, are correctly reset or defaulted
        const newDefaultValues = { ...(form.formState.defaultValues as LogoFormData), ...savedData, referenceImageFile: null };
        form.reset(newDefaultValues);
        toast({
          title: "Settings Loaded from Browser",
          description: "Your saved form settings have been loaded.",
        });
      } catch (error) {
        console.error("Error parsing saved settings from localStorage:", error);
        toast({
          title: "Load Failed",
          description: "Could not parse saved settings. They might be corrupted.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "No Saved Settings",
        description: "No settings found in browser storage to load.",
        variant: "default",
      });
    }
  };

  const handleExportToFile = () => {
    const currentData = form.getValues();
    const dataToExport = { ...currentData };
    delete dataToExport.referenceImageFile;

    try {
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "logogenius_settings.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: "Settings Exported",
        description: "Your form settings have been exported to logogenius_settings.json.",
      });
    } catch (error) {
      console.error("Error exporting settings to file:", error);
      toast({
        title: "Export Failed",
        description: "Could not export settings to a file.",
        variant: "destructive",
      });
    }
  };

  const handleImportFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("File content is not readable text.");
        }
        const importedData = JSON.parse(text);
        if (!importedData || typeof importedData.businessName === 'undefined') { // Basic validation
            throw new Error("Invalid settings file format.");
        }
        const newDefaultValues = { ...(form.formState.defaultValues as LogoFormData), ...importedData, referenceImageFile: null };
        form.reset(newDefaultValues);
        toast({
          title: "Settings Imported",
          description: "Form settings have been imported from the file.",
        });
      } catch (error) {
        console.error("Error importing settings from file:", error);
        toast({
          title: "Import Failed",
          description: `Could not import settings: ${error instanceof Error ? error.message : "Unknown error."}`,
          variant: "destructive",
        });
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.onerror = () => {
       toast({
        title: "File Read Error",
        description: "Could not read the selected file.",
        variant: "destructive",
      });
       if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
    }
    reader.readAsText(file);
  };


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Wand2 className="w-6 h-6 text-primary" />
          Describe Your Brand
        </CardTitle>
        <CardDescription>Fill in the details below to generate logo concepts and brand narratives.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <Accordion type="multiple" defaultValue={["basic-info", "brand-keywords"]} className="w-full space-y-4">
              <AccordionItem value="basic-info" className="border-b-0 rounded-md border p-4 shadow-sm data-[state=closed]:border-b data-[state=open]:border-b-0">
                <AccordionTrigger className="py-2 text-lg font-medium hover:no-underline flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary/80" /> Basic Information
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Innovatech Solutions" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry / Niche</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Technology, SaaS, Coffee Shop" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="targetAudience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Audience (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Young professionals, Eco-conscious consumers" {...field} />
                        </FormControl>
                        <FormDescription>Describe who your brand is for.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="brand-strategy" className="border-b-0 rounded-md border p-4 shadow-sm data-[state=closed]:border-b data-[state=open]:border-b-0">
                <AccordionTrigger className="py-2 text-lg font-medium hover:no-underline flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-primary/80" /> Brand Strategy (Optional)
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                   <FormDescription>
                    Define core strategic elements for your brand narrative.
                  </FormDescription>
                  <FormField
                    control={form.control}
                    name="missionStatement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mission Statement</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., To empower creators with innovative tools..."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="brandPillars"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Pillars</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Innovation, Customer-centricity, Sustainability"
                            className="resize-none"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Comma-separated core values or principles.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="brandArchetype"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Archetype</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an archetype (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brandArchetypes.map(archetype => (
                              <SelectItem key={archetype} value={archetype}>{archetype}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Defines brand personality and narrative style.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="keyTagline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key Tagline</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Create. Inspire. Innovate." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="brand-keywords" className="border-b-0 rounded-md border p-4 shadow-sm data-[state=closed]:border-b data-[state=open]:border-b-0">
                <AccordionTrigger className="py-2 text-lg font-medium hover:no-underline flex items-center gap-2">
                 <MessageSquare className="w-5 h-5 text-primary/80" /> Brand Keywords
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                  <FormDescription>
                    Describe your brand identity using keywords. (e.g., modern, minimalist, friendly, bold)
                  </FormDescription>
                  <FormField
                    control={form.control}
                    name="aestheticKeywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aesthetic Keywords</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., sleek, vintage, futuristic, minimalist, playful"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Visual style and appearance.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emotionalKeywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emotional Keywords</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., trustworthy, energetic, calm, joyful, sophisticated"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Feelings or emotions the brand should evoke.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="functionalKeywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Functional Keywords</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., scalable, versatile, memorable, simple, efficient"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Practical attributes or benefits.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="visual-prefs" className="border-b-0 rounded-md border p-4 shadow-sm data-[state=closed]:border-b data-[state=open]:border-b-0">
                <AccordionTrigger className="py-2 text-lg font-medium hover:no-underline flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary/80" /> Logo Visual Preferences
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                  <div className="space-y-2">
                     <h3 className="text-sm font-medium flex items-center gap-1.5">
                       <Paintbrush className="w-4 h-4 text-muted-foreground" />
                       Logo Color Palette Input (Optional)
                    </h3>
                    <FormDescription>
                      Define your logo's color scheme. List multiple colors or descriptive terms, comma-separated.
                    </FormDescription>
                  </div>
                  <FormField
                    control={form.control}
                    name="primaryColors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Colors for Logo</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., Deep Indigo, Royal Blue" className="resize-none" rows={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="secondaryColors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Colors for Logo</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., Light Grey, Cool Silver" className="resize-none" rows={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accentColors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accent Colors for Logo</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., Teal, Vibrant Orange" className="resize-none" rows={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 pt-4">
                    <FormField
                      control={form.control}
                      name="preferredLogoStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Logo Style (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""} defaultValue={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="logomark">Logomark: Icon-only, symbolic</SelectItem>
                              <SelectItem value="wordmark">Wordmark: Text-only, stylized typography</SelectItem>
                              <SelectItem value="lettermark">Lettermark: Initials or monogram</SelectItem>
                              <SelectItem value="combination">Combination Mark: Icon + Text, integrated</SelectItem>
                              <SelectItem value="emblem">Emblem: Text inside a symbol/badge, traditional</SelectItem>
                              <SelectItem value="abstract">Abstract Mark: Unique, conceptual shape</SelectItem>
                              <SelectItem value="mascot">Mascot: Illustrated character</SelectItem>
                              <SelectItem value="minimalist">Minimalist: Simple forms, clean lines</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="composition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Overall Composition (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""} defaultValue={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select composition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="horizontal">Horizontal: Wider than tall</SelectItem>
                              <SelectItem value="vertical">Vertical: Taller than wide</SelectItem>
                              <SelectItem value="circular">Circular: Elements arranged in a circle</SelectItem>
                              <SelectItem value="square">Square: Balanced width and height</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="iconPlacement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icon Placement (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""} defaultValue={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select icon placement" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="above_text">Above Text</SelectItem>
                              <SelectItem value="left_of_text">Left of Text</SelectItem>
                              <SelectItem value="right_of_text">Right of Text</SelectItem>
                              <SelectItem value="below_text">Below Text</SelectItem>
                              <SelectItem value="no_icon">No Icon (Wordmark/Lettermark)</SelectItem>
                              <SelectItem value="icon_only">Icon Only (Logomark)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="iconComplexity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icon Complexity (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""} defaultValue={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select icon complexity" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="simple">Simple: Clean lines, minimal detail</SelectItem>
                              <SelectItem value="detailed">Detailed: More intricate, elaborate</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                   <FormField
                    control={form.control}
                    name="fontStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Font Style for Logo (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Geometric Sans-Serif, Handwritten Script, No Text" {...field} />
                        </FormControl>
                        <FormDescription>
                          Describe font attributes for the logo (e.g., geometric, handwritten) or 'No Text' for icon-only logos.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="iconSpecifics"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specific Icon Imagery for Logo (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., A soaring eagle, intertwined gears, a subtle leaf motif"
                            className="resize-none"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Describe specific objects, symbols, or concepts you want in the logo's icon.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="brand-typography-colors" className="border-b-0 rounded-md border p-4 shadow-sm data-[state=closed]:border-b data-[state=open]:border-b-0">
                <AccordionTrigger className="py-2 text-lg font-medium hover:no-underline flex items-center gap-2">
                  <Type className="w-5 h-5 text-primary/80" /> Brand Typography & Color Mood
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                  <FormDescription>
                    Define overall brand typography and the desired mood for your color palette.
                    These fields are for the brand guide output, not direct logo generation.
                  </FormDescription>
                  <FormField
                    control={form.control}
                    name="fontHeadings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Headings Font (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Montserrat Bold, Playfair Display" {...field} />
                        </FormControl>
                        <FormDescription>Specify the font for main headings in brand materials.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fontBody"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Body Text Font (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Open Sans Regular, Lato" {...field} />
                        </FormControl>
                        <FormDescription>Specify the font for paragraphs and general text.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fontOther"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Other Brand Fonts (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Fira Code for code snippets" {...field} />
                        </FormControl>
                        <FormDescription>Specify any additional fonts for captions, accents, etc.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="colorPaletteMood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color Palette Mood (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a mood for the overall color palette" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {colorPaletteMoods.map(mood => (
                              <SelectItem key={mood} value={mood}>{mood}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Describes the overall feeling of the brand's color scheme.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="advanced-details" className="border-b-0 rounded-md border p-4 shadow-sm data-[state=closed]:border-b data-[state=open]:border-b-0">
                <AccordionTrigger className="py-2 text-lg font-medium hover:no-underline flex items-center gap-2">
                  <Feather className="w-5 h-5 text-primary/80" /> Advanced Logo Details & Context
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                  <FormField
                    control={form.control}
                    name="referenceImageFile"
                    render={({ field: { onChange, value, onBlur, name, ref } }) => ( // value is used here
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileImage className="w-4 h-4" />
                          Reference Image for Logo (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            onBlur={onBlur}
                            name={name}
                            ref={ref}
                            onChange={(e) => {
                              onChange(e.target.files ? e.target.files[0] : null);
                            }}
                            className="pt-2"
                          />
                        </FormControl>
                         {currentRefImageFile && typeof currentRefImageFile === 'object' && currentRefImageFile.name && (
                          <FormDescription className="mt-1 text-xs">
                            Current file: {currentRefImageFile.name}
                          </FormDescription>
                        )}
                        <FormDescription>Upload an existing sketch, character, or logo for inspiration.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="inspirationReferences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inspiration / References for Logo (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Inspired by Nike's simplicity, Apple's sleekness."
                            className="resize-none"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Provide visual or brand benchmarks for the logo design.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="competitorsToAvoid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Competitor Brands to Differentiate From (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Brand X (too similar style), Brand Y (want to be more modern)"
                            className="resize-none"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>List brands you want your logo to stand apart from.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="usageContext"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Usage Context for Logo (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Web (responsive), Packaging (bold & scalable), Social media profiles."
                            className="resize-none"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Where will the logo primarily be used? (e.g., "Digital & Print", "Merchandise").</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="negativeKeywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Things to Avoid in Logo (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., No gradients, avoid cartoonish elements, not too corporate, avoid using X, Y, Z, avoid complex details."
                            className="resize-none"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>List elements, styles, or concepts to exclude from the logo.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="gen-settings" className="border-b-0 rounded-md border p-4 shadow-sm data-[state=closed]:border-b data-[state=open]:border-b-0">
                <AccordionTrigger className="py-2 text-lg font-medium hover:no-underline flex items-center gap-2">
                   <SlidersHorizontal className="w-5 h-5 text-primary/80" /> Logo Generation Settings
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                  <FormField
                    control={form.control}
                    name="numberOfLogos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Logos to Generate</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="8"
                            {...field}
                            onChange={event => field.onChange(+event.target.value)}
                          />
                        </FormControl>
                        <FormDescription>
                          Choose between 1 and 8 logos.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="variationInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo Variation Instructions (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Emphasize different fonts; Try one minimalist icon and one detailed."
                            className="resize-none"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Guide how the multiple logo concepts should differ.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="pt-4 space-y-4">
              <Card className="shadow-sm border rounded-md">
                <CardHeader className="pb-3 pt-4">
                  <CardTitle className="text-lg flex items-center">
                     <Settings className="mr-2 h-5 w-5" /> Manage Form Settings
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Save, load, or share your current form preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center pb-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full max-w-xs">
                          Settings Actions <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-64">
                        <DropdownMenuItem onClick={handleSaveToBrowser}>
                          <Save className="mr-2 h-4 w-4" /> Save to Browser
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLoadFromBrowser}>
                          <FolderOpen className="mr-2 h-4 w-4" /> Load from Browser
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleExportToFile}>
                          <FileDown className="mr-2 h-4 w-4" /> Export to File
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                          <FileUp className="mr-2 h-4 w-4" /> Import from File
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                   <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImportFromFile}
                    accept=".json"
                    className="hidden"
                  />
                </CardContent>
              </Card>
            </div>


            <Button type="submit" className="w-full !mt-8" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Logos & Brand Narrative"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
