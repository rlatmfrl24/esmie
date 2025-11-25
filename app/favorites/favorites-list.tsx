"use client";

import { useState } from "react";
import { Prompt } from "@/lib/types";
import { PromptCard } from "@/components/prompts/prompt-card";
import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";

interface FavoritePrompt extends Prompt {
  prompt_id: string;
}

interface FavoritesListProps {
  initialPrompts: FavoritePrompt[];
}

export function FavoritesList({ initialPrompts }: FavoritesListProps) {
  const [prompts, setPrompts] = useState<FavoritePrompt[]>(initialPrompts);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (favoriteId: string) => {
    const { error } = await supabase
      .from("favorite_prompts")
      .delete()
      .eq("id", favoriteId);

    if (error) {
      throw error;
    }

    setPrompts((prev) => prev.filter((p) => p.id !== favoriteId));
    router.refresh();
  };

  return (
    <div className="flex flex-col flex-1 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Favorite Prompts</h1>
      </div>

      {prompts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {prompts.map((item) => {
            const displayPrompt: Prompt = {
              ...item,
              id: item.prompt_id,
            };

            return (
              <PromptCard
                key={item.id}
                prompt={displayPrompt}
                onDelete={() => handleDelete(item.id)}
                deleteConfirmMessage="정말로 즐겨찾기에서 제거하시겠습니까?"
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center text-muted-foreground p-8">
          즐겨찾기한 프롬프트가 없습니다.
        </div>
      )}
    </div>
  );
}

