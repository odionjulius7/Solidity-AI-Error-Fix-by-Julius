
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { SolidityAnalysis } from "../types.ts";

export const analyzeSolidityCode = async (code: string, error: string): Promise<SolidityAnalysis> => {
  // Always grab the key right before the call
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key not found in environment. Please use the 'Connect API Key' button in the header.");
  }

  // World-class implementation: Initialize right before generateContent
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
        systemInstruction: "You are a world-class Solidity auditor. Fix the contract error and provide the full corrected code in JSON format.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("The model returned an empty response.");
    
    try {
      return JSON.parse(text) as SolidityAnalysis;
    } catch (parseErr) {
      console.error("JSON Parse Error:", text);
      throw new Error("Failed to parse the AI analysis result. Please try again.");
    }
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    
    // If it's a 404/Not Found for the project entity, it usually means the key doesn't have the right project enabled.
    if (err.message?.includes("Requested entity was not found")) {
      throw new Error("Requested entity was not found. Please ensure your API Key is linked to a project with the Gemini 3 Pro API enabled.");
    }
    
    throw new Error(err.message || "Communication error with Gemini API.");
  }
};
