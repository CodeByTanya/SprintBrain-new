import { GoogleGenAI, Type } from "@google/genai";
import { BacklogItem } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

const cleanJson = (text: string): string => {
  if (!text) return '{}';
  // Remove markdown code blocks if present
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match) {
    return match[1];
  }
  return text;
};

export const parseBacklogWithAI = async (rawText: string) => {
  const ai = getAiClient();
  const prompt = `
    You are a Product Owner assistant.
    Parse the following raw text into structured backlog items.
    Estimate story points (fibonacci: 1, 2, 3, 5, 8, 13) if missing.
    Determine priority (Low, Medium, High) based on context.
    Return a JSON array.

    Raw Text:
    "${rawText}"
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                story_points: { type: Type.INTEGER },
                priority: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                dependencies: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          }
        }
      }
    }
  });

  const text = response.text || '{"items": []}';
  try {
    return JSON.parse(cleanJson(text)).items || [];
  } catch (e) {
    console.error("Failed to parse AI response:", text);
    throw new Error("AI response was not valid JSON. Please try again.");
  }
};

export const planSprintWithAI = async (
  backlog: BacklogItem[],
  constraints: { velocity: number; teamSize: number; capacity: number }
) => {
  const ai = getAiClient();
  const prompt = `
    You are an expert Scrum Master AI.
    Plan a sprint based on the provided backlog and constraints.
    
    Constraints:
    - Target Velocity: ${constraints.velocity}
    - Team Size: ${constraints.teamSize}
    - Capacity (Total Points): ${constraints.capacity}
    
    Backlog Items (JSON):
    ${JSON.stringify(backlog.map(b => ({ id: b.title, points: b.story_points, priority: b.priority, dependencies: b.dependencies })))}
    
    Instructions:
    1. Select items that fit within capacity.
    2. Prioritize High priority items and respect dependencies.
    3. Order them logically.
    4. Flag any risks (e.g., high points, vague dependencies).
    5. Provide a summary of the sprint plan.
    6. Return a JSON structure.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sprint_name: { type: Type.STRING },
          ai_summary: { type: Type.STRING },
          assignments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                backlog_item_title: { type: Type.STRING, description: "Must match the title from input exactly" },
                order: { type: Type.INTEGER },
                risk_flag: { type: Type.STRING },
                notes: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  const text = response.text || '{}';
  try {
    return JSON.parse(cleanJson(text));
  } catch (e) {
    console.error("Failed to parse AI response:", text);
    throw new Error("Failed to parse AI sprint plan.");
  }
};

export const generateJiraCSV = async (sprintName: string, items: any[]) => {
  const ai = getAiClient();
  const prompt = `
    You are a Jira Administrator tool.
    Convert the following sprint assignments into a CSV string compatible with Jira Import.
    
    Columns required: Summary, Description, Issue Type, Story Points, Priority, Sprint, Risk
    
    Data:
    Sprint Name: ${sprintName}
    Items: ${JSON.stringify(items)}

    Return ONLY the raw CSV string. No markdown formatting.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  // Clean CSV response just in case
  const text = response.text || '';
  return cleanJson(text); // Reusing cleanJson as it strips markdown blocks which is what we want
};