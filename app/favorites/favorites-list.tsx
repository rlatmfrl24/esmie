"use client";

import { useState } from "react";
import { FavoritePrompt } from "@/lib/types";
import { PromptCard } from "@/components/prompts/prompt-card";
import { createClient } from "@/lib/client";

interface FavoritesListProps {
  initialPrompts: FavoritePrompt[];
}

export function FavoritesList({ initialPrompts }: FavoritesListProps) {
  const [prompts, setPrompts] = useState<FavoritePrompt[]>(initialPrompts);
  const supabase = createClient();

  const handleDelete = async (favoriteId: string) => {
    try {
      // 1. Fetch the favorite data to be moved to trash
      const { data: favoriteData, error: fetchError } = await supabase
        .from("favorite_prompts")
        .select("*")
        .eq("id", favoriteId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch favorite: ${fetchError.message}`);
      }

      // 2. Insert into trash table with origin_type: FAVORITE
      // user_id is needed for RLS policy
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Insert into trash with only the fields that trash table needs
      // Exclude id (trash table has auto-generated bigint id) and store original id in item_uid
      const { id, ...rest } = favoriteData;
      const insertData: Record<string, unknown> = {
        core_theme: rest.core_theme,
        version: rest.version,
        hair: rest.hair,
        pose: rest.pose,
        outfit: rest.outfit,
        atmosphere: rest.atmosphere,
        gaze: rest.gaze,
        makeup: rest.makeup,
        background: rest.background,
        final_prompt: rest.final_prompt,
        aspect_ratio: rest.aspect_ratio,
        details: rest.details,
        created_at: rest.created_at,
        user_id: user.id, // Include user_id for RLS policy
        item_uid: id, // Store original UUID id for restoration reference
        origin_type: "FAVORITE",
      };
      // Explicitly exclude id to let database auto-generate it
      delete insertData.id;
      const { error: insertError } = await supabase
        .from("trash")
        .insert([insertData]);

      if (insertError) {
        throw new Error(`Failed to move to trash: ${insertError.message}`);
      }

      // 3. Delete from favorite_prompts table
      const { error: deleteError } = await supabase
        .from("favorite_prompts")
        .delete()
        .eq("id", favoriteId);

      if (deleteError) {
        throw new Error(`Failed to delete favorite: ${deleteError.message}`);
      }

      setPrompts((prev) => prev.filter((p) => p.id !== favoriteId));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Error deleting favorite:", error);
      alert(message);
    }
  };

  return (
    <div className="flex flex-col flex-1 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Favorite Prompts</h1>
      </div>

      {prompts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {prompts.map((item) => (
            <PromptCard
              key={item.id}
              prompt={item}
              onDelete={() => handleDelete(item.id)}
              deleteConfirmMessage="정말로 즐겨찾기에서 제거하시겠습니까?"
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground p-8">
          즐겨찾기한 프롬프트가 없습니다.
        </div>
      )}
    </div>
  );
}
