"use server";

import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

interface PromptAttributes {
  core_theme: string;
  hair: string;
  pose: string;
  outfit: string;
  atmosphere: string;
  gaze: string;
  makeup: string;
  background: string;
  aspect_ratio: string;
  details: string;
}

export async function updatePrompt(
  id: string,
  attributes: PromptAttributes,
  finalPrompt: string
) {
  const supabase = await createClient();

  try {
    // 1. 현재 버전의 데이터를 먼저 조회합니다.
    const { data: currentPrompt, error: fetchError } = await supabase
      .from("prompts")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !currentPrompt) {
      console.error("Error fetching prompt version:", fetchError);
      return { success: false, error: "Prompt not found" };
    }

    // 2. 현재 상태를 히스토리 테이블에 저장합니다. (아카이빙)
    const { error: historyError } = await supabase
      .from("prompt_histories")
      .insert({
        prompt_id: currentPrompt.id,
        version: currentPrompt.version,
        core_theme: currentPrompt.core_theme,
        hair: currentPrompt.hair,
        pose: currentPrompt.pose,
        outfit: currentPrompt.outfit,
        atmosphere: currentPrompt.atmosphere,
        gaze: currentPrompt.gaze,
        makeup: currentPrompt.makeup,
        background: currentPrompt.background,
        aspect_ratio: currentPrompt.aspect_ratio,
        details: currentPrompt.details,
        final_prompt: currentPrompt.final_prompt,
      });

    if (historyError) {
      console.error("Error archiving prompt history:", historyError);
      // 히스토리 저장 실패는 치명적이지 않으므로 로그만 남기고 진행하거나,
      // 엄격하게 관리하려면 여기서 실패 처리할 수도 있습니다.
      // return { success: false, error: "Failed to archive prompt history" };
    }

    // 3. 새로운 버전으로 메인 테이블을 업데이트합니다.
    const newVersion = (currentPrompt.version || 0) + 1;

    const { error: updateError } = await supabase
      .from("prompts")
      .update({
        ...attributes,
        final_prompt: finalPrompt,
        version: newVersion,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error updating prompt:", updateError);
      return { success: false, error: "Failed to update prompt" };
    }

    revalidatePath(`/prompt/${id}`);
    revalidatePath("/"); // 대시보드 업데이트

    return { success: true };
  } catch (error) {
    console.error("Unexpected error in updatePrompt:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
