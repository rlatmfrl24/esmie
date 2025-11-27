"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";


interface KeywordsInputProps {
  onGenerate: (keywords: string[]) => void;
  isLoading: boolean;
}

export function KeywordsInput({ onGenerate, isLoading }: KeywordsInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword();
    }
  };

  const addKeyword = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setInputValue("");
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter((k) => k !== keywordToRemove));
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">From Keywords</h2>
        <p className="text-muted-foreground">
          Enter keywords to describe your idea.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a keyword and press Enter"
            disabled={isLoading}
          />
          <Button onClick={addKeyword} type="button" variant="secondary" disabled={isLoading}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 min-h-[100px] p-4 border rounded-md bg-background/50">
          {keywords.length === 0 && (
            <p className="text-sm text-muted-foreground w-full text-center py-8">
              No keywords added yet.
            </p>
          )}
          {keywords.map((keyword) => (
            <Badge key={keyword} variant="secondary" className="text-sm py-1 px-3">
              {keyword}
              <button
                onClick={() => removeKeyword(keyword)}
                className="ml-2 hover:text-destructive focus:outline-none"
                disabled={isLoading}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => onGenerate(keywords)}
          disabled={isLoading || keywords.length === 0}
          size="lg"
        >
          {isLoading ? "Generating..." : "Make Prompt"}
        </Button>
      </div>
    </div>
  );
}




