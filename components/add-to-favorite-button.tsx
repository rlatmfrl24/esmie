"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/client";
import { Prompt } from "@/lib/types";

interface AddToFavoriteButtonProps {
  prompt: Prompt;
}

export function AddToFavoriteButton({ prompt }: AddToFavoriteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToFavorite = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("사용자 인증이 필요합니다.");
      }

      // Insert into favorite table
      // Assuming schema: id (auto), user_id, prompt_id, created_at (default)
      // Based on "add prompt data", we might need to copy fields if it fails,
      // but usually favorites are references.
      // If the table expects prompt data copy, it would need matching columns.
      // Let's try reference first as it is standard.
      const { error } = await supabase.from("favorite_prompts").insert({
        ...prompt,
        user_id: user.id,
      });

      if (error) {
        // If the error implies missing columns or table issues, we might need to adjust.
        // But generally for 'favorite' table, user_id and prompt_id are the keys.
        throw error;
      }

      alert("즐겨찾기에 추가되었습니다.");
    } catch (error) {
      console.error("즐겨찾기 추가 중 오류 발생:", error);
      alert(
        `즐겨찾기 추가에 실패했습니다: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAddToFavorite}
      variant="outline"
      disabled={isLoading}
    >
      <Heart className="w-4 h-4 mr-2" />
      Add to Favorite
    </Button>
  );
}
