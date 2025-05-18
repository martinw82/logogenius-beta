
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { LogoFormData, ExtendedLogoGenerationInputs } from "./logo-form-types";
import { logoFormSchema, mapFormDataToAiInput, brandArchetypes, colorPaletteMoodsData, colorPaletteMoods, CLEAR_MOOD_VALUE, commonFontList, NONE_VALUE } from "./logo-form-types"; 
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
import { Checkbox } from "@/components/ui/checkbox";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Wand2, FileImage, Save, FolderOpen, FileDown, FileUp, ChevronDown, Settings, BookOpen, Palette as PaletteIconLucide, Feather, MessageSquare, ShieldAlert, SlidersHorizontal, BrainCircuit, Paintbrush, Type, Activity, HelpCircle, GlobeLock } from "lucide-react";
import { BrandArchetypeQuiz } from "./brand-archetype-quiz";


interface LogoFormProps {
  onSubmit: (data: ExtendedLogoGenerationInputs & { userApiKey?: string }) => Promise<void>;
  isLoading: boolean;
  initialValues?: Partial<LogoFormData>;
}

const FORM_SETTINGS_KEY = "logoFormSettingsV3"; 

const web3BlockchainFocusOptions = [
  "Ethereum", "Solana", "Polygon", "Bitcoin L2s", "Cross-chain", "Blockchain Agnostic", "Other"
] as const;

const web3ProjectTypeOptions = [
  "DeFi", "NFT Project", "DAO", "Infrastructure", "Metaverse", "Gaming", "SocialFi", "Other"
] as const;


