import { Phase, Turn, Lane, Direction, Car } from './types';

// ============================================================================
// CONFIGURATION & PHYSICS
// ============================================================================
export const BASE_PHASE_DURATION = 200;
export const TICKS_PER_SECOND = 20;

// TIMING LOGIC
export const MIN_GREEN_TIME = 100; 
export const MAX_GREEN_TIME = 1200; 
export const YELLOW_DURATION = 60; 

// SPATIAL LOGIC
// CHANGED: Increased from 100 to 150. 
// Result: Cars take longer to "exit", so the numbers stay higher and more stable.
export const LANE_LENGTH = 150; 

export const INTERSECTION_START = 60;
export const INTERSECTION_END = 80;
export const GATE_DISTANCE_CHECK = 30; 

// CAR PHYSICS
export const CAR_LENGTH = 9;    // Slight increase for realism
export const MAX_SPEED = 2.2;   
export const ACCELERATION = 0.15; 
export const DECELERATION = 0.3;

// ============================================================================
// PHASES (Unchanged)
// ============================================================================
export const TRAFFIC_PHASES: Phase[] = [
  { id: 1, description: "Vertical Straight/Left", activeLanes: [1, 2], allowedTurns: [Turn.Straight, Turn.Left] },
  { id: 2, description: "Lane 1 Right", activeLanes: [1], allowedTurns: [Turn.Right] },
  { id: 3, description: "Lane 2 Right", activeLanes: [2], allowedTurns: [Turn.Right] },
  { id: 4, description: "Horizontal Straight/Left", activeLanes: [3, 4], allowedTurns: [Turn.Straight, Turn.Left] },
  { id: 5, description: "Lane 3 Right", activeLanes: [3], allowedTurns: [Turn.Right] },
  { id: 6, description: "Lane 4 Right", activeLanes: [4], allowedTurns: [Turn.Right] },
];

// ============================================================================
// INITIAL STATE (PRE-LOADED)
// ============================================================================
const CAR_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
const INTENTIONS = [Turn.Straight, Turn.Left, Turn.Straight, Turn.Right, Turn.Left]; 

const generateQueue = (laneId: number, count: number): Car[] => {
  return Array.from({ length: count }).map((_, index) => {
    // Stack cars backwards from the intersection line
    const position = 58 - (index * CAR_LENGTH); 
    
    return {
      id: `init_${laneId}_${index}`,
      laneId: laneId,
      position: position,
      speed: 0,
      intention: INTENTIONS[index % INTENTIONS.length],
      waitingTime: (count - index) * 5, 
      color: CAR_COLORS[index % CAR_COLORS.length]
    };
  });
};

export const INITIAL_LANES: Lane[] = [
  { 
    id: 1, direction: Direction.North, isGreen: false, greenTimeRemaining: 0,
    cars: generateQueue(1, 14) 
  },
  { 
    id: 2, direction: Direction.South, isGreen: false, greenTimeRemaining: 0,
    cars: generateQueue(2, 16) 
  },
  { 
    id: 3, direction: Direction.East, isGreen: false, greenTimeRemaining: 0,
    cars: generateQueue(3, 8)  
  },
  { 
    id: 4, direction: Direction.West, isGreen: false, greenTimeRemaining: 0,
    cars: generateQueue(4, 6)  
  },
];