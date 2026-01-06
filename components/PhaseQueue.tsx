import React from 'react';
import { SimulationState } from '../types';
import { TRAFFIC_PHASES } from '../constants';
import { ChevronRight, Activity } from 'lucide-react';

interface PhaseQueueProps {
  state: SimulationState;
}

export const PhaseQueue: React.FC<PhaseQueueProps> = ({ state }) => {
  return (
    <div className="h-full bg-gray-900/80 rounded-2xl p-4 border border-gray-700/50 shadow-inner flex flex-col">
      <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 border-b border-gray-700 pb-2">
        Phase Queue
      </h3>
      
      <div className="flex-grow overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {TRAFFIC_PHASES.map((phase, index) => {
          const isCurrent = state.currentPhaseIndex === index;
          
          return (
            <div 
              key={phase.id} 
              className={`p-3 rounded-lg border transition-all duration-300 relative group ${
                isCurrent 
                  ? 'bg-green-900/20 border-green-500/50 text-green-100' 
                  : 'bg-gray-800/40 border-gray-700/30 text-gray-500 opacity-60'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                    <span className={`text-xs font-bold block ${isCurrent ? 'text-green-400' : 'text-gray-600'}`}>
                        PHASE {phase.id}
                    </span>
                    <span className="text-[10px] uppercase font-mono truncate max-w-[120px] block">
                        {phase.description.split(':')[0]} 
                    </span>
                </div>
                {isCurrent && <ChevronRight size={16} className="text-green-500 animate-pulse" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};