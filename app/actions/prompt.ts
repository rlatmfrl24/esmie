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
    // First get the current version
    const { data: currentPrompt, error: fetchError } = await supabase
      .from("prompts")
      .select("version")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching prompt version:", fetchError);
      return { success: false, error: "Prompt not found" };
    }

    const newVersion = (currentPrompt?.version || 0) + 1;

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
    revalidatePath("/"); // Update dashboard too

    return { success: true };
  } catch (error) {
    console.error("Unexpected error in updatePrompt:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
