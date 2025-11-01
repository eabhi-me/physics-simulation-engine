import { useState } from 'react';
import { SimulationSettings, SimulationResult } from '../types/optical';
import { Play, Download, Upload } from 'lucide-react';

interface SimulationPanelProps {
  settings: SimulationSettings;
  onSettingsChange: (settings: SimulationSettings) => void;
  onRunSimulation: () => void;
  onExportSetup: () => void;
  onImportSetup: (file: File) => void;
  simulationResult: SimulationResult | null;
  isSimulating: boolean;
}

const SimulationPanel: React.FC<SimulationPanelProps> = ({
  settings,
  onSettingsChange,
  onRunSimulation,
  onExportSetup,
  onImportSetup,
  simulationResult,
  isSimulating,
}) => {
  const [showResults, setShowResults] = useState(false);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportSetup(file);
    }
  };

  return (
    <div className="bg-gray-900 border-t border-gray-700 p-2">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Simulation Settings */}
          <div className="bg-gray-800 rounded-lg p-3">
            <h3 className="text-base font-semibold text-white mb-2">Frequency Sweep</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Start Frequency (THz)
                </label>
                <input
                  type="number"
                  value={settings.freqStart}
                  onChange={(e) =>
                    onSettingsChange({
                      ...settings,
                      freqStart: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Stop Frequency (THz)
                </label>
                <input
                  type="number"
                  value={settings.freqStop}
                  onChange={(e) =>
                    onSettingsChange({
                      ...settings,
                      freqStop: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Number of Points
                </label>
                <input
                  type="number"
                  value={settings.freqPoints}
                  onChange={(e) =>
                    onSettingsChange({
                      ...settings,
                      freqPoints: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-800 rounded-lg p-3">
            <h3 className="text-base font-semibold text-white mb-2">Actions</h3>
            <div className="space-y-2">
              <button
                onClick={onRunSimulation}
                disabled={isSimulating}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors text-sm"
              >
                <Play className="w-4 h-4" />
                {isSimulating ? 'Simulating...' : 'Run Simulation'}
              </button>
              
              <button
                onClick={onExportSetup}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Download JSON
              </button>

              <label className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors cursor-pointer text-sm">
                <Upload className="w-4 h-4" />
                Upload JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Results Summary */}
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-semibold text-white">Results</h3>
              {simulationResult && (
                <button
                  onClick={() => setShowResults(!showResults)}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  {showResults ? 'Hide' : 'Show'}
                </button>
              )}
            </div>
            
            {simulationResult ? (
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-gray-400">Rays traced:</span>
                  <span className="text-white ml-2 font-medium">
                    {simulationResult.rays.length}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">Path segments:</span>
                  <span className="text-white ml-2 font-medium">
                    {simulationResult.pathLengths.length}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">Frequency points:</span>
                  <span className="text-white ml-2 font-medium">
                    {simulationResult.frequencySweep.length}
                  </span>
                </div>

                {showResults && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <h4 className="text-sm font-semibold text-white mb-2">Path Lengths</h4>
                    <div className="max-h-28 overflow-y-auto space-y-1">
                      {simulationResult.pathLengths.map((pl, idx) => (
                        <div key={idx} className="text-xs text-gray-300">
                          {pl.componentId}: {pl.length.toFixed(2)} units
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                Run simulation to see results
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationPanel;
