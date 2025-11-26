"use server";

import { Prompt } from "@/lib/types";
import { getFeedbackFromOpenAIService } from "@/lib/services/openai";

export async function getFeedbackFromOpenAI(
  promptData: Prompt,
  feedback: string
) {
  return getFeedbackFromOpenAIService(promptData, feedback);
}
