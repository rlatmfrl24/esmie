"use server";

import { Prompt } from "@/lib/types";
import {
  getFeedbackFromGeminiService,
  generatePromptFromKeywordsService,
  generatePromptFromTextService,
  generatePromptFromImageService,
} from "@/lib/services/gemini";

export async function getFeedbackFromGemini(
  promptData: Prompt,
  feedback: string
) {
  return getFeedbackFromGeminiService(promptData, feedback);
}

export async function generatePromptFromKeywords(keywords: string[]) {
  return generatePromptFromKeywordsService(keywords);
}

export async function generatePromptFromText(
  text: string,
  optimize: boolean = true
) {
  return generatePromptFromTextService(text, optimize);
}

export async function generatePromptFromImage(
  imageBase64: string,
  description?: string
) {
  return generatePromptFromImageService(imageBase64, description);
}
