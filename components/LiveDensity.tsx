import React from 'react';
import { SimulationState, Turn } from '../types';
import { TRAFFIC_PHASES } from '../constants';
import { MoveRight, MoveUp, MoveLeft, Clock } from 'lucide-react';
import { ExtendedSimulationState } from '../hooks/useTrafficSimulation';

interface LiveDensityProps {
  state: SimulationState;
}

export const LiveDensity: React.FC<LiveDensityProps> = ({ state }) => {
  
  const extState = state as ExtendedSimulationState;

  // Helper: Get Data
  const getSubLaneData = (laneId: number, turn: Turn) => {
    const lane = state.lanes.find(l => l.id === laneId);
    
    // 1. VISIBLE ONLY
    // We only count lane.cars.length. 
    // Since the simulation spawns them 1-by-1 with a delay, 
    // this number will "tick up" naturally (3 -> 4 -> 5 -> 6).
    const visible = lane?.cars.filter(c => c.intention === turn).length || 0;
    
    // 2. PASSED (Throughput)
    const incomingKey = `${laneId}_${turn}`;
    const passed = extState.phaseThroughput ? (extState.phaseThroughput[incomingKey] || 0) : 0;

    return { visible, passed };
  };

  const getLaneStats = (laneId: number) => {
      const l = getSubLaneData(laneId, Turn.Left);
      const s = getSubLaneData(laneId, Turn.Straight);
      const r = getSubLaneData(laneId, Turn.Right);
      
      const totalVisible = l.visible + s.visible + r.visible;
      
      return { totalVisible, l, s, r };
  };

  const getLightState = (laneId: number) => {
    const currentPhase = TRAFFIC_PHASES[state.currentPhaseIndex];
    const isActive = currentPhase.activeLanes.includes(laneId);
    const isYellow = isActive && state.phaseTimer < 60; 
    const isRed = !isActive;
    const isGreen = isActive && !isYellow;

    return { 
        status: isRed ? 'red' : isYellow ? 'yellow' : 'green',
        timer: isActive ? (state.phaseTimer / 20).toFixed(1) : '--',
        allowedTurns: currentPhase.allowedTurns
    };
  };

  // Helper component for the small data boxes
  const StatBox = ({ label, data, borderClass }: { label: string, data: {visible: number, passed: number}, borderClass: string }) => (
    <div className={`bg-gray-800/50 rounded py-1 border-t ${borderClass} flex flex-col items-center min-h-[3.5rem] justify-center relative`}>
        <span className="text-[9px] text-gray-500 font-bold uppercase mb-0.5">{label}</span>
        
        <div className="flex gap-2 items-end leading-none">
            {/* MAIN NUMBER: Shows cars currently on screen */}
            <span className="text-sm font-mono text-white">{data.visible}</span>
            
            {/* PASSED COUNT */}
            {data.passed > 0 && (
                <span className="text-[10px] font-mono text-green-400 font-bold mb-0.5">+{data.passed}</span>
            )}
        </div>
    </div>
  );

  return (
    <div className="h-full bg-gray-900/80 rounded-2xl p-4 border border-gray-700/50 shadow-inner flex flex-col">
       <div className="flex justify-between items-end mb-4 border-b border-gray-700 pb-2">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">
            Live Traffic Density
          </h3>
          <span className="text-[10px] text-gray-500 font-mono text-right leading-tight">
             WHITE: QUEUE<br/>
             <span className="text-green-400">GREEN: PASSED</span>
          </span>
       </div>

       <div className="flex-grow overflow-y-auto space-y-3 custom-scrollbar">
          {[1, 2, 3, 4].map(laneId => {
              const stats = getLaneStats(laneId);
              const lightState = getLightState(laneId);
              
              return (
                <div key={laneId} className="bg-black/40 rounded-xl p-3 border border-gray-800 flex gap-4">
                    
                    {/* LEFT SIDE: DENSITY STATS */}
                    <div className="flex-grow">
                        <div className="flex justify-between mb-2">
                            <span className="text-xs font-bold text-gray-300">Lane {laneId}</span>
                            <div className="text-right">
                                <span className={`text-[10px] font-mono font-bold ${stats.totalVisible > 15 ? 'text-red-400' : 'text-gray-500'}`}>
                                    {stats.totalVisible} Vehicles
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-1 text-center">
                            <StatBox 
                                label="L" 
                                data={stats.l} 
                                borderClass={stats.l.visible > 10 ? 'border-red-500 bg-red-900/20' : 'border-purple-500/30'} 
                            />
                            <StatBox 
                                label="S" 
                                data={stats.s} 
                                borderClass={stats.s.visible > 10 ? 'border-red-500 bg-red-900/20' : 'border-blue-500/30'} 
                            />
                            <StatBox 
                                label="R" 
                                data={stats.r} 
                                borderClass={stats.r.visible > 10 ? 'border-red-500 bg-red-900/20' : 'border-orange-500/30'} 
                            />
                        </div>
                    </div>

                    {/* RIGHT SIDE: TRAFFIC LIGHT UI */}
                    <div className="flex flex-col items-center justify-center min-w-[80px] border-l border-gray-700 pl-4">
                        <div className={`text-sm font-mono font-bold mb-2 flex items-center gap-1 ${lightState.status === 'red' ? 'text-red-900' : 'text-yellow-400'}`}>
                            <Clock size={12} />
                            {lightState.timer}s
                        </div>
                        <div className="bg-gray-900 border border-gray-600 p-1.5 rounded-lg flex flex-col gap-1.5 shadow-lg">
                            <div className={`w-8 h-8 rounded-full border border-black/50 transition-all duration-300 ${lightState.status === 'red' ? 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.6)]' : 'bg-red-900/20 opacity-30'}`}></div>
                            <div className={`w-8 h-8 rounded-full border border-black/50 transition-all duration-300 ${lightState.status === 'yellow' ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)]' : 'bg-yellow-900/20 opacity-30'}`}></div>
                            <div className={`w-8 h-8 rounded-full border border-black/50 flex items-center justify-center transition-all duration-300 ${lightState.status === 'green' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-green-900/20 opacity-30'}`}>
                                {lightState.status === 'green' && (
                                    <div className="flex gap-0.5">
                                        {lightState.allowedTurns.includes(Turn.Left) && <MoveLeft size={10} className="text-black" strokeWidth={3} />}
                                        {lightState.allowedTurns.includes(Turn.Straight) && <MoveUp size={10} className="text-black" strokeWidth={3} />}
                                        {lightState.allowedTurns.includes(Turn.Right) && <MoveRight size={10} className="text-black" strokeWidth={3} />}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
              );
          })}
       </div>
    </div>
  );
};