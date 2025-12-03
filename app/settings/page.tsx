"use client";

import { useEffect, useState } from "react";
import {
  fetchSystemInstruction,
  saveSystemInstruction,
  fetchImageAnalysisInstruction,
  saveImageAnalysisInstruction,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { Loader2, ChevronsUpDown } from "lucide-react";

export default function SettingsPage() {
  const [instruction, setInstruction] = useState("");
  const [imageInstruction, setImageInstruction] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const result = await fetchSystemInstruction();
      if (result.success && result.data) {
        setInstruction(result.data);
      } else {
        toast.error("Failed to load settings");
      }

      const imageResult = await fetchImageAnalysisInstruction();
      if (imageResult.success && imageResult.data) {
        setImageInstruction(imageResult.data);
      } else {
        toast.error("Failed to load image settings");
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

  const handleSaveImageInstruction = async () => {
    setIsSavingImage(true);
    const result = await saveImageAnalysisInstruction(imageInstruction);
    if (result.success) {
      toast.success("Image settings saved successfully");
    } else {
      toast.error("Failed to save image settings");
    }
    setIsSavingImage(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl font-sans">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <Collapsible>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle>System Instruction</CardTitle>
              <CardDescription>
                Modify the system instruction used by generate prompts. This
                defines the persona, style, and constraints for the AI.
              </CardDescription>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                <ChevronsUpDown className="h-4 w-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-4">
              <Textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                className="h-[500px] max-h-[calc(100vh-550px)] overflow-y-auto font-mono text-sm"
                placeholder="Enter system instruction..."
              />
              <div className="flex justify-end items-center gap-2">
                <span>Last updated: {new Date().toLocaleString()}</span>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Collapsible className="mt-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle>Image Analysis Instruction</CardTitle>
              <CardDescription>
                Modify the system instruction used for analyzing images (From
                Image). This defines how the AI deconstructs and describes
                uploaded images.
              </CardDescription>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                <ChevronsUpDown className="h-4 w-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-4">
              <Textarea
                value={imageInstruction}
                onChange={(e) => setImageInstruction(e.target.value)}
                className="h-[500px] max-h-[calc(100vh-450px)] overflow-y-auto font-mono text-sm"
                placeholder="Enter image analysis instruction..."
              />
              <div className="flex justify-end items-center gap-2">
                <span>Last updated: {new Date().toLocaleString()}</span>
                <Button
                  onClick={handleSaveImageInstruction}
                  disabled={isSavingImage}
                >
                  {isSavingImage && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
