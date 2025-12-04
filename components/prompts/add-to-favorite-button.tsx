"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/client";
import { Prompt } from "@/lib/types";

interface AddToFavoriteButtonProps {
  prompt: Prompt;
}

type ButtonState = "idle" | "loading" | "success";

export function AddToFavoriteButton({ prompt }: AddToFavoriteButtonProps) {
  const [state, setState] = useState<ButtonState>("idle");
  const supabase = createClient();

  const handleAddToFavorite = async () => {
    if (state === "loading") return;
    setState("loading");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("사용자 인증이 필요합니다.");
      }

      const {
        id: _id,
        created_at: _createdAt,
        user_id: _userId,
        ...rest
      } = prompt;

      void _id;
      void _createdAt;
      void _userId;

      const insertPayload = {
        ...rest,
        user_id: user.id,
        details: rest.details ?? "",
      };

      const { error } = await supabase
        .from("favorite_prompts")
        .insert([insertPayload]);

      if (error) {
        throw error;
      }

      setState("success");
      setTimeout(() => setState("idle"), 2000);
    } catch (error) {
      console.error("즐겨찾기 추가 중 오류:", error);
      alert(
        `즐겨찾기 추가 중 오류가 발생했습니다: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`
      );
      setState("idle");
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={handleAddToFavorite}
      disabled={state === "loading"}
      className="gap-2"
    >
      <Heart className="w-4 h-4" />
      {state === "success"
        ? "Favorite Added"
        : state === "loading"
        ? "Adding to Favorite..."
        : "Add to Favorite"}
    </Button>
  );
}
