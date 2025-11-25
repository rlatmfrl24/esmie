"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/client";
import { Prompt } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AddToFavoriteButtonProps {
  prompt: Prompt;
}

export function AddToFavoriteButton({ prompt }: AddToFavoriteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const supabase = createClient();

  const checkFavoriteStatus = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("favorite_prompts")
        .select("id")
        .eq("user_id", user.id)
        .eq("prompt_id", prompt.id)
        .eq("version", prompt.version)
        .maybeSingle();

      setIsFavorite(!!data);
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  }, [prompt.id, prompt.version, supabase]);

  useEffect(() => {
    checkFavoriteStatus();
  }, [checkFavoriteStatus]);

  const handleToggleFavorite = async () => {
    setIsLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("사용자 인증이 필요합니다.");
      }

      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from("favorite_prompts")
          .delete()
          .eq("user_id", user.id)
          .eq("prompt_id", prompt.id)
          .eq("version", prompt.version);

        if (error) throw error;
        setIsFavorite(false);
      } else {
        // Add to favorites
        // id 값을 제외한 prompt 필드 + user_id + prompt_id 추가
        const { id, ...promptDataWithoutId } = prompt;
        const { error } = await supabase.from("favorite_prompts").insert({
          ...promptDataWithoutId,
          user_id: user.id,
          item_uid: null,
          prompt_id: id, // 명시적으로 원본 prompt_id 저장
        });

        if (error) throw error;
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("즐겨찾기 변경 중 오류 발생:", error);
      alert(
        `작업 실패: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleToggleFavorite}
      variant="outline"
      disabled={isLoading}
      className={cn(isFavorite && "text-red-500 hover:text-red-600")}
    >
      <Heart className={cn("w-4 h-4 mr-2", isFavorite && "fill-current")} />
      {isFavorite ? "Favorited" : "Add to Favorite"}
    </Button>
  );
}
