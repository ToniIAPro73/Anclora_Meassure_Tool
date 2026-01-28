
import React, { useState, useEffect } from 'react';
import { Ruler } from './components/Ruler';
import { SettingsPanel } from './components/SettingsPanel';
import { Unit, RulerConfig, Position } from './types';
import { Move, Layers, Info } from 'lucide-react';

const App: React.FC = () => {
  const [config, setConfig] = useState<RulerConfig>({
    unit: Unit.PIXELS,
    dpi: 96, // Standard screen DPI
    orientation: 'horizontal',
    length: 800,
    zoom: 1.0,
    rotation: 0
  });

  const [position, setPosition] = useState<Position>({ x: 100, y: 200 });
  const [showInfo, setShowInfo] = useState(false);

  // Background visual to demonstrate measurement
  const MockLayout = () => (
    <div className="fixed inset-0 bg-slate-100 flex items-center justify-center -z-10 select-none">
      <div className="grid grid-cols-12 gap-4 w-full h-full p-8 opacity-20 pointer-events-none">
        {Array.from({ length: 48 }).map((_, i) => (
          <div key={i} className="border border-slate-400 rounded h-32 flex items-center justify-center">
            <span className="text-xs">{i + 1}</span>
          </div>
        ))}
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] border-4 border-dashed border-slate-300 flex flex-col items-center justify-center p-8 bg-white shadow-sm rounded-xl">
        <div className="w-24 h-24 bg-slate-200 rounded-full mb-4 animate-pulse" />
        <h1 className="text-2xl font-serif text-slate-400">Measure This Area</h1>
        <p className="text-slate-400 text-center mt-2 italic">Drag the vintage ruler over this box to check its dimensions.</p>
      </div>
    </div>
  );

  const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
  const isElectron = typeof window !== 'undefined' && (window as any).process && (window as any).process.type === 'renderer';
  const isGlobalApp = isExtension || isElectron;

  useEffect(() => {
    if (isElectron) {
      const { ipcRenderer } = (window as any).require('electron');
      
      const handleMouseMove = (e: MouseEvent) => {
        // If we are touching a UI element (ruler, panel, etc.), don't ignore mouse
        // If we are touching the transparent background, ignore mouse to allow clicks through
        const isOverUI = e.target !== document.documentElement && e.target !== document.body && (e.target as HTMLElement).id !== 'root-container';
        ipcRenderer.send('set-ignore-mouse-events', !isOverUI, { forward: true });
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isElectron]);

  return (
    <div id="root-container" className={`relative overflow-hidden ${isGlobalApp ? 'bg-transparent' : 'min-h-screen bg-slate-50'}`}>
      {!isGlobalApp && <MockLayout />}

      <header className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-50 pointer-events-none">
        <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-slate-200 pointer-events-auto flex items-center gap-3">
          <div className="bg-amber-800 p-1.5 rounded-lg text-white">
            <Layers size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800">Vintage Ruler</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Pro Measuring Tool</p>
          </div>
        </div>

        <button 
          onClick={() => setShowInfo(!showInfo)}
          className="bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg border border-slate-200 pointer-events-auto hover:bg-white transition-colors text-slate-600"
        >
          <Info size={20} />
        </button>
      </header>

      {showInfo && (
        <div className="fixed top-16 right-4 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-5 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="font-bold text-slate-800 mb-2">How to use</h2>
          <ul className="text-sm text-slate-600 space-y-2">
            <li>• Drag the ruler body to move it.</li>
            <li>• <b>Scroll over the ruler</b> to zoom in/out.</li>
            <li>• Use the panel to change units and zoom.</li>
            <li>• Adjust DPI for physical accuracy.</li>
            <li>• Toggle orientation (H/V).</li>
          </ul>
        </div>
      )}

      <SettingsPanel config={config} setConfig={setConfig} />

      <Ruler 
        config={config} 
        position={position} 
        setPosition={setPosition} 
        setConfig={setConfig}
      />

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-medium pointer-events-none">
        Digital Craftsmanship &bull; Est. 2024
      </div>
    </div>
  );
};

export default App;
