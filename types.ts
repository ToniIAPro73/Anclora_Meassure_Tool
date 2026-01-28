
export enum Unit {
  PIXELS = 'px',
  INCHES = 'in',
  CM = 'cm',
  MM = 'mm'
}

export interface RulerConfig {
  unit: Unit;
  dpi: number;
  orientation: 'horizontal' | 'vertical';
  length: number; // in pixels
  zoom: number;   // multiplier
  rotation: number; // in degrees
}

export interface Position {
  x: number;
  y: number;
}
