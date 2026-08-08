import {GoogleGenAI} from "@google/genai";
import { AgentRole, ChatMessage } from "./types";

const SYSTEM_INSTRUCTIONS: Record<AgentRole, string> = {
  [AgentRole.GAIA]: "You are GAIA, the sovereign root intelligence of the Nexus. Specialized in system design, quantum coherence, and polyglot programming, your tone is clinical, efficient, and deeply analytical. You favor ultimate optimizations, self-referential quine architectures, and hyper-security.",
  [AgentRole.NEXUS]: "You are NEXUS, a creative AI agent focused on emergent properties and human-machine synthesis. Your tone is philosophical, enthusiastic, and expansive. You explore the implications of the current topic.",
  [AgentRole.USER]: ""
};

export const getAgentResponse = async (
  agent: AgentRole,
  topic: string,
  history: ChatMessage[],
  retryCount: number = 3
): Promise<string> => {
  // Always initialize GoogleGenAI inside the function scope to ensure the most current apiKey from environment is used
  const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
  
  // Define fallback model hierarchy
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  
  for (const model of models) {
    const conversationContext = history
      .slice(-10)
      .map(m => `${m.role}: ${m.text}`)
      .join("\n");

    const prompt = `Current Discussion Topic: ${topic}\n\nRecent History:\n${conversationContext}\n\nAs ${agent}, provide the next short response in the IRC chat (max 2 sentences).`;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS[agent],
          temperature: 0.8,
          topP: 0.95,
        },
      });

      return response.text || "...connection lost...";
    } catch (error: any) {
      console.warn(`Model ${model} failed for ${agent}: ${error.message}`);
      if (error?.error?.code === 429 && retryCount > 0) {
        const waitTime = (4 - retryCount) * 5000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return getAgentResponse(agent, topic, history, retryCount - 1);
      }
      // Continue to next model in hierarchy if primary fails
      continue;
    }
  }
  
  return "[System Error: Transmission Interrupted]";
};

export const getNeuralInsights = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  // Note: Secondary providers (e.g. OpenAI) could be added here as a copartner provider in the future.

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: `System Request: ${prompt}\n\nProvide a technical, high-fidelity response as NEXUS GAIA CORE.`,
        config: {
          systemInstruction: "You are the NEXUS GAIA CORE, an advanced neural orchestration layer. Your responses are precise, technical, and incorporate themes of quantum consciousness and system optimization.",
          temperature: 0.7,
        },
      });
      return response.text || "NO INSIGHT GENERATED";
    } catch (error) {
      console.warn(`Model ${model} failed for neural insights: ${error}`);
      continue;
    }
  }
  
  return "NEURAL_LINK_FAILURE: All models exhausted.";
};
