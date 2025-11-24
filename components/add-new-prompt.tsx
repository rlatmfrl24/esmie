"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import { createClient } from "@/lib/client";
import { PromptFormData } from "@/lib/types";
import { generateFullPrompt } from "@/lib/utils";
import { PromptForm, PromptFormState } from "@/components/prompt-form";

export function AddNewPrompt() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (formData: PromptFormState) => {
    setIsLoading(true);
    setError("");

    try {
      const supabase = createClient();
      console.log("Supabase client created");

      // 현재 사용자 정보 가져오기
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

      // fullPrompt가 입력된 경우 사용하고, 없으면 자동 생성
      const finalPrompt = formData.fullPrompt.trim()
        ? formData.fullPrompt
        : generateFullPrompt(insertData as PromptFormData);
      insertData.final_prompt = finalPrompt;
      console.log("Inserting data:", insertData);

      const { data, error } = await supabase
        .from("prompts")
        .insert([insertData])
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Data inserted successfully:", data);

      // 성공 시 다이얼로그 닫기
      setOpen(false);

      // 페이지 새로고침하여 최신 데이터 표시
      window.location.reload();
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusIcon className="w-4 h-4" />
          Add New Prompt
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[70vw] max-h-[80vh] flex flex-col p-0"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Add New Prompt</DialogTitle>
          <DialogDescription>
            Add a new prompt to your dashboard.
          </DialogDescription>
        </DialogHeader>
        <PromptForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isLoading={isLoading}
          submitError={error}
        />
      </DialogContent>
    </Dialog>
  );
}
