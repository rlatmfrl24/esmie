"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CopyPlus } from "lucide-react";
import { createClient } from "@/lib/client";
import { Prompt } from "@/lib/types";

interface DuplicatePromptButtonProps {
  prompt: Prompt;
}

export function DuplicatePromptButton({ prompt }: DuplicatePromptButtonProps) {
  const router = useRouter();
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleDuplicateClick = () => {
    setIsDuplicateDialogOpen(true);
  };

  const handleDuplicateConfirm = async () => {
    setIsDuplicating(true);
    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("사용자 인증이 필요합니다.");
      }

      const { id: _promptId, created_at: _createdAt, ...promptData } = prompt;

      void _promptId;
      void _createdAt;

      const { error } = await supabase.from("prompts").insert({
        ...promptData,
        user_id: user.id,
        core_theme: promptData.core_theme + " (Copy)",
        details: promptData.details ?? "",
      });

      if (error) throw error;

      setIsDuplicateDialogOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("복제 중 오류 발생:", error);
      alert(
        `복제 중 오류가 발생했습니다: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`
      );
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <>
      <Button onClick={handleDuplicateClick} variant="outline">
        <CopyPlus className="w-4 h-4 mr-2" />
        Duplicate
      </Button>

      <Dialog
        open={isDuplicateDialogOpen}
        onOpenChange={setIsDuplicateDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>프롬프트 복제 확인</DialogTitle>
            <DialogDescription>
              이 프롬프트를 복제하시겠습니까? 복제된 프롬프트는 제목에
              &quot;(Copy)&quot;가 추가됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDuplicateDialogOpen(false)}
              disabled={isDuplicating}
            >
              취소
            </Button>
            <Button
              variant="default"
              onClick={handleDuplicateConfirm}
              disabled={isDuplicating}
            >
              {isDuplicating ? "복제 중..." : "복제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
