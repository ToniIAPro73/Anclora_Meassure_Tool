
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { RulerConfig, Position, Unit } from '../types';

interface RulerProps {
  config: RulerConfig;
  position: Position;
  setPosition: (pos: Position) => void;
  setConfig: React.Dispatch<React.SetStateAction<RulerConfig>>;
}

export const Ruler: React.FC<RulerProps> = ({ config, position, setPosition, setConfig }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const dragStart = useRef<Position>({ x: 0, y: 0 });
  const rotateStart = useRef<number>(0);
  const rotateStartAngle = useRef<number>(0);
  const rulerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.rotate-handle')) return;
    
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRotating(true);
    
    // Calculate angle from ruler origin to mouse
    const dx = e.clientX - position.x;
    const dy = e.clientY - position.y;
    rotateStartAngle.current = Math.atan2(dy, dx) * (180 / Math.PI);
    rotateStart.current = config.rotation;
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    } else if (isRotating) {
      const dx = e.clientX - position.x;
      const dy = e.clientY - position.y;
      const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
      const angleDiff = currentAngle - rotateStartAngle.current;
      
      setConfig(prev => ({
        ...prev,
        rotation: (rotateStart.current + angleDiff) % 360
      }));
    }
  }, [isDragging, isRotating, position, setConfig, setPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsRotating(false);
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.min(Math.max(config.zoom + delta, 0.5), 4.0);
    setConfig(prev => ({ ...prev, zoom: Number(newZoom.toFixed(1)) }));
  };

  useEffect(() => {
    if (isDragging || isRotating) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isRotating, handleMouseMove, handleMouseUp]);

  const getPixelsPerUnit = () => {
    switch (config.unit) {
      case Unit.PIXELS: return 1;
      case Unit.INCHES: return config.dpi;
      case Unit.CM: return config.dpi / 2.54;
      case Unit.MM: return config.dpi / 25.4;
      default: return 1;
    }
  };

  const ppu = getPixelsPerUnit();
  const tickFrequency = (() => {
    if (config.unit === Unit.PIXELS) return 10;
    if (config.unit === Unit.MM) return 1;
    if (config.unit === Unit.CM) return 0.1;
    if (config.unit === Unit.INCHES) return 0.125;
    return 1;
  })();

  const totalUnits = config.length / ppu;
  const ticks = [];
  
  for (let i = 0; i <= totalUnits; i += tickFrequency) {
    const pxPos = i * ppu;
    if (pxPos > config.length) break;

    let heightClass = "h-2";
    let showLabel = false;

    if (config.unit === Unit.PIXELS) {
      if (i % 100 === 0) { heightClass = "h-5"; showLabel = true; }
      else if (i % 50 === 0) { heightClass = "h-3"; }
    } else if (config.unit === Unit.INCHES) {
      if (Math.abs(i - Math.round(i)) < 0.001) { heightClass = "h-6"; showLabel = true; }
      else if (Math.abs(i % 0.5) < 0.001) { heightClass = "h-4"; }
      else if (Math.abs(i % 0.25) < 0.001) { heightClass = "h-3"; }
    } else {
      const mmValue = Math.round(i * (config.unit === Unit.CM ? 10 : 1));
      if (mmValue % 10 === 0) { heightClass = "h-6"; showLabel = true; }
      else if (mmValue % 5 === 0) { heightClass = "h-4"; }
    }

    ticks.push({
      pos: pxPos,
      heightClass,
      label: showLabel ? Math.round(i * 100) / 100 : null
    });
  }

  return (
    <div
      ref={rulerRef}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      className={`fixed cursor-grab active:cursor-grabbing z-40 wood-texture border-2 border-[#5d2e0c] rounded-sm select-none
        ${isDragging || isRotating ? 'shadow-2xl' : 'shadow-xl'}
        flex flex-row
      `}
      style={{
        left: position.x,
        top: position.y,
        width: `${config.length}px`,
        height: '80px',
        transform: `scale(${config.zoom}) rotate(${config.rotation}deg)`,
        transformOrigin: '0 0', // Set rotation origin at the zero mark
        transition: isDragging || isRotating ? 'none' : 'transform 0.2s ease-out, shadow 0.2s ease-out',
      }}
    >
      {/* Zero Mark Knob (Position Reference) */}
      <div 
        className="absolute z-50 rounded-full border border-black/30 shadow-sm flex items-center justify-center pointer-events-none"
        style={{
          width: '12px',
          height: '12px',
          backgroundColor: '#b8860b',
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.5)',
          top: '-6px',
          left: '-6px'
        }}
      >
        <div className="w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_2px_rgba(255,0,0,0.8)]" />
      </div>

      {/* Rotation Handle (Knob in the corner) */}
      <div 
        onMouseDown={handleRotateStart}
        className="rotate-handle absolute bottom-1 right-1 w-6 h-6 rounded-md z-50 flex items-center justify-center"
        title="Drag to rotate ruler"
      />

      {/* Decorative center wood grain highlight */}
      <div className="absolute pointer-events-none opacity-20 bg-gradient-to-b from-white/10 to-transparent w-full h-1/2 top-0" />
      
      {/* Ruler Markings */}
      <div className="relative w-full h-full">
        {ticks.map((tick, idx) => (
          <div
            key={idx}
            className={`absolute tick-mark ${tick.heightClass} w-[1px] top-0`}
            style={{ left: `${tick.pos}px` }}
          >
            {tick.label !== null && (
              <span className="absolute text-[11px] tick-label font-serif top-7 -translate-x-1/2">
                {tick.label}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Unit label */}
      <div className="absolute font-bold text-black/40 italic font-serif pointer-events-none bottom-2 right-10 text-sm">
        {config.unit.toUpperCase()} {config.zoom !== 1 ? `(${Math.round(config.zoom * 100)}%)` : ''}
      </div>

      {/* Branding */}
      <div className="absolute opacity-10 pointer-events-none font-serif brand-text top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl uppercase tracking-widest">
        Craftsman
      </div>
    </div>
  );
};
