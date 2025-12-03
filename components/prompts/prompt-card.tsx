"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Copy, Quote, Sparkles } from "lucide-react";
import { createClient } from "@/lib/client";
import { Prompt } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface PromptCardProps {
  prompt: Prompt;
  isSelected?: boolean;
  onToggleSelect?: (checked: boolean) => void;
  onDelete?: () => Promise<void>;
  deleteConfirmMessage?: string;
  onCardClick?: () => void;
}

export function PromptCard({
  prompt,
  isSelected,
  onToggleSelect,
  onDelete,
  deleteConfirmMessage,
  onCardClick,
}: PromptCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (prompt.final_prompt) {
      await navigator.clipboard.writeText(prompt.final_prompt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete();
      } else {
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

        setIsDeleteDialogOpen(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("삭제 중 오류 발생:", error);
      alert(
        `삭제 중 오류가 발생했습니다: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card
        onClick={() => {
          if (onCardClick) {
            onCardClick();
          }
        }}
        className={cn(
          "h-full flex flex-col group relative overflow-hidden border-muted-foreground/20 transition-all",
          isSelected
            ? "border-primary shadow-md ring-1 ring-primary bg-primary/5"
            : "hover:border-primary/50",
          !onCardClick && "cursor-default"
        )}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-transparent bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  v{prompt.version}
                </span>
                <span className="text-xs text-muted-foreground">
                  {prompt.created_at
                    ? new Date(prompt.created_at).toLocaleDateString()
                    : ""}
                </span>
              </div>
              <CardTitle className="text-xl font-bold tracking-tight text-foreground">
                {prompt.core_theme || "Untitled Theme"}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {onToggleSelect && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "opacity-0 transition-opacity",
                    isSelected ? "opacity-100" : "group-hover:opacity-100"
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      onToggleSelect(checked as boolean)
                    }
                    className="bg-background/80 backdrop-blur-sm data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-4">
          {/* Full Prompt Section */}
          {prompt.final_prompt && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Sparkles className="w-4 h-4" />
                  <span>Full Prompt</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={handleCopy}
                >
                  {isCopied ? (
                    <span className="text-green-500 font-medium">Copied!</span>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="relative rounded-lg bg-muted/50 p-4 text-sm italic text-muted-foreground border border-border">
                <Quote className="absolute -top-2 -left-2 h-4 w-4 text-primary/40 fill-primary/10" />
                <p className="leading-relaxed whitespace-pre-wrap wrap-break-word">
                  {prompt.final_prompt}
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-start gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-destructive ml-auto"
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteConfirmMessage ? "확인" : "프롬프트 삭제 확인"}
            </DialogTitle>
            <DialogDescription>
              {deleteConfirmMessage ||
                "정말로 이 프롬프트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."}
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
