<div align="center"> <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" /> </div>

AI-Driven Smart Traffic Management
A sophisticated simulation and visualization tool designed to showcase how Large Language Models (LLMs) can optimize urban mobility. This application demonstrates real-time traffic flow adjustments and predictive analysis using AI.

View the app in AI Studio: https://ai.studio/apps/drive/19k1aA0SWnNJqnxcEW6NSUqx55Xu0nSwo

🚦 How It Works
The application functions as a closed-loop system between a physics-based simulation and an AI brain:

Traffic Simulation: The engine generates dynamic vehicle flows across intersections, tracking "Live Density" and "Phase Queues" (how many cars are waiting for a green light).

Data Ingestion: The simulation state is fed into the AI Analyst component.

AI Optimization: Using the Gemini API, the system analyzes congestion patterns. It identifies bottlenecks that traditional timed sensors might miss and suggests optimal light timing adjustments.

Real-time Visualization: The dashboard renders these metrics into digestible charts and a live intersection map, allowing users to see the "AI at work."

Features
Real-time Visualization: Interactive components for monitoring intersection health.

AI-Powered Insights: Integration with Gemini for intelligent traffic pattern analysis.

Reactive Architecture: Built with Vite + React for high-performance state updates.

Simulation Hooks: Custom logic for modeling complex vehicle behaviors.

Prerequisites
Node.js (16+ recommended)

A Gemini API key (optional — required for AI features)

Quickstart
Install dependencies

Bash

npm install
Provide your Gemini API key Create a .env.local file in the project root with:

Plaintext

GEMINI_API_KEY=your_gemini_api_key_here
Run the dev server

Bash

npm run dev
Project Structure
App.tsx — root app component

index.tsx, index.html — app entry and HTML template

vite.config.ts, tsconfig.json, package.json — build tooling

components/ — UI components: AIAnalyst.tsx, Dashboard.tsx, Intersection.tsx, LiveDensity.tsx, PhaseQueue.tsx

hooks/useTrafficSimulation.ts — simulation logic

constants.ts, types.ts — shared types and constants

Enabling AI features
The AI features call Gemini; ensure GEMINI_API_KEY is set. Without it, the app still runs but AI-driven analysis will be disabled or mocked.

Development notes
This project uses Vite for fast HMR during development.

Tests: (none included) — add your preferred test runner if needed.

Contributing
Open issues or PRs for bugs, enhancements, or documentation updates.
