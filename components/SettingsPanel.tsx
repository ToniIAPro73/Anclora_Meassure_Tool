
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-3xl border border-slate-200 shadow-[0_15px_40px_rgba(0,0,0,0.2)] rounded-2xl px-4 py-2 z-50 flex items-center gap-4 w-max animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-2">
        <div className="bg-slate-100 p-1.5 rounded-lg text-slate-500">
          <Settings2 size={16} />
        </div>
      </div>

      {/* Unit Selection */}
      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
          <RulerIcon size={10} /> Units
        </label>
        <div className="flex bg-slate-100 p-0.5 rounded-lg shadow-sm">
          {Object.values(Unit).map(u => (
            <button
              key={u}
              onClick={() => updateConfig({ unit: u })}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
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

      <div className="h-8 w-[1px] bg-slate-100" />

      {/* Zoom Control */}
      <div className="flex flex-col gap-1 w-24">
        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tight flex items-center justify-between">
          <div className="flex items-center gap-1"><Search size={10} /> Zoom</div>
          <span className="text-amber-700 font-mono">{Math.round(config.zoom * 100)}%</span>
        </label>
        <input 
          type="range"
          min="0.5"
          max="4"
          step="0.1"
          value={config.zoom}
          onChange={(e) => updateConfig({ zoom: parseFloat(e.target.value) })}
          className="w-full accent-amber-800 h-1 bg-slate-200 rounded-full appearance-none cursor-pointer"
        />
      </div>

      {/* DPI Calibration */}
      <div className="flex flex-col gap-1 w-20">
        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tight flex items-center justify-between">
          <span>DPI</span>
          <span className="text-amber-700 font-mono">{config.dpi}</span>
        </label>
        <input 
          type="range"
          min="72"
          max="200"
          value={config.dpi}
          onChange={(e) => updateConfig({ dpi: parseInt(e.target.value) })}
          className="w-full accent-amber-800 h-1 bg-slate-200 rounded-full appearance-none cursor-pointer"
        />
      </div>

      {/* Ruler Length */}
      <div className="flex flex-col gap-1 w-24">
        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tight flex items-center justify-between">
          <span>Length</span>
          <span className="text-amber-700 font-mono">{config.length}</span>
        </label>
        <input 
          type="range"
          min="200"
          max="2000"
          step="50"
          value={config.length}
          onChange={(e) => updateConfig({ length: parseInt(e.target.value) })}
          className="w-full accent-amber-800 h-1 bg-slate-200 rounded-full appearance-none cursor-pointer"
        />
      </div>

      <div className="h-8 w-[1px] bg-slate-100" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button 
          onClick={toggleOrientation}
          className="p-2 bg-amber-50 rounded-xl text-amber-800 hover:bg-amber-100 transition-colors shadow-sm"
          title="Rotate 90°"
        >
          <RotateCw size={18} className="transition-transform duration-500" style={{ transform: `rotate(${config.rotation}deg)` }} />
        </button>

        {isElectron && (
          <button 
            onClick={quitApp}
            className="p-2 bg-red-50 rounded-xl text-red-600 hover:bg-red-100 transition-colors shadow-sm"
            title="Quit Application"
          >
            <Power size={18} />
          </button>
        )}
      </div>
    </div>
  );
};
