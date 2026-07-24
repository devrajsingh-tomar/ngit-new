import React, { useMemo } from 'react';
import { useTypingStore } from '@/store/useTypingStore';
import { cn } from "@/lib/utils";
import { Target, Zap, AlertCircle, BarChart3, Clock, Maximize, Minimize, Keyboard, ArrowLeft } from 'lucide-react';

/**
 * StatCard Component (Private)
 */
const StatCard = ({ icon: Icon, label, value, hexColor, unit }: any) => (
  <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-2 mb-2">
      <div 
        className="p-1.5 rounded-lg shrink-0" 
        style={{ backgroundColor: `${hexColor}15` }} 
      >
        <Icon className="w-3.5 h-3.5" style={{ color: hexColor }} />
      </div>
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-black text-slate-900">{value}</span>
      {unit && <span className="text-[9px] font-bold text-slate-400">{unit}</span>}
    </div>
  </div>
);

/**
 * LiveDashboard Component
 * Displays real-time metrics during the typing test.
 * Metrics: WPM, Accuracy, Errors, and DPH (Depressions Per Hour)
 */
export const LiveDashboard: React.FC = () => {
  const { 
    wpm, netWpm, grossWpm, accuracy, errorCount, wrongWords, 
    progress, keystrokes, timeLeft, settings, isActive, isFinished,
    backspaceCount
  } = useTypingStore();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
      {/* Net Speed */}
      <StatCard 
        icon={Zap} 
        label="Net WPM" 
        value={netWpm} 
        unit="WPM" 
        hexColor="#4f46e5" // Indigo 600
      />
      
      {/* Gross Speed */}
      <StatCard 
        icon={BarChart3} 
        label="Gross WPM" 
        value={grossWpm} 
        unit="WPM" 
        hexColor="#0ea5e9" // Sky 500
      />

      {/* Accuracy */}
      <StatCard 
        icon={Target} 
        label="Accuracy" 
        value={accuracy} 
        unit="%" 
        hexColor="#059669" // Emerald 600
      />
      
      {/* Progress */}
      <StatCard 
        icon={Clock} 
        label="Progress" 
        value={progress} 
        unit="%" 
        hexColor="#8b5cf6" // Violet 500
      />

      {/* Wrong Words */}
      <StatCard 
        icon={AlertCircle} 
        label="Wrong Words" 
        value={wrongWords} 
        hexColor="#e11d48" // Rose 600
      />
      
      {/* Keystrokes */}
      <StatCard 
        icon={Keyboard} 
        label="Keystrokes" 
        value={keystrokes} 
        hexColor="#d97706" // Amber 600
      />

      {/* Backspaces */}
      <StatCard 
        icon={ArrowLeft} 
        label="Backspaces" 
        value={backspaceCount} 
        hexColor="#f59e0b" // Amber 500
      />
    </div>
  );
};

/**
 * TimerDisplay Component
 */
export const TimerDisplay: React.FC = () => {
  const { timeLeft, toggleFullScreen, isFullScreen } = useTypingStore();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft < 60;

  return (
    <div className="flex flex-col gap-4 w-full transition-all duration-500">
      
      <div className={cn(
        "flex flex-col items-center w-full bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm transition-all",
        isFullScreen && "border-indigo-200 shadow-indigo-100 shadow-xl scale-105"
      )}>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Time Remaining</span>
        <div className={`flex items-center justify-center gap-2 w-full py-2 rounded-2xl border-2 transition-colors ${isLowTime ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' : 'bg-slate-50 border-slate-100 text-slate-900'}`}>
          <Clock className="w-4 h-4 opacity-50 shrink-0" />
          <span className="text-2xl font-black tabular-nums font-mono tracking-tight">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="flex justify-end w-full">
        <button 
          onClick={toggleFullScreen}
          className={cn(
            "flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl",
            isFullScreen 
              ? "bg-rose-600 text-white hover:bg-rose-700 hover:scale-110" 
              : "bg-slate-900 text-white hover:bg-black"
          )}
        >
          {isFullScreen ? (
            <>
              <Minimize className="w-4 h-4" />
              Exit Exam FullScreen
            </>
          ) : (
            <>
              <Maximize className="w-4 h-4" />
              FullScreen Mode
            </>
          )}
        </button>
      </div>
    </div>
  );
};
