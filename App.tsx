import React from 'react';
import { PhaseQueue } from './components/PhaseQueue';
import { LiveDensity } from './components/LiveDensity';
import { AIAnalyst } from './components/AIAnalyst';
import { useTrafficSimulation } from './hooks/useTrafficSimulation';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';

const App: React.FC = () => {
  const { state, analytics, togglePause, resetSimulation, proceedToNextPhase } = useTrafficSimulation();
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-6 flex flex-col">
      {/* Header */}
      <header className="mb-6 flex justify-between items-center bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
        <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            NeuroFlow Traffic Monitor
            </h1>
            <p className="text-gray-400 text-xs mt-1">Real-time Multi-Phase Agent Analysis</p>
        </div>
        <div className="flex gap-2">
            
            {state.aiIntervention && (
                <button 
                    onClick={proceedToNextPhase}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg border border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.4)] animate-pulse font-bold text-sm transition-all"
                >
                    <FastForward size={16} fill="currentColor" /> PROCEED TO NEXT PHASE
                </button>
            )}

            <button 
                onClick={togglePause}
                disabled={state.aiIntervention}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm ${
                    state.aiIntervention 
                    ? 'bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed'
                    : 'bg-gray-800 hover:bg-gray-700 border-gray-600'
                }`}
            >
                {state.isPaused && !state.aiIntervention ? <Play size={14} /> : <Pause size={14} />}
                {state.isPaused && !state.aiIntervention ? "Resume" : "Pause"}
            </button>
            <button 
                onClick={resetSimulation}
                className="flex items-center gap-2 px-4 py-2 bg-red-900/50 hover:bg-red-900/80 rounded-lg border border-red-800 transition-colors text-red-200 text-sm"
            >
                <RotateCcw size={14} /> Reset
            </button>
        </div>
      </header>

      {/* Main Grid: Split into 4 parts (1 Part Phase, 2 Parts Density, 1 Part AI) */}
      <main className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-grow overflow-hidden h-[calc(100vh-140px)]">
        
        {/* Col 1: Phase Queue */}
        <div className="lg:col-span-1 h-full min-h-0">
            <PhaseQueue state={state} />
        </div>

        {/* Col 2: Live Density (Control Center) */}
        <div className="lg:col-span-2 h-full min-h-0">
             {/* Optional: Add a small status bar above density */}
             <div className="bg-gray-800 p-3 rounded-t-xl border-b border-gray-700 flex justify-between items-center flex-shrink-0 mb-0">
                <span className="font-semibold text-gray-300 text-sm">Intersection Telemetry</span>
                <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">
                    Cars Processed: {state.totalCarsProcessed}
                </span>
             </div>
             <div className="h-[calc(100%-48px)]">
                <LiveDensity state={state} />
             </div>
        </div>

        {/* Col 3: AI Insights */}
        <div className="lg:col-span-1 h-full min-h-0">
            <AIAnalyst analytics={analytics} state={state} />
        </div>

      </main>
    </div>
  );
};

export default App;