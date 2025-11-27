import { GoogleGenAI, Type } from "@google/genai";
import { Task, Priority, AIAnalysisResult, Project } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeTasksWithGemini = async (tasks: Task[], projects: Project[]): Promise<AIAnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const today = new Date().toISOString().split('T')[0];
  const projectList = projects.map(p => `${p.name} (ID: ${p.id})`).join(', ');

  const prompt = `
    Current Date: ${today}
    
    Here is my current list of tasks:
    ${JSON.stringify(tasks, null, 2)}

    Available Projects: ${projectList}

    Please analyze my schedule and provide:
    1. A list of 3-5 specific, actionable suggestions to improve my organization or productivity based on these tasks.
    2. A list of 2-3 new potential tasks that are logically related to my current ones.
    3. IMPORTANT: For each new task, assign the most relevant 'projectId' from the Available Projects list provided above.
    4. A brief summary on how to optimize my schedule.

    Return the data in strictly valid JSON format matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Actionable productivity advice based on the tasks."
            },
            newTasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: [Priority.LOW, Priority.MEDIUM, Priority.HIGH] },
                  date: { type: Type.STRING, description: "YYYY-MM-DD format" },
                  time: { type: Type.STRING, description: "HH:MM format" },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  projectId: { type: Type.STRING, description: "The ID of the project this task belongs to." }
                },
                required: ["title", "description", "priority", "date", "tags", "projectId"]
              },
              description: "suggested new tasks"
            },
            scheduleOptimization: {
              type: Type.STRING,
              description: "A summary paragraph on how to optimize the schedule."
            }
          },
          required: ["suggestions", "newTasks", "scheduleOptimization"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Error analyzing tasks:", error);
    throw error;
  }
};
