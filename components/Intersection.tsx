import React from 'react';
import { SimulationState, Turn, Lane } from '../types';
import { TRAFFIC_PHASES } from '../constants';
import { ChevronRight, Activity, Clock } from 'lucide-react';

interface IntersectionProps {
  state: SimulationState;
}

export const Intersection: React.FC<IntersectionProps> = ({ state }) => {
  
  // Helper to count cars by intention in a specific lane
  const getLaneBreakdown = (laneId: number) => {
    const lane = state.lanes.find(l => l.id === laneId);
    if (!lane) return { total: 0, s: 0, l: 0, r: 0 };
    
    const s = lane.cars.filter(c => c.intention === Turn.Straight).length;
    const l = lane.cars.filter(c => c.intention === Turn.Left).length;
    const r = lane.cars.filter(c => c.intention === Turn.Right).length;
    
    return { total: lane.cars.length, s, l, r };
  };

  return (
    <div className="h-full bg-gray-900/80 rounded-2xl p-4 border border-gray-700/50 shadow-inner flex flex-col">
      <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-4">
        {TRAFFIC_PHASES.map((phase, index) => {
          const isCurrentPhase = state.currentPhaseIndex === index;
          
          // Calculate specific metrics for this phase context
          let phaseActiveCount = 0;
          let phaseWaitingCount = 0;

          // We must iterate all lanes to calculate "Active vs Waiting" from the perspective of THIS phase
          state.lanes.forEach(lane => {
            const laneIsActiveInPhase = phase.activeLanes.includes(lane.id);
            
            lane.cars.forEach(car => {
              if (laneIsActiveInPhase && phase.allowedTurns.includes(car.intention)) {
                phaseActiveCount++;
              } else {
                phaseWaitingCount++;
              }
            });
          });

          return (
            <div 
              key={phase.id} 
              className={`rounded-xl border transition-all duration-300 flex-shrink-0 ${
                isCurrentPhase 
                  ? 'bg-blue-900/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                  : 'bg-gray-800/40 border-gray-700/30 opacity-70 hover:opacity-100'
              }`}
            >
              {/* Phase Header */}
              <div className={`p-3 border-b border-white/5 flex justify-between items-center ${isCurrentPhase ? 'bg-blue-500/10' : ''}`}>
                <div>
                  <h3 className={`font-bold text-sm uppercase tracking-wider flex items-center gap-2 ${isCurrentPhase ? 'text-blue-300' : 'text-gray-400'}`}>
                    {isCurrentPhase && <Activity size={14} className="animate-pulse" />}
                    Phase {phase.id}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{phase.description}</p>
                </div>
                
                <div className="text-right">
                  {isCurrentPhase && (
                     <div className="flex items-center justify-end gap-2 text-yellow-400 font-mono text-sm mb-1">
                        <Clock size={14} />
                        <span>{(state.phaseTimer / 20).toFixed(1)}s</span>
                     </div>
                  )}
                   <div className="text-[10px] text-gray-500 bg-black/40 px-2 py-1 rounded">
                      Active: <span className="text-green-400 font-bold">{phaseActiveCount}</span> | 
                      Waiting: <span className="text-red-400 font-bold">{phaseWaitingCount}</span>
                   </div>
                </div>
              </div>

              {/* Lane Breakdown List */}
              <div className="p-3 grid grid-cols-1 gap-2 text-xs font-mono">
                {[1, 2, 3, 4].map(laneId => {
                   const breakdown = getLaneBreakdown(laneId);
                   const isLaneActiveInPhase = phase.activeLanes.includes(laneId);
                   
                   return (
                     <div key={laneId} className={`p-3 rounded bg-black/20 flex justify-between items-center ${isLaneActiveInPhase ? 'border-l-4 border-green-500/50 bg-green-900/10' : 'border-l-4 border-gray-700'}`}>
                        <div className="flex-grow">
                          <span className={`text-sm font-bold block mb-2 ${isLaneActiveInPhase ? 'text-gray-200' : 'text-gray-500'}`}>Lane {laneId}</span>
                          
                          {/* S L R Indicators - Made Bigger */}
                          <div className="flex gap-2">
                             <div className="flex flex-col items-center bg-blue-900/30 px-2 py-1 rounded border border-blue-800/50 min-w-[3rem]">
                                <span className="text-[10px] text-blue-400 uppercase font-bold">Straight</span>
                                <span className="text-lg font-bold text-blue-200">{breakdown.s}</span>
                             </div>
                             <div className="flex flex-col items-center bg-purple-900/30 px-2 py-1 rounded border border-purple-800/50 min-w-[3rem]">
                                <span className="text-[10px] text-purple-400 uppercase font-bold">Left</span>
                                <span className="text-lg font-bold text-purple-200">{breakdown.l}</span>
                             </div>
                             <div className="flex flex-col items-center bg-orange-900/30 px-2 py-1 rounded border border-orange-800/50 min-w-[3rem]">
                                <span className="text-[10px] text-orange-400 uppercase font-bold">Right</span>
                                <span className="text-lg font-bold text-orange-200">{breakdown.r}</span>
                             </div>
                          </div>
                        </div>
                        
                        <div className="text-right pl-4 border-l border-white/5 ml-2">
                           <span className="text-2xl font-black block text-white">{breakdown.total}</span>
                           <span className="text-[9px] uppercase opacity-50 block">Total</span>
                        </div>
                     </div>
                   );
                })}
              </div>
            </div>
          );
        })}
        
        <div className="text-center p-4 text-gray-500 text-xs italic border-t border-gray-800">
           System loops back to Phase 1 after Phase 6
        </div>
      </div>
    </div>
  );
};
