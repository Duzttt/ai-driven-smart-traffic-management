import { GoogleGenAI } from "@google/genai";
import { AnalyticsData, SimulationState } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const analyzeTraffic = async (
    data: AnalyticsData[], 
    state: SimulationState & { lastDecision: string | null }
): Promise<string> => {
  try {
    if (!state.lastDecision) return "System Initializing...";
    const d = JSON.parse(state.lastDecision);

    const prompt = `
      You are an AI Urban Traffic Controller. 
      
      OBSERVATION:
      - Just finished Phase: ${d.prevPhase}. 
      - Throughput achieved: ${JSON.stringify(d.throughput)} (cars passed).
      - Next Phase: ${d.nextPhase}.
      - Incoming Demand: ${d.activeLoad} cars.
      - Backlog in other lanes: ${d.waitingLoad} cars.
      
      LOGIC APPLIED:
      We calculated a duration of ${d.assignedDuration}s.
      
      TASK:
      Analyze if the previous phase was efficient based on the throughput. 
      Then, justify the timing for the next phase. If waitingLoad is high (>15), mention "Fairness Throttle" was applied to prevent gridlock in other directions.
      
      FORMAT:
      1. Performance: [One sentence about previous phase efficiency]
      2. Strategy: [One sentence about next phase duration justification]
      3. Impact: [One sentence on city-wide flow]
      
      Keep it professional, technical, and under 45 words total.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return response.text || "Analysis unavailable.";
  } catch (error) {
    return "AI Protocol Error: Unable to sync with traffic grid.";
  }
};