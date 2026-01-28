
import React from 'react';
import { Unit, RulerConfig } from '../types';
import { Settings2, RotateCw, Ruler as RulerIcon, Monitor, Maximize2, Search, RotateCcw, Power } from 'lucide-react';

interface SettingsPanelProps {
  config: RulerConfig;
  setConfig: React.Dispatch<React.SetStateAction<RulerConfig>>;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ config, setConfig }) => {
  const isElectron = typeof window !== 'undefined' && (window as any).process && (window as any).process.type === 'renderer';

  const quitApp = () => {
    if (isElectron) {
      const { ipcRenderer } = (window as any).require('electron');
      ipcRenderer.send('quit-app');
    }
  };

  const updateConfig = (updates: Partial<RulerConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const toggleOrientation = () => {
    updateConfig({ 
      rotation: (config.rotation + 90) % 360
    });
  };

  const resetZoom = () => {
    updateConfig({ zoom: 1.0, rotation: 0 });
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-3xl p-4 z-50 flex flex-col md:flex-row items-center gap-6 min-w-[300px] md:min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3">
        <div className="bg-slate-100 p-2 rounded-xl text-slate-500">
          <Settings2 size={18} />
        </div>
        <div className="h-8 w-[1px] bg-slate-200 hidden md:block" />
      </div>

      {/* Unit Selection */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
          <RulerIcon size={12} /> Unit System
        </label>
        <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner-sm">
          {Object.values(Unit).map(u => (
            <button
              key={u}
              onClick={() => updateConfig({ unit: u })}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                config.unit === u 
                  ? 'bg-white text-amber-800 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {u.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Zoom Control */}
      <div className="flex flex-col gap-1.5 w-full md:w-36">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 justify-between">
          <div className="flex items-center gap-1"><Search size={12} /> Zoom</div>
          <div className="flex items-center gap-2">
            <span className="text-amber-700">{Math.round(config.zoom * 100)}%</span>
            <button 
              onClick={resetZoom}
              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-amber-800 transition-colors"
              title="Reset Zoom (100%)"
            >
              <RotateCcw size={10} />
            </button>
          </div>
        </label>
        <input 
          type="range"
          min="0.5"
          max="4"
          step="0.1"
          value={config.zoom}
          onChange={(e) => updateConfig({ zoom: parseFloat(e.target.value) })}
          className="w-full accent-amber-800 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* DPI Calibration */}
      <div className="flex flex-col gap-1.5 w-full md:w-32">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 justify-between">
          <div className="flex items-center gap-1"><Monitor size={12} /> DPI</div>
          <span className="text-amber-700">{config.dpi}</span>
        </label>
        <input 
          type="range"
          min="72"
          max="200"
          value={config.dpi}
          onChange={(e) => updateConfig({ dpi: parseInt(e.target.value) })}
          className="w-full accent-amber-800 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Ruler Length */}
      <div className="flex flex-col gap-1.5 w-full md:w-32">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 justify-between">
          <div className="flex items-center gap-1"><Maximize2 size={12} /> Length</div>
          <span className="text-amber-700">{config.length}</span>
        </label>
        <input 
          type="range"
          min="200"
          max="2000"
          step="50"
          value={config.length}
          onChange={(e) => updateConfig({ length: parseInt(e.target.value) })}
          className="w-full accent-amber-800 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Orientation Toggle */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleOrientation}
          className="flex flex-col items-center justify-center gap-1.5 group"
        >
          <div className="bg-amber-50 p-2.5 rounded-2xl text-amber-800 border border-amber-100 group-hover:bg-amber-100 transition-colors shadow-sm">
            <RotateCw size={20} className="transition-transform duration-500" style={{ transform: `rotate(${config.rotation}deg)` }} />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rotate</span>
        </button>

        {isElectron && (
          <button 
            onClick={quitApp}
            className="flex flex-col items-center justify-center gap-1.5 group"
          >
            <div className="bg-red-50 p-2.5 rounded-2xl text-red-600 border border-red-100 group-hover:bg-red-100 transition-colors shadow-sm">
              <Power size={20} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quit</span>
          </button>
        )}
      </div>
    </div>
  );
};
