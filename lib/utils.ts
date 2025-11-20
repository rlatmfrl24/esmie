import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PromptFormData } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateFullPrompt(prompt: PromptFormData) {
  const fullPrompt = `${prompt.core_theme}, ${prompt.hair}, ${prompt.pose}, ${prompt.outfit}, ${prompt.atmosphere}, ${prompt.gaze}, ${prompt.makeup}, ${prompt.background}, ${prompt.details}, -- ar ${prompt.aspect_ratio}`;
  return fullPrompt;
}
