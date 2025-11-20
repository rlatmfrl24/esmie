"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Loader2, Sparkles } from "lucide-react";
import { getGeminiResponse } from "@/app/actions/gemini";
import { updatePrompt } from "@/app/actions/prompt";
import { Prompt, PromptFormData } from "@/lib/types";
import { useRouter } from "next/navigation";

interface FeedbackSheetProps {
  prompt: Prompt;
}

interface GeminiResponseData {
  answer: string;
  feedback: string;
  promptAttributes: PromptFormData;
  finalPrompt: string;
}

export function FeedbackSheet({ prompt }: FeedbackSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [answer, setAnswer] = useState("");
  const [geminiData, setGeminiData] = useState<GeminiResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;

    console.log("Submitting feedback for prompt:", prompt.id);
    setIsLoading(true);
    setAnswer("");
    setGeminiData(null);

    try {
      const result = await getGeminiResponse(prompt, feedback);
      if (result.success && result.data) {
        setAnswer(result.data.answer);
        setGeminiData(result.data);
      } else {
        setAnswer("답변을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setAnswer("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyChanges = async () => {
    if (!geminiData) return;

    setIsUpdating(true);
    try {
      const result = await updatePrompt(
        prompt.id,
        geminiData.promptAttributes,
        geminiData.finalPrompt
      );

      if (result.success) {
        setOpen(false);
        setFeedback("");
        setAnswer("");
        setGeminiData(null);
        router.refresh();
      } else {
        alert("업데이트에 실패했습니다: " + result.error);
      }
    } catch (error) {
      console.error("Error updating prompt:", error);
      alert("업데이트 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <MessageSquare className="w-4 h-4 mr-2" />
        Send Feedback
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Send Feedback</SheetTitle>
            <SheetDescription>
              이 프롬프트에 대한 피드백을 남겨주세요.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 py-4 space-y-4">
            <Textarea
              placeholder="피드백을 입력해주세요..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px]"
            />

            {answer && (
              <div className="p-4 text-sm rounded-lg bg-muted/50 whitespace-pre-wrap border space-y-4">
                <div>
                  <h4 className="mb-2 font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Gemini Answer
                  </h4>
                  {answer}
                </div>
                {geminiData && (
                  <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                    <h5 className="font-semibold mb-2">Proposed Changes:</h5>
                    <pre className="overflow-x-auto bg-muted p-2 rounded whitespace-pre-wrap break-words">
                      {JSON.stringify(geminiData.promptAttributes, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
          <SheetFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>

            {geminiData ? (
              <Button
                onClick={handleApplyChanges}
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700"
              >
                {isUpdating && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                변경사항 적용 (v{prompt.version + 1})
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!feedback.trim() || isLoading}
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                제출
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
