"use client";

import { useState } from "react";
import { Prompt } from "@/lib/types";
import { PromptCard } from "@/components/prompt-card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Layers } from "lucide-react";
import { AddNewPrompt } from "@/components/add-new-prompt";

interface PromptListProps {
  prompts: Prompt[];
}

export function PromptList({ prompts }: PromptListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const router = useRouter();

  const toggleSelection = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedIds);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleMerge = () => {
    if (selectedIds.size === 0) return;
    const idsParam = Array.from(selectedIds).join(",");
    router.push(`/merge?ids=${idsParam}`);
  };

  return (
    <div className="flex flex-col flex-1 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button
              onClick={handleMerge}
              variant="outline"
              className="gap-2 animate-in fade-in slide-in-from-right-5"
            >
              <Layers className="w-4 h-4" />
              Merge Prompts ({selectedIds.size})
            </Button>
          )}
          <AddNewPrompt />
        </div>
      </div>

      {prompts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              isSelected={selectedIds.has(prompt.id)}
              onToggleSelect={(checked) => toggleSelection(prompt.id, checked)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground p-8">
          프롬프트가 없습니다. 새 프롬프트를 추가해보세요.
        </div>
      )}
    </div>
  );
}
