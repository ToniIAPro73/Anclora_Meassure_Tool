
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { RulerConfig, Position, Unit } from '../types';

interface RulerProps {
  config: RulerConfig;
  position: Position;
  setPosition: (pos: Position) => void;
}

export const Ruler: React.FC<RulerProps> = ({ config, position, setPosition }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<Position>({ x: 0, y: 0 });
  const rulerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    }
  }, [isDragging, setPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
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
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Calculate pixel values for markings
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
  const isHorizontal = config.orientation === 'horizontal';

  // Determine tick intervals
  const getTickFrequency = () => {
    if (config.unit === Unit.PIXELS) return 10;
    if (config.unit === Unit.MM) return 1;
    if (config.unit === Unit.CM) return 0.1; // 1mm
    if (config.unit === Unit.INCHES) return 0.125; // 1/8 inch
    return 1;
  };

  const tickFrequency = getTickFrequency();
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
      // CM/MM
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
      className={`fixed transition-shadow cursor-grab active:cursor-grabbing z-40 wood-texture border-2 border-[#5d2e0c] rounded-sm select-none
        ${isDragging ? 'shadow-2xl scale-[1.01]' : 'shadow-xl'}
        ${isHorizontal ? 'h-20 flex-row' : 'w-20 flex-col'}
      `}
      style={{
        left: position.x,
        top: position.y,
        width: isHorizontal ? `${config.length}px` : '80px',
        height: isHorizontal ? '80px' : `${config.length}px`,
      }}
    >
      {/* Decorative center wood grain highlight */}
      <div className={`absolute pointer-events-none opacity-20 bg-gradient-to-b from-white/10 to-transparent ${isHorizontal ? 'w-full h-1/2 top-0' : 'w-1/2 h-full left-0'}`} />
      
      {/* Ruler Markings */}
      <div className="relative w-full h-full">
        {ticks.map((tick, idx) => (
          <div
            key={idx}
            className={`absolute bg-black/80 ${tick.heightClass} ${isHorizontal ? 'w-[1px] top-0' : 'h-[1px] left-0'}`}
            style={{
              [isHorizontal ? 'left' : 'top']: `${tick.pos}px`
            }}
          >
            {tick.label !== null && (
              <span 
                className={`absolute text-[10px] font-bold text-black/70 font-serif
                  ${isHorizontal ? 'top-6 -translate-x-1/2' : 'left-8 -translate-y-1/2'}
                `}
              >
                {tick.label}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Unit label */}
      <div className={`absolute font-bold text-black/40 italic font-serif pointer-events-none
        ${isHorizontal ? 'bottom-2 right-4 text-sm' : 'bottom-4 left-1/2 -translate-x-1/2 text-xs text-center'}
      `}>
        {config.unit.toUpperCase()}
      </div>

      {/* Subtle branding burn-in */}
      <div className={`absolute opacity-10 pointer-events-none font-serif
        ${isHorizontal ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 text-2xl'}
      `}>
        CRAFTSMAN
      </div>
    </div>
  );
};
