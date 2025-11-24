"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateModeSelector, CreateMode } from "@/components/create/create-mode-selector";
import { KeywordsInput } from "@/components/create/keywords-input";
import { PromptInput } from "@/components/create/prompt-input";
import { ImageInput } from "@/components/create/image-input";
import { PromptForm, PromptFormState } from "@/components/prompt-form";
import {
  generatePromptFromKeywords,
  generatePromptFromText,
  generatePromptFromImage,
} from "@/app/actions/gemini";
import { createClient } from "@/lib/client";
import { PromptFormData } from "@/lib/types";
import { generateFullPrompt } from "@/lib/utils";

type Step = "selection" | "input" | "review";

export default function CreatePage() {
  const router = useRouter();
  const [mode, setMode] = useState<CreateMode | null>(null);
  const [step, setStep] = useState<Step>("selection");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState<Partial<PromptFormState>>({});
  const [error, setError] = useState<string>("");

  const handleModeSelect = (selectedMode: CreateMode) => {
    setMode(selectedMode);
    if (selectedMode === "manual") {
      setStep("review");
      setGeneratedData({});
    } else {
      setStep("input");
    }
    setError("");
  };

  const handleBack = () => {
    if (step === "review" && mode !== "manual") {
      setStep("input");
    } else {
      setStep("selection");
      setMode(null);
      setGeneratedData({});
    }
    setError("");
  };

  const handleGenerateFromKeywords = async (keywords: string[]) => {
    setIsLoading(true);
    setError("");
    try {
      const result = await generatePromptFromKeywords(keywords);
      if (result.success && result.data) {
        setGeneratedData(result.data);
        setStep("review");
      } else {
        setError(result.error || "Failed to generate prompt.");
      }
    } catch (e) {
      setError("An unexpected error occurred.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFromText = async (text: string, optimize: boolean) => {
    setIsLoading(true);
    setError("");
    try {
      const result = await generatePromptFromText(text, optimize);
      if (result.success && result.data) {
        setGeneratedData(result.data);
        setStep("review");
      } else {
        setError(result.error || "Failed to generate prompt.");
      }
    } catch (e) {
      setError("An unexpected error occurred.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFromImage = async (base64: string) => {
    setIsLoading(true);
    setError("");
    try {
      const result = await generatePromptFromImage(base64);
      if (result.success && result.data) {
        setGeneratedData(result.data);
        setStep("review");
      } else {
        setError(result.error || "Failed to generate prompt.");
      }
    } catch (e) {
      setError("An unexpected error occurred.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (formData: PromptFormState) => {
    setIsLoading(true);
    setError("");

    try {
      const supabase = createClient();
      
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("사용자 인증이 필요합니다.");
      }

      const insertData = {
        core_theme: formData.coreTheme,
        version: 1,
        hair: formData.hair,
        pose: formData.pose,
        outfit: formData.outfit,
        atmosphere: formData.atmosphere,
        gaze: formData.gaze,
        makeup: formData.makeup,
        background: formData.background,
        final_prompt: "",
        aspect_ratio: formData.aspectRatio,
        user_id: user.id,
        details: formData.details || "",
      };

      const finalPrompt = formData.fullPrompt.trim()
        ? formData.fullPrompt
        : generateFullPrompt(insertData as PromptFormData);
      insertData.final_prompt = finalPrompt;

      const { error } = await supabase
        .from("prompts")
        .insert([insertData]);

      if (error) {
        throw error;
      }

      // Redirect to home or dashboard
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error saving prompt:", error);
      setError(
        error instanceof Error ? error.message : "저장 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 min-h-screen flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create New Prompt</h1>
        {step !== "selection" && (
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-md">
          {error}
        </div>
      )}

      <div className="flex-1">
        {step === "selection" && (
          <CreateModeSelector onSelect={handleModeSelect} />
        )}

        {step === "input" && mode === "keywords" && (
          <KeywordsInput
            onGenerate={handleGenerateFromKeywords}
            isLoading={isLoading}
          />
        )}

        {step === "input" && mode === "prompt" && (
          <PromptInput
            onGenerate={handleGenerateFromText}
            isLoading={isLoading}
          />
        )}

        {step === "input" && mode === "image" && (
          <ImageInput
            onGenerate={handleGenerateFromImage}
            isLoading={isLoading}
          />
        )}

        {step === "review" && (
          <div className="max-w-3xl mx-auto border rounded-lg p-6 bg-card">
             <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Review & Edit</h2>
                <p className="text-muted-foreground">
                    Review the generated details and make any necessary adjustments before saving.
                </p>
             </div>
            <PromptForm
              initialData={generatedData}
              onSubmit={handleSave}
              onCancel={handleBack}
              isLoading={isLoading}
              submitError={error}
            />
          </div>
        )}
      </div>
    </div>
  );
}

