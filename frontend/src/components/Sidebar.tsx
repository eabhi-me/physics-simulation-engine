import { ComponentType } from '../types/optical';
import { getComponentColor } from '../utils/helpers';
import { Lightbulb, FlipHorizontal, Focus, Radio, Square, Aperture, Filter } from 'lucide-react';

interface SidebarProps {
  onAddComponent: (type: ComponentType, displayName?: string) => void;
  forceVisible?: boolean;
  className?: string;
}

// Map requested items to base simulation types; most share a generic Square icon to avoid missing icons
const componentTypes: { base: ComponentType; label: string; icon: any }[] = [
  // Base items
  { base: 'lens', label: 'Lens', icon: Focus },
  { base: 'mirror', label: 'Mirror', icon: FlipHorizontal },
  // Optical elements
  { base: 'mirror', label: 'Beam Splitter', icon: Square },
  { base: 'lens', label: 'Prism', icon: Square },
  { base: 'lens', label: 'Aperture', icon: Aperture },
  { base: 'lens', label: 'Optical Fiber', icon: Square },
  { base: 'lens', label: 'Diffraction Grating', icon: Square },
  { base: 'lens', label: 'Optical Filter', icon: Filter },
  { base: 'lens', label: 'Lens Array', icon: Focus },
  { base: 'polarizer' as unknown as ComponentType, label: 'Polarizer', icon: Square },
  { base: 'polarizer' as unknown as ComponentType, label: 'Analyzer', icon: Square },
  { base: 'polarizer' as unknown as ComponentType, label: 'Wave Plate', icon: Square },
  { base: 'lens', label: 'Modulator', icon: Square },
  // Sources
  { base: 'source', label: 'Laser Diode', icon: Lightbulb },
  { base: 'source', label: 'LED Source', icon: Lightbulb },
  { base: 'source', label: 'Point Source', icon: Lightbulb },
  { base: 'source', label: 'Collimated Source', icon: Lightbulb },
  // Detectors
  { base: 'detector', label: 'Photodiode', icon: Radio },
  { base: 'detector', label: 'CCD Sensor', icon: Radio },
  { base: 'detector', label: 'Spectrometer', icon: Radio },
  { base: 'detector', label: 'Power Meter', icon: Radio },
  // Systems (treated as lenses for now)
  { base: 'lens', label: 'Microscope', icon: Focus },
  { base: 'lens', label: 'Telescope', icon: Focus },
  { base: 'mirror', label: 'Interferometer', icon: Square },
  { base: 'mirror', label: 'Optical Cavity', icon: Square },
];

const Sidebar: React.FC<SidebarProps> = ({ onAddComponent, forceVisible = false, className }) => {
  return (
    <div className={`${forceVisible ? '' : 'hidden md:block'} ${className ?? 'w-56'} bg-gray-900 border-r border-gray-700 p-3 overflow-y-auto`}>
      <h2 className="text-lg font-semibold mb-3 text-white">Components</h2>
      <div className="space-y-2">
        {componentTypes.map(({ base, label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => onAddComponent(base, label)}
            className="w-full flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-left"
            style={{ borderLeft: `4px solid ${getComponentColor(base)}` }}
          >
            <Icon className="w-4 h-4" style={{ color: getComponentColor(base) }} />
            <span className="text-white text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
      
      <div className="mt-5 pt-5 border-t border-gray-700">
        <h3 className="text-xs font-semibold mb-2 text-gray-400">Instructions</h3>
        <ul className="text-xs text-gray-400 space-y-2">
          <li>• Click to add components</li>
          <li>• Drag to move</li>
          <li>• Select to edit properties</li>
          <li>• Use rotation handle to rotate</li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
