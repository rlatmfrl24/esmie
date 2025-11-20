"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { createClient } from "@/lib/client";

interface Prompt {
  id: string;
  core_theme: string;
  version: number;
  hair: string;
  pose: string;
  outfit: string;
  atmosphere: string;
  gaze: string;
  makeup: string;
  background: string;
  final_prompt: string;
  aspect_ratio: string;
  created_at?: string;
}

interface PromptCardProps {
  prompt: Prompt;
}

export function PromptCard({ prompt }: PromptCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("prompts")
        .delete()
        .eq("id", prompt.id);

      if (error) {
        console.error("삭제 중 오류 발생:", error);
        alert(`삭제 중 오류가 발생했습니다: ${error.message}`);
        setIsDeleting(false);
        return;
      }

      // 성공 시 다이얼로그 닫고 페이지 새로고침
      setIsDeleteDialogOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("삭제 중 오류 발생:", error);
      alert(
        `삭제 중 오류가 발생했습니다: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`
      );
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{prompt.core_theme || `Prompt ${prompt.id}`}</CardTitle>
          <CardDescription>Version {prompt.version}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {prompt.final_prompt && (
              <div className="text-lg font-medium">
                <p className="line-clamp-3">{prompt.final_prompt}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>
                <span className="font-medium">Hair:</span> {prompt.hair}
              </div>
              <div>
                <span className="font-medium">Pose:</span> {prompt.pose}
              </div>
              <div>
                <span className="font-medium">Outfit:</span> {prompt.outfit}
              </div>
              <div>
                <span className="font-medium">Gaze:</span> {prompt.gaze}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>프롬프트 삭제 확인</DialogTitle>
            <DialogDescription>
              정말로 이 프롬프트를 삭제하시겠습니까? 이 작업은 되돌릴 수
              없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
