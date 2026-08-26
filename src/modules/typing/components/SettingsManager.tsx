import React from 'react';
import { useTypingStore } from '@/store/useTypingStore';
import { Settings, Lock } from 'lucide-react';

/**
 * SettingsManager Component
 * Handles all typing exam configurations with a security lock
 * that triggers once the test is active.
 */
export const SettingsManager: React.FC = () => {
  const { settings, updateSettings, isActive } = useTypingStore();

  const handleUpdate = (key: keyof typeof settings, value: any) => {
    if (isActive) return; // Prevent changes during active test
    updateSettings({ [key]: value });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          Exam Configuration
        </h3>
        {isActive && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase rounded-full border border-amber-100">
            <Lock className="w-3 h-3" />
            Locked During Test
          </span>
        )}
      </div>

      <div className="space-y-5">
        {/* Backspace Mode */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Backspace Restriction</label>
          <select 
            disabled={isActive}
            value={settings.backspaceMode}
            onChange={(e) => handleUpdate('backspaceMode', e.target.value)}
            className="w-full p-3 bg-slate-50 border-transparent rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <option value="full">Full Access</option>
            <option value="word">Word Only</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        {/* Keyboard Layout (For Hindi) */}
        {(settings.language === 'Hindi' || settings.language === 'Unicode Hindi' || settings.language === 'Krutidev Hindi') && (
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Keyboard Layout</label>
            <select 
              disabled={isActive}
              value={settings.layout}
              onChange={(e) => handleUpdate('layout', e.target.value)}
              className="w-full p-3 bg-slate-50 border-transparent rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="Kruti Dev 010">Kruti Dev 010</option>
              <option value="Remington GAIL">Remington GAIL</option>
              <option value="Inscript">Mangal Inscript</option>
            </select>
          </div>
        )}


        {/* Highlight Mode */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Highlighting Style</label>
          <select 
            disabled={isActive}
            value={settings.highlightMode}
            onChange={(e) => handleUpdate('highlightMode', e.target.value)}
            className="w-full p-3 bg-slate-50 border-transparent rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <option value="word">Word Highlight</option>
            <option value="word_error">Error Highlighting</option>
            <option value="letter">Letter-by-Letter</option>
            <option value="none">No Highlighting</option>
          </select>
        </div>

        {/* Text Position */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Display Layout</label>
          <div className="flex flex-col gap-2">
            <button 
              disabled={isActive}
              onClick={() => handleUpdate('textPosition', 'top')}
              className={`p-3 rounded-xl text-xs font-bold transition-all ${settings.textPosition === 'top' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-600'}`}
            >
              Master Text Top
            </button>
            <button 
              disabled={isActive}
              onClick={() => handleUpdate('textPosition', 'side')}
              className={`p-3 rounded-xl text-xs font-bold transition-all ${settings.textPosition === 'side' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-600'}`}
            >
              Side-by-Side
            </button>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Auto Scroll</span>
          <input 
            type="checkbox" 
            disabled={isActive}
            checked={settings.autoScroll}
            onChange={(e) => handleUpdate('autoScroll', e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
};
