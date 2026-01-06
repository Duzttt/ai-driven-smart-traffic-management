import { useState, useEffect, useRef, useCallback } from 'react';
import { SimulationState, Lane, Turn, AnalyticsData, Car } from '../types';
import { 
    TRAFFIC_PHASES, INITIAL_LANES, BASE_PHASE_DURATION, 
    MAX_GREEN_TIME, MIN_GREEN_TIME, GATE_DISTANCE_CHECK,
    ACCELERATION, DECELERATION, MAX_SPEED, CAR_LENGTH, INTERSECTION_START, LANE_LENGTH
} from '../constants';

const CAR_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

// ============================================================================
// LOGIC HELPERS
// ============================================================================

/**
 * Fairness Algo: Calculates Green Duration based on demand.
 * Penalizes duration if other lanes are heavily congested (starvation prevention).
 */
const calculateTimer = (activeCars: number, waitingCars: number) => {
    // Basic requirement: 30 ticks (~1.5s) per car + buffer
    let neededTime = (activeCars * 30) + 100; 
    
    // Fairness Throttle: If more than 15 cars are waiting elsewhere, 
    // we cap the time to force a rotation sooner.
    if (waitingCars > 15) {
        const fairnessRatio = activeCars / (activeCars + waitingCars);
        neededTime = neededTime * (0.4 + (fairnessRatio * 0.6)); 
    }
    
    return Math.min(Math.max(neededTime, MIN_GREEN_TIME), MAX_GREEN_TIME);
};

export interface ExtendedSimulationState extends SimulationState {
  aiIntervention: boolean;
  lastDecision: string | null;
  incomingPlatoons: Record<string, number>; 
  spawnCooldowns: Record<string, number>;
  phaseThroughput: Record<string, number>; 
}

