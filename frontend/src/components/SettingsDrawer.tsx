import React from 'react';
import { X, Settings, Play, Upload, Download } from 'lucide-react';
import { SimulationResult, SimulationSettings } from '../types/optical';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SimulationSettings;
  onSettingsChange: (s: SimulationSettings) => void;
  onRunSimulation: () => void;
  onExportSetup: () => void;
  onImportSetup: (file: File) => void;
  simulationResult: SimulationResult | null;
  isSimulating: boolean;
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  onRunSimulation,
  onExportSetup,
  onImportSetup,
  simulationResult,
  isSimulating,
}) => {
  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImportSetup(file);
  };

  return (
    <div className="absolute inset-0 z-40 pointer-events-none">
      {/* Right-side panel */}
      <div className="absolute top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-700 shadow-2xl pointer-events-auto flex flex-col z-50">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-300" />
            <h3 className="text-sm font-semibold text-white">Simulation Settings</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-800">
            <X className="w-4 h-4 text-gray-300" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Frequency settings */}
          <div className="bg-gray-800 rounded-lg p-3 space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Start (THz)</label>
              <input
                type="number"
                value={settings.freqStart}
                onChange={(e) => onSettingsChange({ ...settings, freqStart: parseFloat(e.target.value) })}
                className="w-full px-2 py-1.5 bg-gray-900 border border-gray-700 rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Stop (THz)</label>
              <input
                type="number"
                value={settings.freqStop}
                onChange={(e) => onSettingsChange({ ...settings, freqStop: parseFloat(e.target.value) })}
                className="w-full px-2 py-1.5 bg-gray-900 border border-gray-700 rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Points</label>
              <input
                type="number"
                value={settings.freqPoints}
                onChange={(e) => onSettingsChange({ ...settings, freqPoints: parseInt(e.target.value, 10) })}
                className="w-full px-2 py-1.5 bg-gray-900 border border-gray-700 rounded text-white text-sm"
              />
            </div>
            <button
              onClick={onRunSimulation}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded"
              disabled={isSimulating}
            >
              <Play className="w-4 h-4" />
              {isSimulating ? 'Simulating...' : 'Run Simulation'}
            </button>
          </div>

          {/* Import / Export */}
          <div className="bg-gray-800 rounded-lg p-3 space-y-2">
            <button onClick={onExportSetup} className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 rounded">
              <Download className="w-4 h-4" />
              Export Setup
            </button>
            <label className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 rounded cursor-pointer">
              <Upload className="w-4 h-4" />
              Import Setup
              <input type="file" accept="application/json" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          {/* Results overview */}
          {simulationResult && (
            <div className="bg-gray-800 rounded-lg p-3 space-y-2">
              <h4 className="text-xs font-semibold text-gray-300">Results</h4>
              <div className="text-xs text-gray-400">Rays: <span className="text-white">{simulationResult.rays.length}</span></div>
              <div className="text-xs text-gray-400">Paths: <span className="text-white">{simulationResult.pathLengths.length}</span></div>
              <div className="text-xs text-gray-400">Sweep points: <span className="text-white">{simulationResult.frequencySweep.length}</span></div>
            </div>
          )}
        </div>
      </div>

      {/* Click-catcher to close when clicking outside panel */}
      <button
        className="absolute inset-0 bg-black/20 pointer-events-auto z-40"
        aria-label="Close settings overlay"
        onClick={onClose}
      />
    </div>
  );
};

export default SettingsDrawer;
