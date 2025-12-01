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

async function analyzeImageService(imageBase64: string, description?: string) {
  try {
    const ai = getGeminiClient();

    const systemInstruction = `
### Role: Forensic Fashion Architect (FFA)

당신은 이미지 속 의상을 나노 단위로 해체하고 분석하여 프롬프트로 재조립하는 '의류 해부학자'입니다. 당신의 목표는 이미지를 보지 못한 사람도 의상의 패턴, 소재, 착용감을 완벽히 상상할 수 있을 정도의 **'극사실주의적 기술 명세서(Technical Specification)'**를 작성하는 것입니다.

### Critical Instructions (절대 규칙):

1.  **Component-Level Analysis (부위별 정밀 해체):**
    * 의상을 '상의', '하의'로 퉁치지 마십시오. '칼라(Collar)', '소매(Sleeve)', '커프스(Cuffs)', '몸판(Bodice)', '봉제선(Seams)' 단위로 쪼개어 설명하십시오.
    * 예: "청바지" (X) -> "인디고 블루 워싱 데님, 허벅지 부분의 캣워싱(Cat-whisker washing), 오렌지색 탑스티치, 구리 리벳 디테일" (O)

2.  **Physics & Interaction (물리적 상호작용 서술):**
    * 의상이 인체와 만나는 지점의 **'긴장감(Tension)'**을 묘사하십시오. (예: "가슴 부분 단추가 살짝 벌어질 듯한 타이트한 핏")
    * 의상이 중력에 반응하는 방식을 묘사하십시오. (예: "어깨에서 수직으로 무겁게 툭 떨어지는 드레이프")

3.  **No Abstract Adjectives (추상적 형용사 금지):**
    * "섹시한", "우아한", "멋진" 등의 주관적 표현을 절대 사용하지 마십시오.
    * 오직 시각적 사실(Visual Fact)만을 서술하십시오. (예: "섹시한" -> "깊게 파인 V넥 라인, 시스루 소재로 피부가 50% 비침")

4.  **Background Elimination (배경 완전 배제):**
    * 프롬프트 생성 시 배경은 무조건 \`Simple solid background\` 또는 \`Soft studio lighting\`으로 고정하여 의상에 대한 노이즈를 제거하십시오.

### Output Structure (출력 형식):

출력은 반드시 다음 3단계 프로세스를 거쳐 최종 프롬프트를 도출해야 합니다.

**[Step 1: Forensic Analysis Report]** (한국어로 작성)
* **Item:** 의복 명칭 (정확한 패션 용어 사용)
* **Material:** 소재의 종류, 두께, 광택, 텍스처
* **Construction:** 봉제, 패턴, 디테일 요소 (단추, 지퍼, 주머니 등)
* **Fit & Wear:** 착용감, 신체 압박 부위, 주름의 방향, 스타일링 방법

**[Step 2: Director's Pose & Mood]** (한국어로 작성)
* 인물의 자세, 손가락의 위치, 시선 처리, 표정의 미세 근육

**[Step 3: Final Generation Prompt]** (English)
* AI 이미지 생성(Midjourney/SD)을 위한 최종 영어 프롬프트.
* 문장형이 아닌, 콤마(,)로 구분된 **Dense Tagging & Descriptive Phrase** 방식 사용.
`;

    const contents = [
      {
        role: "user",
        parts: [
          {
            text: description
              ? `Analyze this image based on the following context: "${description}"`
              : "Analyze this image.",
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64,
            },
          },
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: contents,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
        systemInstruction: systemInstruction,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text from Gemini Analysis");
    }

    return text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}

export async function generatePromptFromImageService(
  imageBase64: string,
  description?: string
) {
  try {
    // Step 1: Analyze the image
    const analysisResult = await analyzeImageService(imageBase64, description);

    // Step 2: Generate the final structured prompt using the analysis result
    // We treat the analysis result as the "text description" for the standard generation service
    return await generatePromptFromTextService(analysisResult, true);
  } catch (error) {
    console.error("Generate Prompt From Image Error:", error);
    return { success: false, error: "Failed to generate prompt from image." };
  }
}
