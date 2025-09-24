import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BeatState } from './types.js';
import { ICONS, PRESETS } from './constants.js';
import useIsDesktop from './hooks/useIsDesktop.js';
import { AudioEngine } from './services/AudioEngine.js';

// --- Reusable Child Components ---

const BeatButton = ({ state, isActive, isCountingIn, onClick }) => {
  const baseClasses = "w-full h-16 rounded-md transition-all duration-150 flex items-center justify-center text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-400";
  const stateClasses = {
    [BeatState.Off]: 'bg-gray-700 hover:bg-gray-600',
    [BeatState.Normal]: 'bg-blue-500 hover:bg-blue-400',
    [BeatState.Accent]: 'bg-indigo-600 hover:bg-indigo-500',
  };
  const activeClasses = isActive ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-white scale-105' : '';
  const countingInClasses = isCountingIn ? 'animate-pulse' : '';

  return React.createElement("button", {
      onClick: onClick,
      className: `${baseClasses} ${stateClasses[state]} ${activeClasses} ${countingInClasses}`,
      "aria-label": `Beat button state ${BeatState[state]}`
    });
};


// --- Main App Component ---

const App = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(60);
  const [beats, setBeats] = useState(PRESETS[2].pattern);
  
  const currentStep = useRef(-1);
  const [displayStep, setDisplayStep] = useState(-1);
  const stepsSinceStart = useRef(0);

  const [isRecording, setIsRecording] = useState(false);
  const [isCountingIn, setIsCountingIn] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [countInDisplay, setCountInDisplay] = useState(null);
  
  const isDesktop = useIsDesktop();
  
  const audioEngine = useRef(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const intentToRecord = useRef(false);

  const schedulerTimer = useRef(null);
  const nextNoteTime = useRef(0);
  const lookaheadMs = 25.0;
  const scheduleAheadTime = 0.1;

  const stateRef = useRef({ isPlaying, bpm, beats, isCountingIn, isRecording });
  useEffect(() => {
    stateRef.current = { isPlaying, bpm, beats, isCountingIn, isRecording };
  });

  useEffect(() => {
    audioEngine.current = new AudioEngine();
  }, []);

  useEffect(() => {
    if (isCountingIn && displayStep > -1) {
      if (displayStep % 4 === 0) {
        const beatNumber = (displayStep / 4) + 1;
        setCountInDisplay(String(beatNumber));
      }
    } else if (!isCountingIn) {
      setCountInDisplay(null);
    }
  }, [displayStep, isCountingIn]);


  const scheduleNote = useCallback((beatNumber, time) => {
    if (!audioEngine.current) return;
    const state = stateRef.current.beats[beatNumber];
    if (state === BeatState.Normal) {
      audioEngine.current.playClick(false, time);
    } else if (state === BeatState.Accent) {
      audioEngine.current.playClick(true, time);
    }
  }, []);

  const nextNote = useCallback(() => {
    const { bpm, isCountingIn } = stateRef.current;
    const secondsPerBeat = 60.0 / bpm / 4; // 16th notes
    nextNoteTime.current += secondsPerBeat;
    
    currentStep.current = (currentStep.current + 1) % 16;
    stepsSinceStart.current++;
    
    if (isCountingIn && stepsSinceStart.current >= 16) {
        setIsCountingIn(false);
        if (intentToRecord.current) {
            setIsRecording(true);
            mediaRecorder.current?.start();
            intentToRecord.current = false;
        }
    }
    
    setDisplayStep(currentStep.current);
  }, []);

  const scheduler = useCallback(() => {
    if (!audioEngine.current || !stateRef.current.isPlaying) {
      return;
    }
    
    const contextTime = audioEngine.current.getContextTime();
    
    while (nextNoteTime.current < contextTime + scheduleAheadTime) {
      const stepToSchedule = (currentStep.current + 1) % 16;
      
      if (stateRef.current.isCountingIn) {
        if (stepToSchedule % 4 === 0) {
            audioEngine.current.playClick(true, nextNoteTime.current);
        }
      } else {
        scheduleNote(stepToSchedule, nextNoteTime.current);
      }
      nextNote();
    }
    schedulerTimer.current = window.setTimeout(scheduler, lookaheadMs);
  }, [scheduleNote, nextNote]);


  useEffect(() => {
    if (isPlaying) {
      if (!audioEngine.current) return;
      audioEngine.current.ensureContext().then(() => {
        nextNoteTime.current = audioEngine.current.getContextTime() + 0.1;
        currentStep.current = -1;
        setDisplayStep(-1);
        stepsSinceStart.current = 0;
        scheduler();
      });
    } else {
      if (schedulerTimer.current) {
        clearTimeout(schedulerTimer.current);
        schedulerTimer.current = null;
      }
      currentStep.current = -1;
      setDisplayStep(-1);
    }
  }, [isPlaying, scheduler]);

  const togglePlay = async () => {
    if (!audioEngine.current) return;
    
    if (isPlaying) {
        setIsPlaying(false);
        setIsCountingIn(false);
        setIsRecording(false);
        intentToRecord.current = false;
        setCountInDisplay(null);
    } else {
        if (isDesktop && recordedUrl) {
            setRecordedUrl(null);
            mediaRecorder.current = null;
        }
        await audioEngine.current.ensureContext();
        intentToRecord.current = false;
        setIsCountingIn(true);
        setIsPlaying(true);
    }
  };
  
  const handleBeatClick = (index) => {
    const newBeats = [...beats];
    newBeats[index] = (newBeats[index] + 1) % 3;
    setBeats(newBeats);
  };

  const handlePresetChange = (e) => {
    const preset = PRESETS.find(p => p.name === e.target.value);
    if (preset) {
      setBeats(preset.pattern);
    }
  };
  
  const startRecording = async () => {
    if (!isDesktop) return;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        audioChunks.current = [];

        mediaRecorder.current.ondataavailable = event => {
            audioChunks.current.push(event.data);
        };

        mediaRecorder.current.onstop = () => {
            const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
            const url = URL.createObjectURL(audioBlob);
            setRecordedUrl(url);
            stream.getTracks().forEach(track => track.stop());
        };

        setRecordedUrl(null);
        intentToRecord.current = true;
        setIsCountingIn(true);
        setIsPlaying(true);

    } catch (err) {
        console.error("Microphone access denied:", err);
        alert("Microphone access is required for recording. Please allow access and try again.");
    }
  };

  const stopRecording = () => {
    setIsPlaying(false);
    setIsRecording(false);
    setIsCountingIn(false);
    intentToRecord.current = false;
    mediaRecorder.current?.stop();
    setCountInDisplay(null);
  };

  return React.createElement("div", { className: "bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans" },
    React.createElement("div", { className: "w-full max-w-2xl mx-auto space-y-6" },
      React.createElement("header", { className: "text-center" },
        React.createElement("h1", { className: "text-4xl font-bold tracking-tight" }, "Click Metronome"),
        React.createElement("p", { className: "text-gray-400" }, "Precision timing, simplified.")
      ),
      React.createElement("main", { className: "bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg relative" },
        countInDisplay && React.createElement("div", {
            key: countInDisplay,
            className: "absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 z-10 rounded-xl pointer-events-none"
          },
          React.createElement("span", { className: "text-9xl font-mono font-bold text-white opacity-75 animate-pulse" },
            countInDisplay
          )
        ),
        React.createElement("div", { className: "grid grid-cols-4 gap-2 sm:gap-3" },
          beats.map((state, i) =>
            React.createElement(BeatButton, {
              key: i,
              state: state,
              isActive: i === displayStep && !isCountingIn,
              isCountingIn: isCountingIn && i % 4 === 0,
              onClick: () => handleBeatClick(i)
            })
          )
        )
      ),
      React.createElement("footer", { className: "bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg space-y-6" },
        React.createElement("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-6" },
          React.createElement("button", {
              onClick: togglePlay,
              className: "w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg transform hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-600 disabled:cursor-not-allowed",
              disabled: isRecording
            },
            isPlaying ? ICONS.PAUSE : ICONS.PLAY
          ),
          React.createElement("div", { className: "flex-grow w-full sm:w-auto text-center" },
            React.createElement("div", { className: "text-5xl font-mono tracking-tighter" }, bpm),
            React.createElement("div", { className: "text-sm text-gray-400" }, "BPM"),
            React.createElement("input", {
              type: "range",
              min: "30",
              max: "240",
              value: bpm,
              onChange: (e) => setBpm(parseInt(e.target.value)),
              className: "w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer mt-2",
              disabled: isPlaying
            })
          ),
          React.createElement("div", { className: "w-full sm:w-48" },
            React.createElement("label", { htmlFor: "preset-select", className: "block mb-2 text-sm font-medium text-gray-400" }, "Rhythm Patterns"),
            React.createElement("select", {
                id: "preset-select",
                onChange: handlePresetChange,
                defaultValue: "Four on the Floor",
                disabled: isPlaying,
                className: "bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              },
              PRESETS.map(p => React.createElement("option", { key: p.name }, p.name))
            )
          )
        ),
        isDesktop && React.createElement("div", { className: "border-t border-gray-700 pt-6" },
          React.createElement("div", { className: "flex items-center justify-center gap-4" },
            !isRecording && !isCountingIn ?
              React.createElement("button", { onClick: startRecording, className: "flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-semibold disabled:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50", disabled: isPlaying },
                ICONS.RECORD, " Record Audio"
              ) :
              React.createElement("button", { onClick: stopRecording, className: "flex items-center gap-2 px-6 py-3 bg-red-800 hover:bg-red-700 rounded-lg transition-colors font-semibold animate-pulse" },
                ICONS.STOP, isCountingIn ? ' Counting In...' : ' Stop Recording'
              ),
            recordedUrl && React.createElement("div", { className: 'flex items-center gap-2' },
              React.createElement("audio", { src: recordedUrl, controls: true, className: "h-10" })
            )
          ),
          React.createElement("p", { className: "text-xs text-center mt-3 text-gray-500" }, "Click is for timing only and will not be in the final recording.")
        ),
        React.createElement("div", { className: "text-center text-gray-500 text-xs" },
          React.createElement("a", {
              href: "https://toshikinunokawa.com/online-salon/",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "hover:text-blue-400 transition-colors"
            },
            "Special Thanks Toshiki Nunokawa Online Salon"
          )
        )
      )
    )
  );
};

export default App;
