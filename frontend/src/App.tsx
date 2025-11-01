import { useState, useCallback } from 'react';
import { ReactFlowProvider } from 'reactflow';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import { OpticalComponent, ComponentType, SimulationSettings, SimulationResult } from './types/optical';
import { generateId, getDefaultProperties, downloadJSON } from './utils/helpers';
import { simulateOpticalSetup } from './utils/api';

function App() {
  const [components, setComponents] = useState<OpticalComponent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [simulationSettings, setSimulationSettings] = useState<SimulationSettings>({ freqStart: 400, freqStop: 700, freqPoints: 10 });
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleAddComponent = useCallback((type: ComponentType, displayName?: string) => {
    const newComponent = { id: generateId(type), type, position: { x: 200, y: 200 }, rotation: 0, properties: getDefaultProperties(type), displayName } as OpticalComponent;
    setComponents((prev) => [...prev, newComponent]);
  }, []);

  const handleUpdateComponent = useCallback((id: string, updates: Partial<OpticalComponent>) => {
    setComponents((prev) =>
      prev.map((comp) => (comp.id === id ? ({ ...comp, ...(updates as any) } as OpticalComponent) : comp))
    );
  }, []);

  const handleDeleteComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((comp) => comp.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const handleRunSimulation = useCallback(async () => {
    if (components.length === 0) { alert('Please add some components first!'); return; }
    setIsSimulating(true);
    try {
      const result = await simulateOpticalSetup({
        components,
        simulationSettings,
      });
      setSimulationResult(result);
    } catch (error) {
      console.error('Simulation error:', error);
      alert('Simulation failed. Make sure the backend server is running.');
    } finally {
      setIsSimulating(false);
    }
  }, [components, simulationSettings]);

  const handleExportSetup = useCallback(() => {
    downloadJSON({ components, simulationSettings }, 'optical-setup.json');
  }, [components, simulationSettings]);

  const handleImportSetup = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const setup = JSON.parse(content);
  if (setup.components && Array.isArray(setup.components)) setComponents(setup.components);
  const importedSettings = setup.simulationSettings || setup.settings;
  if (importedSettings) setSimulationSettings(importedSettings);
        setSimulationResult(null);
        setSelectedId(null);
      } catch (error) {
        alert('Failed to import setup. Invalid file format.');
      }
    };
    reader.readAsText(file);
  }, []);

  const selectedComponent = components.find((c) => c.id === selectedId) || null;

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
  <header className="bg-gray-900 border-b border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Optical Setup Designer</h1>
            <p className="text-sm text-gray-400">Design and simulate optical systems</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">Components: <span className="text-white font-medium">{components.length}</span></div>
          </div>
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        <ReactFlowProvider>
          <Sidebar onAddComponent={handleAddComponent} />
          <Canvas
            components={components}
            selectedId={selectedId}
            onSelectComponent={setSelectedId}
            onUpdateComponent={handleUpdateComponent}
            rays={simulationResult?.rays || []}
            settings={simulationSettings}
            onSettingsChange={setSimulationSettings}
            onRunSimulation={handleRunSimulation}
            onExportSetup={handleExportSetup}
            onImportSetup={handleImportSetup}
            simulationResult={simulationResult}
            isSimulating={isSimulating}
            onAddComponent={handleAddComponent}
            onDeleteComponent={handleDeleteComponent}
            selectedComponent={selectedComponent}
          />
          <PropertiesPanel
            selectedComponent={selectedComponent}
            onUpdateComponent={handleUpdateComponent}
            onDeleteComponent={handleDeleteComponent}
            onRunSimulation={handleRunSimulation}
            simulationResult={simulationResult}
            isSimulating={isSimulating}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
}

export default App;
