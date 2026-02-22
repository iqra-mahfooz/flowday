import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import { Task } from '@/types/gitspace';

interface Props {
  activeTask: Task | null;
  onSessionComplete: (minutes: number, type: 'focus' | 'break') => void;
}

const FOCUS_MINUTES = 25;
const BREAK_MINUTES = 5;

export default function FocusTimer({ activeTask, onSessionComplete }: Props) {
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = mode === 'focus' ? FOCUS_MINUTES * 60 : BREAK_MINUTES * 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      onSessionComplete(mode === 'focus' ? FOCUS_MINUTES : BREAK_MINUTES, mode);
      // Auto-switch
      if (mode === 'focus') {
        setMode('break');
        setSecondsLeft(BREAK_MINUTES * 60);
      } else {
        setMode('focus');
        setSecondsLeft(FOCUS_MINUTES * 60);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, secondsLeft, mode, onSessionComplete]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(mode === 'focus' ? FOCUS_MINUTES * 60 : BREAK_MINUTES * 60);
  };

  const switchMode = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      setMode('break');
      setSecondsLeft(BREAK_MINUTES * 60);
    } else {
      setMode('focus');
      setSecondsLeft(FOCUS_MINUTES * 60);
    }
  };

  // SVG ring
  const size = 160;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center bg-card rounded-2xl p-6 border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-semibold font-display text-foreground uppercase tracking-wide">
          {mode === 'focus' ? 'Focus' : 'Break'}
        </h3>
        <button
          onClick={switchMode}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title={mode === 'focus' ? 'Switch to break' : 'Switch to focus'}
        >
          <Coffee className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Timer ring */}
      <div className="relative mb-4">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={mode === 'focus' ? 'hsl(var(--primary))' : 'hsl(var(--accent))'}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold font-display text-foreground tabular-nums">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          {activeTask && (
            <p className="text-[11px] text-muted-foreground mt-1 max-w-[100px] truncate text-center">
              {activeTask.title}
            </p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={resetTimer}
          className="w-9 h-9 rounded-xl bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={toggleTimer}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md ${
            mode === 'focus'
              ? 'bg-primary text-primary-foreground hover:opacity-90'
              : 'bg-accent text-accent-foreground hover:opacity-90'
          }`}
        >
          {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
        <div className="w-9 h-9" /> {/* Spacer for symmetry */}
      </div>
    </div>
  );
}
