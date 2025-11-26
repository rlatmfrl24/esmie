"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { updatePrompt } from "@/app/actions/prompt";
import { Prompt } from "@/lib/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface RollbackButtonProps {
  prompt: Prompt;
  promptId: string;
}

export function RollbackButton({ prompt, promptId }: RollbackButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleRollback = async () => {
    setIsLoading(true);
    try {
      const result = await updatePrompt(
        promptId,
        {
          core_theme: prompt.core_theme,
          hair: prompt.hair,
          pose: prompt.pose,
          outfit: prompt.outfit,
          atmosphere: prompt.atmosphere,
          gaze: prompt.gaze,
          makeup: prompt.makeup,
          background: prompt.background,
          aspect_ratio: prompt.aspect_ratio,
          details: prompt.details || "",
        },
        prompt.final_prompt
      );

      if (result.success) {
        toast.success("Prompt rolled back successfully");
        setOpen(false);
      } else {
        toast.error(result.error || "Failed to rollback prompt");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={isLoading}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Back to Current Version
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will create a new version of the prompt with the content
            from version {prompt.version}. The current version will be archived
            in history.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleRollback();
            }}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
