
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KeyRound, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_KEY_STORAGE_KEY = "userGoogleApiKey";

export function ApiKeyInput() {
  const [apiKey, setApiKey] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
      toast({
        title: "API Key Saved",
        description: "Your Google AI API key has been saved locally.",
      });
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
      toast({
        title: "API Key Cleared",
        description: "Your Google AI API key has been cleared.",
        variant: "default" 
      });
    }
  };

  if (!isMounted) {
    return null; // Or a loading skeleton
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-md mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <KeyRound className="w-5 h-5 text-primary" />
          Use Your Own API Key (Optional)
        </CardTitle>
        <CardDescription>
          Enter your Google AI API key to use your own quota. The key will be stored in your browser&apos;s local storage.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="apiKeyInput">Google AI API Key</Label>
          <Input
            id="apiKeyInput"
            type="password"
            placeholder="Enter your API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="mt-1"
          />
        </div>
        <Button onClick={handleSaveKey} className="w-full sm:w-auto">
          <Save className="w-4 h-4 mr-2" />
          Save API Key
        </Button>
         <p className="text-xs text-muted-foreground pt-2">
          If no key is provided, the application may use a shared key with limited quota. 
          You can find or create a Google AI API key in the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Google AI Studio</a>.
        </p>
      </CardContent>
    </Card>
  );
}
