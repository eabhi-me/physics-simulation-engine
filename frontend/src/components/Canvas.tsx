import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MiniMap,
  useStore,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { OpticalComponent } from '../types/optical';
import { getComponentColor } from '../utils/helpers';
import OpticalNode from './OpticalNode';
import { Settings } from 'lucide-react';
import SettingsDrawer from './SettingsDrawer';
import Sidebar from './Sidebar';
import PropertiesPanel from './PropertiesPanel';

interface CanvasProps {
  components: OpticalComponent[];
  selectedId: string | null;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (id: string, updates: Partial<OpticalComponent>) => void;
  rays: any[];
  // Settings panel props
  settings: any;
  onSettingsChange: (s: any) => void;
  onRunSimulation: () => void;
  onExportSetup: () => void;
  onImportSetup: (file: File) => void;
  simulationResult: any;
  isSimulating: boolean;
  // Mobile overlays
  onAddComponent: (type: any, displayName?: string) => void;
  onDeleteComponent: (id: string) => void;
  selectedComponent: OpticalComponent | null;
}

const nodeTypes = {
  optical: OpticalNode,
};

const Canvas: React.FC<CanvasProps> = ({
  components,
  selectedId,
  onSelectComponent,
  onUpdateComponent,
  rays,
  settings,
  onSettingsChange,
  onRunSimulation,
  onExportSetup,
  onImportSetup,
  simulationResult,
  isSimulating,
  onAddComponent,
  onDeleteComponent,
  selectedComponent,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPropsOpen, setIsPropsOpen] = useState(false);
  // React Flow viewport transform: [translateX, translateY, zoom]
  const transform = useStore((s: any) => s.transform);
  const tx = transform?.[0] ?? 0;
  const ty = transform?.[1] ?? 0;
  const zoom = transform?.[2] ?? 1;
  // Convert components to React Flow nodes
  const initialNodes: Node[] = components.map((comp) => ({
    id: comp.id,
    type: 'optical',
    position: comp.position,
    data: {
      component: comp,
      isSelected: comp.id === selectedId,
    },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState([]);

  // Update nodes when components change
  useEffect(() => {
    const newNodes: Node[] = components.map((comp) => ({
      id: comp.id,
      type: 'optical',
      position: comp.position,
      data: {
        component: comp,
        isSelected: comp.id === selectedId,
      },
    }));
    setNodes(newNodes);
  }, [components, selectedId, setNodes]);

  // Handle node drag
  const onNodeDragStop = useCallback(
    (_event: any, node: Node) => {
      onUpdateComponent(node.id, {
        position: node.position,
      });
    },
    [onUpdateComponent]
  );

  // Handle node click
  const onNodeClick = useCallback(
    (_event: any, node: Node) => {
      onSelectComponent(node.id);
    },
    [onSelectComponent]
  );

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    onSelectComponent(null);
  }, [onSelectComponent]);

  // ---- Enhanced visualization helpers ----
  const spectralColors = ['#8B00FF','#0000FF','#00FF00','#FFFF00','#FFA500','#FF0000'];

  const prisms = useMemo(() =>
    components.filter((c) => (c.displayName || '').toLowerCase() === 'prism'),
    [components]
  );

  const distancePointToSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0) param = dot / len_sq;
    let xx, yy;
    if (param < 0) { xx = x1; yy = y1; }
    else if (param > 1) { xx = x2; yy = y2; }
    else { xx = x1 + param * C; yy = y1 + param * D; }
    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  type Poly = { id: string; points: {x:number;y:number}[]; color: string; opacity: number; width: number };

  const dispersionPolys: Poly[] = useMemo(() => {
    if (!rays || rays.length === 0 || prisms.length === 0) return [];
    const out: Poly[] = [];
    const threshold = 24; // px closeness to consider an interaction
    rays.forEach((ray: any) => {
      const pts = ray.points as {x:number;y:number}[];
      for (let i = 0; i < pts.length - 1; i++) {
        const p1 = pts[i];
        const p2 = pts[i+1];
        const dirX = p2.x - p1.x;
        const dirY = p2.y - p1.y;
        const segLen = Math.hypot(dirX, dirY) || 1;
        const ux = dirX / segLen;
        const uy = dirY / segLen;

        for (const prism of prisms) {
          const d = distancePointToSegment(prism.position.x, prism.position.y, p1.x, p1.y, p2.x, p2.y);
          if (d <= threshold) {
            // Create a small fan with larger deflection for shorter wavelengths
            const deflectBase = 0.18; // radians ~ 10 deg max
            const n = spectralColors.length;
            for (let k = 0; k < n; k++) {
              const t = (n - 1 - k) / (n - 1); // violet..red
              const angle = (t * 0.5 + 0.5) * deflectBase; // violet more deflection
              // Rotate direction by angle
              const cosA = Math.cos(angle);
              const sinA = Math.sin(angle);
              const rx = ux * cosA - uy * sinA;
              const ry = ux * sinA + uy * cosA;
              const L = 240; // length of dispersion rays
              const start = { x: prism.position.x, y: prism.position.y };
              const end = { x: start.x + rx * L, y: start.y + ry * L };
              out.push({
                id: `disp-${ray.id}-${i}-${k}`,
                points: [start, end],
                color: spectralColors[k],
                opacity: 0.85,
                width: 2,
              });
            }
          }
        }
      }
    });
    return out;
  }, [rays, prisms]);

  const sourceHalos = useMemo(() => {
    const srcs = components.filter((c) => c.type === 'source');
    return srcs.map((s) => ({ x: s.position.x, y: s.position.y }));
  }, [components]);

  return (
    <div className="flex-1 relative bg-gray-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-950"
      >
        <Background color="#333" gap={20} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const comp = node.data?.component as OpticalComponent;
            return comp ? getComponentColor(comp.type) : '#666';
          }}
          className="bg-gray-800"
        />
      </ReactFlow>

      {/* Floating buttons (mobile) */}
      <button
        className="absolute top-4 left-4 z-20 p-2 rounded-full bg-gray-800 border border-gray-700 shadow hover:bg-gray-700 md:hidden"
        title="Open components"
        onClick={() => setIsSidebarOpen(true)}
      >
        {/* Use settings icon flipped as generic menu; could swap for a hamburger if desired */}
        <Settings className="w-5 h-5 text-white" />
      </button>

      {/* Floating settings button */}
      <button
        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-gray-800 border border-gray-700 shadow hover:bg-gray-700"
        title="Open settings"
        onClick={() => setIsSettingsOpen(true)}
      >
        <Settings className="w-5 h-5 text-white" />
      </button>

      <button
        className="absolute top-4 right-14 z-20 p-2 rounded-full bg-gray-800 border border-gray-700 shadow hover:bg-gray-700 md:hidden"
        title="Open properties"
        onClick={() => setIsPropsOpen(true)}
      >
        <Settings className="w-5 h-5 text-white" />
      </button>

      {/* Render light rays and effects */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
        <defs>
          <filter id="rayGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Apply the same viewport transform as React Flow so coordinates align under pan/zoom */}
        <g transform={`translate(${tx}, ${ty}) scale(${zoom})`}>
          {/* Source halos */}
          {sourceHalos.map((s, idx) => (
            <circle key={`halo-${idx}`} cx={s.x} cy={s.y} r={12} fill="#ffffff" opacity={0.12} filter="url(#rayGlow)" />
          ))}

          {/* Base rays with glow */}
          {rays.map((ray: any) => (
            <g key={ray.id}>
              {/* soft outer */}
              <polyline
                points={ray.points.map((p: any) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={ray.color}
                strokeWidth={4}
                opacity={(ray.intensity / 100) * 0.25}
                strokeLinecap="round"
                filter="url(#rayGlow)"
              />
              {/* crisp core */}
              <polyline
                points={ray.points.map((p: any) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={ray.color}
                strokeWidth={2}
                opacity={Math.min(1, (ray.intensity / 100) * 0.95)}
                strokeLinecap="round"
              />
            </g>
          ))}

          {/* Dispersion rays near prisms */}
          {dispersionPolys.map((p) => (
            <polyline
              key={p.id}
              points={p.points.map((pt) => `${pt.x},${pt.y}`).join(' ')}
              fill="none"
              stroke={p.color}
              strokeWidth={p.width}
              opacity={p.opacity}
              strokeLinecap="round"
              filter="url(#rayGlow)"
            />
          ))}
        </g>
      </svg>

      {/* Settings drawer overlay */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={onSettingsChange}
        onRunSimulation={onRunSimulation}
        onExportSetup={onExportSetup}
        onImportSetup={onImportSetup}
        simulationResult={simulationResult}
        isSimulating={isSimulating}
      />

      {/* Sidebar overlay (mobile) */}
      {isSidebarOpen && (
        <div className="absolute inset-0 z-40 pointer-events-none md:hidden">
          <div className="absolute top-0 left-0 h-full w-72 bg-gray-900 border-r border-gray-700 shadow-2xl pointer-events-auto z-50">
            <Sidebar onAddComponent={(t: any, name?: string) => { onAddComponent(t, name); setIsSidebarOpen(false); }} forceVisible className="w-72" />
          </div>
          <button className="absolute inset-0 bg-black/20 pointer-events-auto z-40" aria-label="Close components overlay" onClick={() => setIsSidebarOpen(false)} />
        </div>
      )}

      {/* Properties overlay (mobile) */}
      {isPropsOpen && (
        <div className="absolute inset-0 z-40 pointer-events-none md:hidden">
          <div className="absolute top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-700 shadow-2xl pointer-events-auto z-50">
            <PropertiesPanel
              selectedComponent={selectedComponent}
              onUpdateComponent={onUpdateComponent}
              onDeleteComponent={(id: string) => { onDeleteComponent(id); setIsPropsOpen(false); }}
              onRunSimulation={onRunSimulation}
              simulationResult={simulationResult}
              isSimulating={isSimulating}
              forceVisible
              className="w-80"
            />
          </div>
          <button className="absolute inset-0 bg-black/20 pointer-events-auto z-40" aria-label="Close properties overlay" onClick={() => setIsPropsOpen(false)} />
        </div>
      )}
    </div>
  );
};

export default Canvas;
