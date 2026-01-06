import React from 'react';
import { AnalyticsData, SimulationState } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { Car, Clock, Activity } from 'lucide-react';

interface DashboardProps {
  analytics: AnalyticsData[];
  state: SimulationState;
}

export const Dashboard: React.FC<DashboardProps> = ({ analytics, state }) => {
  const currentData = analytics.slice(-20); // Show last 20 data points

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      {/* Stats Cards */}
      <div className="col-span-1 md:col-span-2 grid grid-cols-3 gap-4">
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-full text-blue-400"><Car size={24} /></div>
              <div>
                  <p className="text-sm text-gray-400">Processed Cars</p>
                  <p className="text-2xl font-bold">{state.totalCarsProcessed}</p>
              </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-full text-green-400"><Activity size={24} /></div>
              <div>
                  <p className="text-sm text-gray-400">Current Phase</p>
                  <p className="text-2xl font-bold">Phase {state.currentPhaseIndex + 1}</p>
              </div>
          </div>
           <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-full text-purple-400"><Clock size={24} /></div>
              <div>
                  <p className="text-sm text-gray-400">Timer</p>
                  <p className="text-2xl font-bold">{(state.phaseTimer / 20).toFixed(1)}s</p>
              </div>
          </div>
      </div>

      {/* Charts */}
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 h-[250px]">
          <h3 className="text-sm font-semibold mb-4 text-gray-300">Queue Length per Lane</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={currentData}>
               <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="timestamp" tick={false} stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} 
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="lane1Count" name="L1 (North)" stackId="a" fill="#3b82f6" />
              <Bar dataKey="lane2Count" name="L2 (South)" stackId="a" fill="#ef4444" />
              <Bar dataKey="lane3Count" name="L3 (West)" stackId="a" fill="#10b981" />
              <Bar dataKey="lane4Count" name="L4 (East)" stackId="a" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
      </div>

      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 h-[250px]">
          <h3 className="text-sm font-semibold mb-4 text-gray-300">Efficiency (Active vs Waiting)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="timestamp" tick={false} stroke="#9ca3af"/>
              <YAxis stroke="#9ca3af" domain={[0, 2]} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
              <Line type="monotone" dataKey="activeVsWaitingRatio" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
      </div>
    </div>
  );
};
