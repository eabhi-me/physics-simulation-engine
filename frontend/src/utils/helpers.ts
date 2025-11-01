import { ComponentType, Position } from '../types/optical';

// Generate unique IDs for components
export const generateId = (type: ComponentType): string => {
  return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Convert degrees to radians
export const degToRad = (degrees: number): number => {
  return degrees * Math.PI / 180;
};

// Convert radians to degrees
export const radToDeg = (radians: number): number => {
  return radians * 180 / Math.PI;
};

// Calculate distance between two points
export const distance = (p1: Position, p2: Position): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

// Get default properties for a component type
export const getDefaultProperties = (type: ComponentType): any => {
  switch (type) {
    case 'source':
      return {
        angle: 0,
        wavelength: 632.8, // Red laser (He-Ne)
        intensity: 100
      };
    case 'mirror':
      return {
        reflectivity: 95,
        width: 50
      };
    case 'lens':
      return {
        focalLength: 100,
        diameter: 50,
        refractiveIndex: 1.5
      };
    case 'detector':
      return {
        sensitivity: 90,
        width: 50
      };
    default:
      return {};
  }
};

// Export optical setup as JSON file
export const downloadJSON = (data: any, filename: string = 'optical-setup.json'): void => {
  try {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });

    // IE/Edge legacy support
    // @ts-ignore
    if (typeof window.navigator !== 'undefined' && window.navigator.msSaveOrOpenBlob) {
      // @ts-ignore
      window.navigator.msSaveOrOpenBlob(blob, filename);
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';

    // Some browsers need the link in the DOM
    document.body.appendChild(link);
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    document.body.removeChild(link);

    // Revoke after a tick to ensure download has started
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    console.error('Failed to export JSON:', err);
    alert('Failed to export setup. See console for details.');
  }
};

// Get component color based on type
export const getComponentColor = (type: ComponentType): string => {
  switch (type) {
    case 'source':
      return '#ef4444'; // red
    case 'mirror':
      return '#3b82f6'; // blue
    case 'lens':
      return '#10b981'; // green
    case 'detector':
      return '#f59e0b'; // amber
    default:
      return '#6b7280'; // gray
  }
};

// Get component icon
export const getComponentIcon = (type: ComponentType): string => {
  switch (type) {
    case 'source':
      return '💡';
    case 'mirror':
      return '🪞';
    case 'lens':
      return '🔍';
    case 'detector':
      return '📡';
    default:
      return '❓';
  }
};
