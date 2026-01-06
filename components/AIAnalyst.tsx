import React, { useState, useEffect } from 'react';
import { AnalyticsData, SimulationState } from '../types';
import { analyzeTraffic } from '../services/geminiService';
import { Bot, RefreshCw } from 'lucide-react';
// 1. Import the markdown component
import ReactMarkdown from 'react-markdown';

interface AIAnalystProps {
  analytics: AnalyticsData[];
  state: SimulationState & { 
    aiIntervention: boolean; 
    lastDecision: string | null; 
  };
}

export const AIAnalyst: React.FC<AIAnalystProps> = ({ analytics, state }) => {
  const [analysis, setAnalysis] = useState<string>("Monitoring traffic flow...");
  const [loading, setLoading] = useState(false);
  const [logicStep, setLogicStep] = useState<string>("");

  useEffect(() => {
      if (state.aiIntervention) {
          handleAnalyze();
      } else {
          setAnalysis("### System Status: Active\nMonitoring live telemetry for anomalies...");
          setLogicStep("");
      }
  }, [state.aiIntervention]);

  const handleAnalyze = async () => {
    setLoading(true);
    setLogicStep("Calculating Phase Throughput...");
    await new Promise(r => setTimeout(r, 600));
    setLogicStep("Assessing Cross-Traffic Pressure...");
    await new Promise(r => setTimeout(r, 600));
    setLogicStep("Finalizing Fairness Duration...");
    
    const result = await analyzeTraffic(analytics, state);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className={`h-full flex flex-col p-6 rounded-xl border shadow-lg transition-all duration-500 ${
        state.aiIntervention 
        ? 'bg-slate-900 border-indigo-500 ring-4 ring-indigo-500/20' 
        : 'bg-gray-800 border-gray-700'
    }`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Bot className={state.aiIntervention ? "text-indigo-400" : "text-gray-400"} /> 
            AI Analyst
        </h2>
        {state.aiIntervention && (
            <span className="animate-bounce text-[10px] bg-indigo-600 text-white px-2 py-1 rounded-full uppercase tracking-widest font-bold">
                Manual Review
            </span>
        )}
      </div>
      
      <div className="bg-black/40 p-5 rounded-lg flex-grow border border-white/5 relative overflow-y-auto custom-scrollbar">
        {loading ? (
             <div className="flex flex-col items-center justify-center h-full space-y-4">
                <RefreshCw className="animate-spin text-indigo-400" size={32} />
                <span className="text-xs font-mono text-indigo-300 animate-pulse">{logicStep}</span>
             </div>
        ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                {/* 2. Replace <p> with ReactMarkdown and custom styling */}
                <article className={`markdown-reader text-sm leading-relaxed font-sans ${state.aiIntervention ? 'text-indigo-50' : 'text-gray-400'}`}>
                    <ReactMarkdown 
                        components={{
                            // Custom styling for markdown elements
                            p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                            strong: ({node, ...props}) => <strong className="text-indigo-300 font-bold" {...props} />,
                            li: ({node, ...props}) => <li className="ml-4 mb-2 list-disc" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-indigo-400 font-bold mb-2 uppercase tracking-tighter" {...props} />
                        }}
                    >
                        {analysis}
                    </ReactMarkdown>
                </article>
            </div>
        )}
      </div>
      
      <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/5 text-[10px] font-mono text-gray-400">
         <div className="flex justify-between items-center opacity-80 mb-2">
             <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" /> ENGINE_V2.0</span>
             <span className={state.aiIntervention ? "text-yellow-400" : "text-green-400"}>
                 {state.aiIntervention ? "AWAITING_USER" : "STREAMING_DATA"}
             </span>
         </div>
         <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
             <div className={`h-full transition-all duration-1000 ${state.aiIntervention ? 'bg-yellow-500 w-full' : 'bg-indigo-500 w-1/3 animate-pulse'}`} />
         </div>
      </div>
    </div>
  );
};