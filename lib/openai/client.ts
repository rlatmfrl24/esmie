import OpenAI from "openai";

export const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not defined");
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};
