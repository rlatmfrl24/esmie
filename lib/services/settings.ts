import { createClient } from "@/lib/server";
import {
  SYSTEM_INSTRUCTION as DEFAULT_SYSTEM_INSTRUCTION,
  IMAGE_ANALYSIS_INSTRUCTION as DEFAULT_IMAGE_ANALYSIS_INSTRUCTION,
} from "@/lib/gemini/config";

export async function getSystemInstruction() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "system_instruction")
    .single();

  if (error || !data) {
    console.warn(
      "Failed to fetch system instruction from DB, using default.",
      error
    );
    return DEFAULT_SYSTEM_INSTRUCTION;
  }

  return data.value;
}

export async function updateSystemInstruction(value: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .upsert({ key: "system_instruction", value });

  if (error) {
    throw new Error(`Failed to update system instruction: ${error.message}`);
  }

  return true;
}

export async function getImageAnalysisInstruction() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "image_analysis_instruction")
    .single();

  if (error || !data) {
    console.warn(
      "Failed to fetch image analysis instruction from DB, using default.",
      error
    );
    return DEFAULT_IMAGE_ANALYSIS_INSTRUCTION;
  }

  return data.value;
}

export async function updateImageAnalysisInstruction(value: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .upsert({ key: "image_analysis_instruction", value });

  if (error) {
    throw new Error(
      `Failed to update image analysis instruction: ${error.message}`
    );
  }

  return true;
}
