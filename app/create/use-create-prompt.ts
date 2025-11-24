import { useState } from "react";
import { useRouter } from "next/navigation";
import { PromptFormState } from "@/components/prompt-form";
import { CreateMode } from "@/components/create/create-mode-selector";
import {
  generatePromptFromKeywords,
  generatePromptFromText,
  generatePromptFromImage,
} from "@/app/actions/gemini";
import { createClient } from "@/lib/client";
import { PromptFormData } from "@/lib/types";
import { generateFullPrompt } from "@/lib/utils";

export type Step = "selection" | "input" | "review";

export function useCreatePrompt() {
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

  return {
    mode,
    step,
    isLoading,
    generatedData,
    error,
    handleModeSelect,
    handleBack,
    handleGenerateFromKeywords,
    handleGenerateFromText,
    handleGenerateFromImage,
    handleSave,
  };
}
