
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { SolidityAnalysis } from "../types.ts";

export const analyzeSolidityCode = async (code: string, error: string): Promise<SolidityAnalysis> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("Missing API Key. Check the Troubleshooting guide in the header.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Analyze the following Solidity code and the associated compiler/runtime error.
    Return a JSON object with:
    1. explanation: Detailed fix explanation.
    2. suggestedFix: Complete corrected code.
    3. missingFiles: (Optional) Array of {filename, content} for missing dependencies.
    4. isCritical: Boolean.
    
    Code:
    ${code}
    
    Error:
    ${error}
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            suggestedFix: { type: Type.STRING },
            missingFiles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  filename: { type: Type.STRING },
                  content: { type: Type.STRING },
                },
                required: ["filename", "content"],
              },
            },
            isCritical: { type: Type.BOOLEAN },
          },
          required: ["explanation", "suggestedFix", "isCritical"],
        },
        systemInstruction: "You are a world-class Solidity expert. Fix the code and return only valid JSON.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("The model returned an empty response.");
    
    return JSON.parse(text) as SolidityAnalysis;
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    throw new Error(err.message || "Communication error with Gemini API.");
  }
};