export function LogoForm({ onSubmit, isLoading, initialValues }: LogoFormProps) {
  const { toast } = useToast();
  const [isQuizDialogOpen, setIsQuizDialogOpen] = React.useState(false);

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
      useHeadingsFontForLogo: false,
      fontBody: "",
      useBodyFontForLogo: false,
      fontOther: "",
      useOtherFontForLogo: false,
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
      // Web3 defaults
      web3BlockchainFocus: "",
      web3ProjectType: "",
      web3EnsDomainIdeas: "",
      web3TokenSymbolIdea: "",
      web3CommunityValues: "",
      web3NftAesthetic: "",
    },
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const currentRefImageFile = form.watch("referenceImageFile");

  const handleSubmit = async (data: LogoFormData) => {
    const extendedAiInput = await mapFormDataToAiInput(data);
    await onSubmit(extendedAiInput);
  };

  const handleQuizComplete = (archetype: string, analysis: string, selectedMoodName?: string) => {
    form.setValue('brandArchetype', archetype as (typeof brandArchetypes)[number], { shouldValidate: true });

    let toastMessage = `Your "Brand Archetype" field has been updated to ${archetype}.`;
    if (analysis) { 
        toastMessage += ` ${analysis}`;
    }


    if (selectedMoodName) {
      const moodData = colorPaletteMoodsData.find(m => m.name === selectedMoodName);
      if (moodData) {
        form.setValue('colorPaletteMood', moodData.name as (typeof colorPaletteMoods)[number], { shouldValidate: true });
        form.setValue("primaryColors", moodData.primary, { shouldValidate: true });
        form.setValue("secondaryColors", moodData.secondary, { shouldValidate: true });
        form.setValue("accentColors", moodData.accent, { shouldValidate: true });
        toastMessage += ` The color palette mood has been set to "${selectedMoodName}" and colors have been pre-filled.`;
      }
    }

    setIsQuizDialogOpen(false);
    toast({
      title: `Archetype Applied: ${archetype}`,
      description: (
        <p className="text-sm">
          {toastMessage}
        </p>
      ),
      duration: 9000,
    });
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
        if (!importedData || typeof importedData.businessName === 'undefined') { 
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
            <Accordion type="multiple" defaultValue={["basic-info", "brand-keywords", "visual-prefs"]} className="w-full space-y-4">
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
                   <FormDescription className="pb-2">
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
                        <div className="flex items-center gap-2">
                          <Select onValueChange={field.onChange} value={field.value || ""} >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an archetype" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={NONE_VALUE}>No specific archetype</SelectItem>
                              {brandArchetypes.map(archetype => (
                                <SelectItem key={archetype} value={archetype}>{archetype}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" type="button" className="shrink-0">
                                <HelpCircle className="w-4 h-4 mr-2" />
                                Take Quiz
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Brand Archetype Discovery Quiz</DialogTitle>
                                  <DialogDescription>
                                    Answer the questions to discover your brand's archetype. This will help define its personality and voice.
                                  </DialogDescription>
                                </DialogHeader>
                                <BrandArchetypeQuiz 
                                  open={isQuizDialogOpen}
                                  onOpenChange={setIsQuizDialogOpen}
                                  onQuizComplete={handleQuizComplete} 
                                />
                            </DialogContent>
                          </Dialog>
                        </div>
                        <FormDescription>Defines brand personality and narrative style. Or, take the quiz!</FormDescription>
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
                  <PaletteIconLucide className="w-5 h-5 text-primary/80" /> Logo Visual Preferences
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                    <div className="space-y-2 mb-4">
                        <h3 className="text-sm font-medium flex items-center gap-1.5">
                        <Paintbrush className="w-4 h-4 text-muted-foreground" />
                        Logo Color Palette Input
                        </h3>
                    </div>
                    <FormField
                        control={form.control}
                        name="colorPaletteMood"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Color Palette Mood (Optional)</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                if (value === CLEAR_MOOD_VALUE) {
                                  field.onChange(''); // Set mood to empty string for RHF
                                } else {
                                  field.onChange(value); 
                                  const selectedMoodData = colorPaletteMoodsData.find(m => m.name === value);
                                  if (selectedMoodData) {
                                    form.setValue("primaryColors", selectedMoodData.primary, { shouldValidate: true });
                                    form.setValue("secondaryColors", selectedMoodData.secondary, { shouldValidate: true });
                                    form.setValue("accentColors", selectedMoodData.accent, { shouldValidate: true });
                                  }
                                }
                              }} 
                              value={field.value || ""}
                            >
                              <FormControl>
                                  <SelectTrigger>
                                  <SelectValue placeholder="Select a mood to pre-fill colors" />
                                  </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                  <SelectItem value={CLEAR_MOOD_VALUE}>No specific mood</SelectItem>
                                  {colorPaletteMoodsData.map(moodItem => (
                                  <SelectItem key={moodItem.name} value={moodItem.name}>{moodItem.name}</SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>Describes the overall feeling of the brand's color scheme. Selecting a mood pre-fills colors below. Select "No specific mood" to clear.</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    
                    <FormField
                        control={form.control}
                        name="primaryColors"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Primary Color</FormLabel>
                            <div className="flex items-center gap-2">
                            <FormControl>
                                <Input 
                                  placeholder="e.g., #3F51B5 or Deep Indigo" 
                                  {...field} 
                                  value={field.value || ""}
                                />
                            </FormControl>
                            <FormControl>
                                <Input 
                                type="color" 
                                value={(field.value && field.value.startsWith('#') && (field.value.length === 7 || field.value.length === 4)) ? field.value : '#000000'}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="w-10 h-10 p-1 min-w-[2.5rem]"
                                />
                            </FormControl>
                            </div>
                            <FormDescription>Specify the main color for your logo.</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="secondaryColors"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Secondary Color</FormLabel>
                            <div className="flex items-center gap-2">
                            <FormControl>
                                <Input 
                                  placeholder="e.g., #EEEEEE or Light Grey" 
                                  {...field} 
                                  value={field.value || ""}
                                />
                            </FormControl>
                            <FormControl>
                                <Input 
                                type="color" 
                                value={(field.value && field.value.startsWith('#') && (field.value.length === 7 || field.value.length === 4)) ? field.value : '#000000'}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="w-10 h-10 p-1 min-w-[2.5rem]"
                                />
                            </FormControl>
                            </div>
                            <FormDescription>Specify a complementary or secondary color.</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="accentColors"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Accent Color</FormLabel>
                            <div className="flex items-center gap-2">
                            <FormControl>
                                <Input 
                                  placeholder="e.g., #009688 or Teal" 
                                  {...field} 
                                  value={field.value || ""}
                                />
                            </FormControl>
                            <FormControl>
                                <Input 
                                type="color" 
                                value={(field.value && field.value.startsWith('#') && (field.value.length === 7 || field.value.length === 4)) ? field.value : '#000000'}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="w-10 h-10 p-1 min-w-[2.5rem]"
                                />
                            </FormControl>
                            </div>
                            <FormDescription>Specify an accent color for highlights.</FormDescription>
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
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={NONE_VALUE}>Any Style / No Preference</SelectItem>
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
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select composition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={NONE_VALUE}>Any Composition / No Preference</SelectItem>
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
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select icon placement" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={NONE_VALUE}>Any Placement / No Preference</SelectItem>
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
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select icon complexity" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={NONE_VALUE}>Any Complexity / No Preference</SelectItem>
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
                          This can be overridden if a Brand Font is selected for logo use in the "Brand Typography" section.
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

              <AccordionItem value="brand-typography" className="border-b-0 rounded-md border p-4 shadow-sm data-[state=closed]:border-b data-[state=open]:border-b-0">
                <AccordionTrigger className="py-2 text-lg font-medium hover:no-underline flex items-center gap-2">
                  <Type className="w-5 h-5 text-primary/80" /> Brand Typography
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                  <FormDescription>
                    Define overall brand typography. These fields are for the brand guide output.
                    You can also choose to use one of these fonts for the logo generation itself.
                  </FormDescription>
                  
                  <FormField
                    control={form.control}
                    name="fontHeadings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Headings Font (Optional)</FormLabel>
                         <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a font for headings" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={NONE_VALUE}>No specific font</SelectItem>
                              {commonFontList.map(font => (
                                <SelectItem key={font} value={font}>{font}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        <FormDescription>Specify the font for main headings in brand materials.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="useHeadingsFontForLogo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm bg-muted/30">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            Use Headings Font for Logo Style
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fontBody"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Body Text Font (Optional)</FormLabel>
                         <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a font for body text" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={NONE_VALUE}>No specific font</SelectItem>
                              {commonFontList.map(font => (
                                <SelectItem key={font} value={font}>{font}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        <FormDescription>Specify the font for paragraphs and general text.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="useBodyFontForLogo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm bg-muted/30">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            Use Body Font for Logo Style
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fontOther"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Other Brand Fonts (Optional)</FormLabel>
                         <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select another font" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={NONE_VALUE}>No specific font</SelectItem>
                              {commonFontList.map(font => (
                                <SelectItem key={font} value={font}>{font}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        <FormDescription>Specify any additional fonts for captions, accents, etc.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="useOtherFontForLogo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm bg-muted/30">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            Use "Other" Font for Logo Style
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="web3-branding" className="border-b-0 rounded-md border p-4 shadow-sm data-[state=closed]:border-b data-[state=open]:border-b-0">
                <AccordionTrigger className="py-2 text-lg font-medium hover:no-underline flex items-center gap-2">
                  <GlobeLock className="w-5 h-5 text-primary/80" /> Web3 Branding (Optional)
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                  <FormField
                    control={form.control}
                    name="web3BlockchainFocus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Blockchain Focus</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select blockchain focus" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={NONE_VALUE}>No specific focus</SelectItem>
                            {web3BlockchainFocusOptions.map(option => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="web3ProjectType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Web3 Project Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select project type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={NONE_VALUE}>Not specified</SelectItem>
                            {web3ProjectTypeOptions.map(option => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="web3EnsDomainIdeas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ENS/Domain Ideas</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., myproject.eth, coolbrand.xyz"
                            className="resize-none"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="web3TokenSymbolIdea"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Token Symbol Idea (if applicable)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., LGT, MPRJ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="web3CommunityValues"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Core Community Values</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Transparency, Decentralization, Inclusivity"
                            className="resize-none"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="web3NftAesthetic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Desired NFT Aesthetic (if applicable)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Pixel art, generative abstract, 3D avatars, utilitarian"
                            className="resize-none"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
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
                    render={({ field: { onChange, value, onBlur, name, ref } }) => ( 
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

