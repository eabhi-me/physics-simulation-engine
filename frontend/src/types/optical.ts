// Type definitions for optical components

export type ComponentType = 'source' | 'mirror' | 'lens' | 'detector';

export interface Position {
  x: number;
  y: number;
}

export interface BaseComponent {
  id: string;
  type: ComponentType;
  position: Position;
  rotation: number; // in degrees
  // Optional human-friendly label for specific variants (e.g., "Beam Splitter")
  displayName?: string;
}

export interface SourceProperties {
  angle: number; // angle of incidence in degrees
  wavelength: number; // in nanometers
  intensity: number; // 0-100
}

export interface MirrorProperties {
  reflectivity: number; // 0-100 percentage
  width: number; // in arbitrary units
}

export interface LensProperties {
  focalLength: number; // in arbitrary units
  diameter: number;
  refractiveIndex: number;
}

export interface DetectorProperties {
  sensitivity: number; // 0-100
  width: number;
}

export interface SourceComponent extends BaseComponent {
  type: 'source';
  properties: SourceProperties;
}

export interface MirrorComponent extends BaseComponent {
  type: 'mirror';
  properties: MirrorProperties;
}

export interface LensComponent extends BaseComponent {
  type: 'lens';
  properties: LensProperties;
}

export interface DetectorComponent extends BaseComponent {
  type: 'detector';
  properties: DetectorProperties;
}

export type OpticalComponent = 
  | SourceComponent 
  | MirrorComponent 
  | LensComponent 
  | DetectorComponent;

export interface SimulationSettings {
  freqStart: number; // Start frequency in THz
  freqStop: number; // Stop frequency in THz
  freqPoints: number; // Number of points in sweep
}

export interface OpticalSetup {
  components: OpticalComponent[];
  simulationSettings: SimulationSettings;
}

export interface Ray {
  id: string;
  points: Position[];
  color: string;
  intensity: number;
}

export interface SimulationResult {
  rays: Ray[];
  pathLengths: {
    componentId: string;
    length: number;
  }[];
  frequencySweep: {
    frequency: number;
    transmission: number;
  }[];
}
