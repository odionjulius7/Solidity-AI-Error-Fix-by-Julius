
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { SolidityAnalysis } from "../types.ts";

export const analyzeSolidityCode = async (code: string, error: string): Promise<SolidityAnalysis> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("System configuration error: API Key missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Analyze the following Solidity code and the associated compiler/runtime error.
    Return a JSON object with:
    1. explanation: Concise explanation of the bug.
    2. suggestedFix: Complete corrected code block for the main file.
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
        systemInstruction: "You are a senior Solidity auditor. Fix the contract error and provide the full corrected code in JSON. Be precise and technical.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("The engine returned an empty audit report.");
    
    try {
      return JSON.parse(text) as SolidityAnalysis;
    } catch (parseErr) {
      console.error("Diagnostic Parse Error:", text);
      throw new Error("The engine produced an invalid report. Please re-run the analysis.");
    }
  } catch (err: any) {
    console.error("Gemini Engine Error:", err);
    throw new Error(err.message || "Failed to communicate with the analysis engine.");
  }
};