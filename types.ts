export enum Direction {
  North = 'North',
  South = 'South',
  East = 'East',
  West = 'West',
}

export enum Turn {
  Straight = 'Straight',
  Left = 'Left',
  Right = 'Right',
}

export interface Car {
  id: string;
  laneId: number;
  position: number; // 0 to 100 distance units
  speed: number;
  intention: Turn;
  waitingTime: number;
  color: string;
}

export interface Lane {
  id: number;
  direction: Direction; // Where traffic is coming FROM
  cars: Car[];
  isGreen: boolean;
  greenTimeRemaining: number;
}

export interface Phase {
  id: number;
  description: string;
  activeLanes: number[]; // Lane IDs that have green
  allowedTurns: Turn[]; // Turns allowed in this phase for the active lanes
}

export interface SimulationState {
  lanes: Lane[];
  currentPhaseIndex: number;
  phaseTimer: number;
  totalCarsProcessed: number;
  averageWaitTime: number;
  isPaused: boolean;
}

export interface AnalyticsData {
  phaseId: number;
  lane1Count: number;
  lane2Count: number;
  lane3Count: number;
  lane4Count: number;
  activeVsWaitingRatio: number;
  timestamp: string;
}