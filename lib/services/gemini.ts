import { ThinkingLevel } from "@google/genai";
import { Prompt } from "@/lib/types";
import { getGeminiClient } from "@/lib/gemini/client";
import { PROMPT_ATTRIBUTES_SCHEMA } from "@/lib/gemini/config";
import { getSystemInstruction } from "@/lib/services/settings";

export async function getFeedbackFromGeminiService(
  promptData: Prompt,
  feedback: string
) {
  try {
    const ai = getGeminiClient();
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
        systemInstruction: systemInstruction,
        responseSchema: {
          type: "OBJECT",
          properties: {
            answer: {
              type: "STRING",
              description: "The answer to the user's feedback.",
            },
            promptAttributes: PROMPT_ATTRIBUTES_SCHEMA,
            finalPrompt: {
              type: "STRING",
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

async function generatePromptCommon(
  promptText: string,
  imageBase64?: string,
  thinkingLevel: ThinkingLevel = ThinkingLevel.HIGH
) {
  try {
    const ai = getGeminiClient();
    const systemInstruction = await getSystemInstruction();

    const contents = [];
    if (imageBase64) {
      contents.push({
        role: "user",
        parts: [
          { text: promptText },
          {
            inlineData: {
              mimeType: "image/jpeg", // Assuming jpeg, but could detect
              data: imageBase64,
            },
          },
        ],
      });
    } else {
      contents.push({
        role: "user",
        parts: [{ text: promptText }],
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: contents,
      config: {
        thinkingConfig: {
          thinkingLevel: thinkingLevel,
        },
        responseMimeType: "application/json",
        systemInstruction: systemInstruction,
        responseSchema: {
          type: "OBJECT",
          properties: {
            promptAttributes: PROMPT_ATTRIBUTES_SCHEMA,
            finalPrompt: {
              type: "STRING",
              description: "The final prompt generated based on the input.",
            },
          },
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text from Gemini");
    }

    const parsedData = JSON.parse(text);

    // Map snake_case to camelCase for frontend
    const mappedData = {
      coreTheme: parsedData.promptAttributes.core_theme,
      hair: parsedData.promptAttributes.hair,
      pose: parsedData.promptAttributes.pose,
      outfit: parsedData.promptAttributes.outfit,
      atmosphere: parsedData.promptAttributes.atmosphere,
      gaze: parsedData.promptAttributes.gaze,
      makeup: parsedData.promptAttributes.makeup,
      background: parsedData.promptAttributes.background,
      aspectRatio: parsedData.promptAttributes.aspect_ratio,
      details: parsedData.promptAttributes.details,
      fullPrompt: parsedData.finalPrompt,
    };

    return { success: true, data: mappedData };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { success: false, error: "Failed to generate prompt." };
  }
}

export async function generatePromptFromKeywordsService(keywords: string[]) {
  const promptText = `
    Task: Generate a detailed AI image generation prompt based on the following keywords: ${keywords.join(
      ", "
    )}.
    Ensure the result adheres to the Core Creative Principles.
    `;
  return generatePromptCommon(promptText);
}

export async function generatePromptFromTextService(
  text: string,
  optimize: boolean = true
) {
  let promptText;

  if (optimize) {
    promptText = `
    Task: Generate a detailed AI image generation prompt based on the following description: "${text}".
    Ensure the result adheres to the Core Creative Principles.
    `;
  } else {
    promptText = `
    Task: Analyze the following image generation prompt and extract its attributes (hair, pose, outfit, etc.) into the JSON schema.
    IMPORTANT: Do NOT rewrite, optimize, or "improve" the prompt content.
    The 'finalPrompt' field in the response MUST be exactly the same as the input provided below, or a very close approximation if minor formatting is needed.
    
    Input Prompt: "${text}"
    `;
  }

  const thinkingLevel = optimize ? ThinkingLevel.HIGH : ThinkingLevel.LOW;
  const result = await generatePromptCommon(
    promptText,
    undefined,
    thinkingLevel
  );

  if (!optimize && result.success && result.data) {
    // Force the final prompt to be exactly what the user entered, just to be safe.
    result.data.fullPrompt = text;
  }

  return result;
}

export async function generatePromptFromImageService(imageBase64: string) {
  const promptText = `
    Task: Analyze the attached image and generate a detailed AI image generation prompt that captures its style, subject, and atmosphere.
    Ensure the result adheres to the Core Creative Principles and is suitable for recreating a similar image.
    `;
  return generatePromptCommon(promptText, imageBase64);
}
