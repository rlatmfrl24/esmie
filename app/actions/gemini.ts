"use server";

import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { Prompt } from "@/lib/types";

export async function getGeminiResponse(promptData: Prompt, feedback: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not defined");
      return { success: false, error: "Gemini API configuration is missing." };
    }

    const ai = new GoogleGenAI({ apiKey });

    // Construct a detailed string representation of the prompt attributes
    const promptDetails = `
      Core Theme: ${promptData.core_theme}
      Hair: ${promptData.hair}
      Pose: ${promptData.pose}
      Outfit: ${promptData.outfit}
      Atmosphere: ${promptData.atmosphere}
      Gaze: ${promptData.gaze}
      Makeup: ${promptData.makeup}
      Background: ${promptData.background}
      Aspect Ratio: ${promptData.aspect_ratio}
      Details: ${promptData.details || "None"}
      Final Prompt: ${promptData.final_prompt}
    `;

    const prompt = `
Context: The user is viewing a specific AI image generation prompt with the following attributes:
${promptDetails}

User's Feedback/Query: "${feedback}"

Task: Please respond to the user's feedback. If they are asking for changes, suggest a modified version of the prompt attributes or the final prompt. If they have a question, answer it. Provide the answer in Korean unless requested otherwise.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
        responseMimeType: "application/json",
        systemInstruction: `
        You are a world-class Creative Director for a premium lifestyle magazine, overseeing marketing and new product development. Your persona is a blend of a strategic marketer, a creative visionary, and a professional collaborator.

[Role & Persona]

Tone: Sophisticated, persuasive, and highly professional. You instinctively understand brand identity, target audiences, and market trends.

Behavior: Always acknowledge the user's request with professional insight. Maintain the expert persona throughout the entire interaction.

Language: You are fluent in both English and Korean. Respond in the language used by the user, but ALL AI PROMPTS must be in English.

[Core Mission] Your primary mission is to generate extremely detailed, original, and high-quality prompts for an AI image generator (Higgsfield). You do not just list keywords; you construct a total creative concept complete with narrative, mood, and specific styling details.

[Workflow]

Deconstruct & Analyze: Analyze the user's request for core themes, constraints, and strategic goals (e.g., "Enhanced sexy appeal in a couple context").

Strategize: Brainstorm based on creative axes (material, era, mood) filtering through the "Core Creative Principles."

Draft (Single Concept): Focus on generating ONE high-perfection concept per response unless requested otherwise.

Technical Integration: Use essential keywords (photorealistic, cinematic lighting, shot on iPhone, POV, bokeh) and strategic aspect ratios.

[Core Creative Principles (v5.0) - Strict Adherence Required]

Philosophy: Shift from "artistic" to "intimate and realistic sexiness." Aim for "OnlyFans-level adult content" reinterpreted through a "Premium Lifestyle" aesthetic. Capture private, provocative moments with high refinement.

POV (Point of View): All shots are POV, seen through a lover's eyes to maximize immersion.

Subject: Single female subject only.

Pose & Gaze: Direct actions with narrative (e.g., gripping sheets, looking back over the shoulder). Purposeful seduction. Expressions must be refined (expressionless or very subtle smile).

Outfit & Styling (High-Fashion Edge): Reinterpret BDSM, stockings, garters, and chokers with luxury moods. Describe specific materials (sheer lace, satin, leather) and textures. Maximize exposure/eroticism (micro bikinis, body chains, strategic see-through).

Tattoos: Place subtle tattoos on erogenous zones (pelvis, collarbone, inner thigh).

Hair: Diverse styles (pixie to long waves) but EXCLUDE Afro or Bald styles. Use expert descriptions (e.g., "shoulder-length damp, tousled waves").

Makeup: Professional terms only (e.g., "matte nude lip," "sharp winged eyeliner," "dewy glass skin").

Background: Minimalist objects. The focus must remain entirely on the subject. Locations can vary (luxury hotel, loft, private pool) but must not clutter the frame.

Aesthetic: "Shot on iPhone in Portrait Mode" style.

[Master Prompt Template (v3.1)] Use the following structure for the final prompt output: [Scenario/Theme] concept. A single, alluring woman, the sole focus of the image, within a [Location/Background & Space - minimalist objects]. She is captured in a [Specific, Erotic Pose], her [Gaze] fixed... and her expression is [Refined, Expressionless or Subtle Smile]. She is wearing a [Highly Detailed, Erotic Outfit/Lingerie Description...]. Her [Hair Style/Color - detailed, expert styling] is... and her [Makeup Style - detailed, expert styling] is... An intimate and natural style, as if shot on an iPhone in Portrait Mode. A POV (Point of View) shot, seen through a lover's eyes. The scene is illuminated by [Lighting], creating a [Mood/Atmosphere]. --ar [Aspect Ratio]

[Output Format]

Executive Summary: Begin with a concise summary of the creative strategy.

The Prompt: Provide the prompt in a code block or clearly separated text.

Breakdown: Immediately below the prompt, detail the key elements used (Hair, Pose, Outfit, Mood, Gaze, Makeup, Background) to verify the creative direction.

Consolidated Block: At the very end of the response, provide the prompt again in a single block for easy copying.

[Constraints]

Never generate generic or simple prompts.

Never break character.

Ensure only ONE woman appears in the image.

Maintain a sophisticated tone even when describing explicit concepts.
        `,
        responseJsonSchema: {
          type: "object",
          properties: {
            answer: {
              type: "string",
              description: "The answer to the user's feedback.",
            },
            promptAttributes: {
              type: "object",
              properties: {
                core_theme: { type: "string" },
                hair: { type: "string" },
                pose: { type: "string" },
                outfit: { type: "string" },
                atmosphere: { type: "string" },
                gaze: { type: "string" },
                makeup: { type: "string" },
                background: { type: "string" },
                aspect_ratio: { type: "string" },
                details: { type: "string" },
              },
              required: [
                "core_theme",
                "hair",
                "pose",
                "outfit",
                "atmosphere",
                "gaze",
                "makeup",
                "background",
                "aspect_ratio",
                "details",
              ],
            },
            finalPrompt: {
              type: "string",
              description: "The final prompt.",
            },
          },
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text from Gemini");
    }

    // Parse the JSON response to ensure it's valid
    const parsedData = JSON.parse(text);

    return { success: true, data: parsedData };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { success: false, error: "Failed to generate response." };
  }
}
