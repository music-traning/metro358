import React from 'react';
import { BeatState } from './types.js';

export const ICONS = {
  PLAY: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-8 h-8" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347c.75.413.75 1.559 0 1.972l-11.54 6.347c-.75.413-1.667-.13-1.667-.986V5.653Z" })),
  PAUSE: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-8 h-8" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 5.25v13.5m-7.5-13.5v13.5" })),
  RECORD: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "currentColor", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-6 h-6" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z" })),
  STOP: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "currentColor", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-6 h-6" }, React.createElement("path", { fillRule: "evenodd", d: "M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z", clipRule: "evenodd" })),
  PLAY_RECORDING: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-6 h-6" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" }), React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" })),
};

const { Off, Normal, Accent } = BeatState;

export const PRESETS = [
  { name: 'Clear', pattern: Array(16).fill(Off) },
  { name: 'All Beats On', pattern: Array(16).fill(Normal) },
  { name: 'Four on the Floor', pattern: [Accent, Normal, Normal, Normal, Accent, Normal, Normal, Normal, Accent, Normal, Normal, Normal, Accent, Normal, Normal, Normal] },
  { name: 'Classic Backbeat', pattern: [Off, Off, Off, Off, Accent, Off, Off, Off, Off, Off, Off, Off, Accent, Off, Off, Off] },
  { name: 'Shuffle / Swing', pattern: [Accent, Off, Normal, Accent, Off, Normal, Accent, Off, Normal, Accent, Off, Normal, Accent, Off, Normal, Accent] },
  { name: 'Jazz Ride', pattern: [Accent, Off, Normal, Off, Normal, Off, Off, Off, Accent, Off, Normal, Off, Normal, Off, Off, Off] },
  { name: 'Boom Bap (Hip-Hop)', pattern: [Accent, Off, Off, Off, Normal, Off, Accent, Off, Accent, Off, Off, Off, Normal, Off, Accent, Off] },
  { name: 'Trap (808)', pattern: [Accent, Normal, Normal, Normal, Normal, Normal, Off, Normal, Normal, Normal, Normal, Off, Accent, Normal, Normal, Off] },
  { name: 'Funk Syncopation', pattern: [Accent, Off, Off, Normal, Off, Normal, Off, Normal, Accent, Off, Off, Normal, Off, Normal, Off, Off] },
  { name: '3-2 Son Clave', pattern: [Accent, Off, Off, Off, Off, Off, Normal, Off, Off, Off, Off, Off, Accent, Off, Normal, Off] },
  { name: 'Bossa Nova', pattern: [Accent, Off, Off, Normal, Off, Off, Off, Normal, Accent, Off, Off, Off, Normal, Off, Off, Normal] },
  { name: 'Reggae One Drop', pattern: [Off, Normal, Off, Normal, Off, Normal, Accent, Normal, Off, Normal, Off, Normal, Off, Normal, Accent, Normal] },
];