export const useTrafficSimulation = () => {
  const [state, setState] = useState<ExtendedSimulationState>({
    lanes: INITIAL_LANES,
    currentPhaseIndex: 0,
    phaseTimer: BASE_PHASE_DURATION,
    totalCarsProcessed: 0,
    averageWaitTime: 0,
    isPaused: false,
    aiIntervention: false,
    lastDecision: null,
    incomingPlatoons: {},
    spawnCooldowns: {},
    phaseThroughput: {},
  });

  const stateRef = useRef(state);
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  
  // Keep ref in sync for the interval
  useEffect(() => { stateRef.current = state; }, [state]);

  // =================================================================================
  // MANUAL PROCEED (Triggered by UI Button after AI Analysis)
  // =================================================================================
  const proceedToNextPhase = useCallback(() => {
    if (!stateRef.current.lastDecision) return;

    const decision = JSON.parse(stateRef.current.lastDecision);
    
    setState(prev => ({
        ...prev,
        currentPhaseIndex: decision.nextPhaseIndex,
        phaseTimer: decision.rawDuration,
        aiIntervention: false,
        isPaused: false,
        phaseThroughput: {} // Clear throughput stats for the new phase
    }));
  }, []);

  const stepSimulation = useCallback(() => {
    // Global pause or AI Intervention pause
    if (stateRef.current.isPaused || stateRef.current.aiIntervention) return;

    let nextState = { ...stateRef.current };
    const currentPhase = TRAFFIC_PHASES[nextState.currentPhaseIndex];
    let carsProcessedInTick = 0;
    const YELLOW_THRESHOLD = 60; // 3 seconds at 20fps

    // =================================================================================
    // 1. PLATOON GENERATOR (Incoming Traffic Waves)
    // =================================================================================
    [1, 2, 3, 4].forEach(laneId => {
        [Turn.Straight, Turn.Left, Turn.Right].forEach(intention => {
            const key = `${laneId}_${intention}`;
            if (Math.random() < 0.015) { // 1.5% chance per tick to spawn a platoon
                const batchSize = Math.floor(Math.random() * 6) + 2; 
                nextState.incomingPlatoons[key] = (nextState.incomingPlatoons[key] || 0) + batchSize;
            }
        });
    });

    // =================================================================================
    // 2. SPAWN EXECUTION (Entrance Logic)
    // =================================================================================
    nextState.lanes = nextState.lanes.map(lane => {
        let newCars = [...lane.cars];
        let laneChanged = false;

        [Turn.Straight, Turn.Left, Turn.Right].forEach(intention => {
            const key = `${lane.id}_${intention}`;
            const carsRemaining = nextState.incomingPlatoons[key] || 0;
            const cooldown = nextState.spawnCooldowns[key] || 0;

            if (cooldown > 0) nextState.spawnCooldowns[key] = cooldown - 1;

            if (carsRemaining > 0 && nextState.spawnCooldowns[key] <= 0) {
                const isBlocked = newCars.some(c => c.intention === intention && c.position < 15);
                if (!isBlocked) {
                    newCars.push({
                        id: Math.random().toString(36).substr(2, 9),
                        laneId: lane.id,
                        position: -20,
                        speed: 2.0,
                        intention,
                        waitingTime: 0,
                        color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)]
                    });
                    nextState.incomingPlatoons[key]--;
                    nextState.spawnCooldowns[key] = 12; // Gap between cars
                    laneChanged = true;
                }
            }
        });
        return laneChanged ? { ...lane, cars: newCars } : lane;
    });

    // =================================================================================
    // 3. PHASE END TRIGGER (AUTO-PAUSE & CALCULATE)
    // =================================================================================
    if (nextState.phaseTimer <= 0) {
        const nextIndex = (nextState.currentPhaseIndex + 1) % TRAFFIC_PHASES.length;
        const nextPhaseData = TRAFFIC_PHASES[nextIndex];
        const prevPhaseData = TRAFFIC_PHASES[nextState.currentPhaseIndex];

        // Gather metrics for the AI
        let activeLoad = 0;
        let waitingLoad = 0;

        [1, 2, 3, 4].forEach(lId => {
            [Turn.Straight, Turn.Left, Turn.Right].forEach(turn => {
                const lane = nextState.lanes.find(l => l.id === lId);
                const count = (lane?.cars.filter(c => c.intention === turn).length || 0) + 
                              (nextState.incomingPlatoons[`${lId}_${turn}`] || 0);
                
                if (nextPhaseData.activeLanes.includes(lId) && nextPhaseData.allowedTurns.includes(turn)) {
                    activeLoad += count;
                } else {
                    waitingLoad += count;
                }
            });
        });

        const newRawDuration = calculateTimer(activeLoad, waitingLoad);

        // FREEZE simulation and set Intervention State
        setState(prev => ({
            ...prev,
            isPaused: true,
            aiIntervention: true,
            lastDecision: JSON.stringify({
                prevPhase: prevPhaseData.id,
                nextPhase: nextPhaseData.id,
                nextPhaseIndex: nextIndex,
                activeLoad,
                waitingLoad,
                throughput: prev.phaseThroughput,
                assignedDuration: (newRawDuration / 20).toFixed(1),
                rawDuration: newRawDuration
            })
        }));
        return; 
    }
    
    nextState.phaseTimer -= 1;

    // =================================================================================
    // 4. PHYSICS ENGINE (Movement & Collisions)
    // =================================================================================
    nextState.lanes = nextState.lanes.map(lane => {
      const sortedCars = [...lane.cars].sort((a, b) => b.position - a.position);
      const movedCars = sortedCars.map((car) => {
        let nextCar = { ...car };
        
        // Find car ahead in the same sub-lane
        const carAhead = sortedCars.find(c => c.intention === car.intention && c.position > car.position);

        let distanceToNext = 1000;
        if (carAhead) {
            distanceToNext = carAhead.position - car.position - CAR_LENGTH; 
        } else {
             // Stop Line Logic
             const canGo = lane.isGreen && currentPhase.allowedTurns.includes(car.intention);
             const isYellow = nextState.phaseTimer < YELLOW_THRESHOLD;
             const yellowBail = isYellow && car.position < (INTERSECTION_START - 20);
             
             if (!canGo || yellowBail) {
                 if (car.position < INTERSECTION_START) {
                     distanceToNext = INTERSECTION_START - car.position;
                 }
             }
        }

        // Dynamics
        if (distanceToNext < 8) {
            nextCar.speed = Math.max(0, nextCar.speed - DECELERATION);
        } else if (distanceToNext < 25) {
            nextCar.speed = Math.max(0.3, nextCar.speed - 0.1); 
        } else {
            nextCar.speed = Math.min(MAX_SPEED, nextCar.speed + ACCELERATION);
        }

        nextCar.position += nextCar.speed;
        if (nextCar.speed < 0.1) nextCar.waitingTime += 1;
        
        return nextCar;
      });

      const remainingCars = movedCars.filter(c => {
          if (c.position > LANE_LENGTH) {
              carsProcessedInTick++;
              const key = `${lane.id}_${c.intention}`;
              nextState.phaseThroughput[key] = (nextState.phaseThroughput[key] || 0) + 1;
              return false;
          }
          return true;
      });
      
      return { ...lane, cars: remainingCars };
    });

    nextState.totalCarsProcessed += carsProcessedInTick;

    // Sync Light Colors to lanes
    const activePhase = TRAFFIC_PHASES[nextState.currentPhaseIndex];
    nextState.lanes = nextState.lanes.map(lane => ({
      ...lane,
      isGreen: activePhase.activeLanes.includes(lane.id),
      greenTimeRemaining: nextState.phaseTimer
    }));

    // Record Analytics for the chart
    if (nextState.phaseTimer % 20 === 0) {
        setAnalytics(prev => [...prev.slice(-19), {
            phaseId: activePhase.id,
            lane1Count: nextState.lanes[0].cars.length,
            lane2Count: nextState.lanes[1].cars.length,
            lane3Count: nextState.lanes[2].cars.length,
            lane4Count: nextState.lanes[3].cars.length,
            activeVsWaitingRatio: 1, 
            timestamp: new Date().toLocaleTimeString(),
        }]);
    }

    setState(nextState);
  }, [proceedToNextPhase]);

  useEffect(() => {
    const interval = setInterval(stepSimulation, 50); 
    return () => clearInterval(interval);
  }, [stepSimulation]);

  return {
    state,
    analytics,
    togglePause: () => setState(prev => ({ ...prev, isPaused: !prev.isPaused })),
    resetSimulation: () => setState({ 
        lanes: INITIAL_LANES, 
        totalCarsProcessed: 0, 
        currentPhaseIndex: 0, 
        phaseTimer: BASE_PHASE_DURATION, 
        averageWaitTime: 0, 
        isPaused: false, 
        aiIntervention: false, 
        lastDecision: null, 
        incomingPlatoons: {}, 
        spawnCooldowns: {}, 
        phaseThroughput: {} 
    }),
    proceedToNextPhase
  };
};