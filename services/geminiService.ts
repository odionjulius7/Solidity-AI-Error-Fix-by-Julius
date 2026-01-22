
import { GoogleGenAI, Type } from "@google/genai";
import { SolidityAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeSolidityCode = async (code: string, error: string): Promise<SolidityAnalysis> => {
  const prompt = `
    Analyze the following Solidity code and the associated compiler/runtime error.
    Provide a detailed explanation of the fix and the corrected code.
    
    Code:
    ${code}
    
    Error:
    ${error}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanation: {
            type: Type.STRING,
            description: "Detailed explanation of what went wrong and why.",
          },
          suggestedFix: {
            type: Type.STRING,
            description: "The complete fixed Solidity code for the main contract.",
          },
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
            description: "Any dependencies or parent contracts that might be missing or need to be created.",
          },
          isCritical: {
            type: Type.BOOLEAN,
            description: "Whether the bug prevents compilation.",
          }
        },
        required: ["explanation", "suggestedFix", "isCritical"],
      },
      systemInstruction: "You are a world-class Smart Contract Security Auditor and Solidity Expert. You help developers fix compilation and logic errors in their Web3 projects. Focus on modern Solidity standards (>=0.8.0).",
    },
  });

  try {
    return JSON.parse(response.text || '{}') as SolidityAnalysis;
  } catch (e) {
    throw new Error("Failed to parse AI response. The model might have returned malformed JSON.");
  }
};
