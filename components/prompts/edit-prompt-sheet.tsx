"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Edit2 } from "lucide-react";
import { updatePrompt } from "@/app/actions/prompt";
import { Prompt } from "@/lib/types";
import { PromptForm, PromptFormState } from "@/components/prompts/prompt-form";
import { useRouter } from "next/navigation";

interface EditPromptSheetProps {
  prompt: Prompt;
}

export function EditPromptSheet({ prompt }: EditPromptSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [submitError, setSubmitError] = useState<string | undefined>();

  const initialData: Partial<PromptFormState> = {
    coreTheme: prompt.core_theme,
    hair: prompt.hair,
    pose: prompt.pose,
    outfit: prompt.outfit,
    atmosphere: prompt.atmosphere,
    gaze: prompt.gaze,
    makeup: prompt.makeup,
    background: prompt.background,
    aspectRatio: prompt.aspect_ratio,
    details: prompt.details,
    fullPrompt: prompt.final_prompt,
  };

  const handleSubmit = async (data: PromptFormState) => {
    setIsLoading(true);
    setSubmitError(undefined);
    try {
      const result = await updatePrompt(
        prompt.id,
        {
          core_theme: data.coreTheme,
          hair: data.hair,
          pose: data.pose,
          outfit: data.outfit,
          atmosphere: data.atmosphere,
          gaze: data.gaze,
          makeup: data.makeup,
          background: data.background,
          aspect_ratio: data.aspectRatio,
          details: data.details,
        },
        data.fullPrompt
      );

      if (result.success) {
        setOpen(false);
        router.refresh();
      } else {
        setSubmitError(result.error || "업데이트에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error updating prompt:", error);
      setSubmitError("업데이트 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Edit2 className="w-4 h-4 mr-2" />
        Edit
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-hidden flex flex-col p-0 gap-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>Edit Prompt</SheetTitle>
            <SheetDescription>
              Modify the prompt details below. This will create a new version.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 min-h-0 py-4">
            <PromptForm
              initialData={initialData}
              onSubmit={handleSubmit}
              onCancel={() => setOpen(false)}
              isLoading={isLoading}
              submitError={submitError}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
