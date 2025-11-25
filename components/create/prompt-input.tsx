"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface PromptInputProps {
  onGenerate: (text: string, optimize: boolean) => void;
  isLoading: boolean;
}

export function PromptInput({ onGenerate, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [optimize, setOptimize] = useState(true);

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">From Prompt</h2>
        <p className="text-muted-foreground">
          Describe your idea in detail to generate a structured prompt.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="prompt-textarea">Your Description</Label>
        <Textarea
          id="prompt-textarea"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. A futuristic city with flying cars at sunset, cyberpunk style..."
          className="min-h-[200px]"
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="optimize" 
          checked={optimize} 
          onCheckedChange={(checked) => setOptimize(checked as boolean)} 
        />
        <Label htmlFor="optimize">Gemini로 프롬프트 최적화 및 개선하기</Label>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => onGenerate(prompt, optimize)}
          disabled={isLoading || !prompt.trim()}
          size="lg"
        >
          {isLoading ? "Generating..." : "Make Prompt"}
        </Button>
      </div>
    </div>
  );
}

