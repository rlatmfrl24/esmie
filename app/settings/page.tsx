"use client";

import { useEffect, useState } from "react";
import {
  fetchSystemInstruction,
  saveSystemInstruction,
} from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [instruction, setInstruction] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const result = await fetchSystemInstruction();
      if (result.success && result.data) {
        setInstruction(result.data);
      } else {
        toast.error("Failed to load settings");
      }
      setIsLoading(false);
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const result = await saveSystemInstruction(instruction);
    if (result.success) {
      toast.success("Settings saved successfully");
    } else {
      toast.error("Failed to save settings");
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl font-sans">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Gemini System Instruction</CardTitle>
          <CardDescription>
            Modify the system instruction used by Gemini to generate prompts.
            This defines the persona, style, and constraints for the AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            className="min-h-[500px] font-mono text-sm"
            placeholder="Enter system instruction..."
          />
          <div className="flex justify-end items-center gap-2">
            <span>Last updated: {new Date().toLocaleString()}</span>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
