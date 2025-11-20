export interface Prompt {
  id: string;
  core_theme: string;
  version: number;
  hair: string;
  pose: string;
  outfit: string;
  atmosphere: string;
  gaze: string;
  makeup: string;
  background: string;
  final_prompt: string;
  aspect_ratio: string;
  created_at?: string;
}

interface PromptFormData {
  core_theme: string;
  version: number;
  hair: string;
  pose: string;
  outfit: string;
  atmosphere: string;
  gaze: string;
  makeup: string;
  background: string;
  final_prompt: string;
  aspect_ratio: string;
  details: string;
  user_id: string;
}

export type { PromptFormData };
