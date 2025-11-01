import { OpticalComponent, SimulationResult } from '../types/optical';
import { Trash2, Play } from 'lucide-react';

interface PropertiesPanelProps {
  selectedComponent: OpticalComponent | null;
  onUpdateComponent: (id: string, updates: Partial<OpticalComponent>) => void;
  onDeleteComponent: (id: string) => void;
  onRunSimulation: () => void;
  simulationResult: SimulationResult | null;
  isSimulating: boolean;
  forceVisible?: boolean;
  className?: string;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedComponent,
  onUpdateComponent,
  onDeleteComponent,
  onRunSimulation,
  simulationResult,
  isSimulating,
  forceVisible = false,
  className,
}) => {

  const handlePropertyChange = (key: string, value: any) => {
    if (!selectedComponent) return;
    onUpdateComponent(
      selectedComponent.id,
      {
        properties: {
          ...selectedComponent.properties,
          [key]: value,
        },
      } as Partial<OpticalComponent>
    );
  };

  const handleRotationChange = (rotation: number) => {
    if (!selectedComponent) return;
    onUpdateComponent(selectedComponent.id, { rotation });
  };

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    if (!selectedComponent) return;
    onUpdateComponent(selectedComponent.id, {
      position: {
        ...selectedComponent.position,
        [axis]: value,
      },
    });
  };

  return (
    <div className={`${forceVisible ? '' : 'hidden md:flex'} ${className ?? 'w-64'} bg-gray-900 border-l border-gray-700 p-3 flex flex-col`}>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-white">Properties</h2>
        {selectedComponent && (
          <button
            onClick={() => onDeleteComponent(selectedComponent.id)}
            className="p-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
            title="Delete component"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {!selectedComponent && (
          <p className="text-gray-400 text-xs">Select a component to edit its properties</p>
        )}
        {selectedComponent && (
          <>
        {/* Component Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
          <div className="px-3 py-2 bg-gray-800 rounded-lg text-white capitalize">
            {selectedComponent.displayName || selectedComponent.type}
          </div>
        </div>

        {/* Position */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-2">Position</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">X</label>
              <input
                type="number"
                value={Math.round(selectedComponent.position.x)}
                onChange={(e) => handlePositionChange('x', parseFloat(e.target.value))}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Y</label>
              <input
                type="number"
                value={Math.round(selectedComponent.position.y)}
                onChange={(e) => handlePositionChange('y', parseFloat(e.target.value))}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Rotation */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Rotation: {selectedComponent.rotation}°
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={selectedComponent.rotation}
            onChange={(e) => handleRotationChange(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Component-specific properties */}
        {selectedComponent.type === 'source' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Angle of Incidence: {selectedComponent.properties.angle}°
              </label>
              <input
                type="range"
                min="-90"
                max="90"
                value={selectedComponent.properties.angle}
                onChange={(e) => handlePropertyChange('angle', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Wavelength (nm)
              </label>
              <input
                type="number"
                value={selectedComponent.properties.wavelength}
                onChange={(e) => handlePropertyChange('wavelength', parseFloat(e.target.value))}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Intensity: {selectedComponent.properties.intensity}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedComponent.properties.intensity}
                onChange={(e) => handlePropertyChange('intensity', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </>
        )}

        {selectedComponent.type === 'mirror' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Reflectivity: {selectedComponent.properties.reflectivity}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedComponent.properties.reflectivity}
                onChange={(e) => handlePropertyChange('reflectivity', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Width</label>
              <input
                type="number"
                value={selectedComponent.properties.width}
                onChange={(e) => handlePropertyChange('width', parseFloat(e.target.value))}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </>
        )}

        {selectedComponent.type === 'lens' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Focal Length
              </label>
              <input
                type="number"
                value={selectedComponent.properties.focalLength}
                onChange={(e) => handlePropertyChange('focalLength', parseFloat(e.target.value))}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Diameter</label>
              <input
                type="number"
                value={selectedComponent.properties.diameter}
                onChange={(e) => handlePropertyChange('diameter', parseFloat(e.target.value))}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Refractive Index
              </label>
              <input
                type="number"
                step="0.1"
                value={selectedComponent.properties.refractiveIndex}
                onChange={(e) => handlePropertyChange('refractiveIndex', parseFloat(e.target.value))}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </>
        )}

        {selectedComponent.type === 'detector' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Sensitivity: {selectedComponent.properties.sensitivity}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedComponent.properties.sensitivity}
                onChange={(e) => handlePropertyChange('sensitivity', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Width</label>
              <input
                type="number"
                value={selectedComponent.properties.width}
                onChange={(e) => handlePropertyChange('width', parseFloat(e.target.value))}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </>
        )}
          </>
        )}
      </div>

      {/* Footer: Run button + results summary */}
      <div className="pt-3 border-t border-gray-700">
        <div className="flex justify-end">
          <button
            onClick={onRunSimulation}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded"
            disabled={isSimulating}
            title="Run simulation"
          >
            <Play className="w-4 h-4" />
            {isSimulating ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>
        {simulationResult && (
          <div className="mt-2 text-xs text-gray-300 space-y-1">
            <div>Rays: <span className="text-white">{simulationResult.rays.length}</span></div>
            <div>Paths: <span className="text-white">{simulationResult.pathLengths.length}</span></div>
            <div>Sweep points: <span className="text-white">{simulationResult.frequencySweep.length}</span></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;
