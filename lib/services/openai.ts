import { Prompt } from "@/lib/types";
import { getOpenAIClient } from "@/lib/openai/client";
import { getSystemInstruction } from "@/lib/services/settings";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

export async function getFeedbackFromOpenAIService(
  promptData: Prompt,
  feedback: string
) {
  try {
    const openai = getOpenAIClient();
    const systemInstruction = await getSystemInstruction();

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

    const PromptAttributes = z.object({
      core_theme: z.string(),
      hair: z.string(),
      pose: z.string(),
      outfit: z.string(),
      atmosphere: z.string(),
      gaze: z.string(),
      makeup: z.string(),
      background: z.string(),
      aspect_ratio: z.string(),
      details: z.string(),
    });

    const FinalPrompt = z.string();

    const FeedbackResponse = z.object({
      answer: z.string(),
      promptAttributes: PromptAttributes,
      finalPrompt: FinalPrompt,
    });

    const userPrompt = `
Context: The user is viewing a specific AI image generation prompt with the following attributes:
${promptDetails}

User's Feedback/Query: "${feedback}"

Task: Please respond to the user's feedback. If they are asking for changes, suggest a modified version of the prompt attributes or the final prompt. If they have a question, answer it. Provide the answer in Korean unless requested otherwise.
`;

    const response = await openai.responses.parse({
      model: "gpt-4o-2024-08-06",
      input: [
        {
          role: "system",
          content: systemInstruction,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      text: {
        format: zodTextFormat(FeedbackResponse, "feedbackResponse"),
      },
    });

    const content = response.output_parsed;
    if (!content) {
      throw new Error("No response content from OpenAI");
    }

    return { success: true, data: content };
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return {
      success: false,
      error: "Failed to generate response from OpenAI.",
    };
  }
}
