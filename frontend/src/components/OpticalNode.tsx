import { Handle, Position } from 'reactflow';
import { OpticalComponent } from '../types/optical';
import { getComponentColor, getComponentIcon } from '../utils/helpers';

interface OpticalNodeProps {
  data: {
    component: OpticalComponent;
    isSelected: boolean;
  };
}

const OpticalNode: React.FC<OpticalNodeProps> = ({ data }) => {
  const { component, isSelected } = data;
  const color = getComponentColor(component.type);
  const icon = getComponentIcon(component.type);

  return (
    <div
      className={`px-3 py-2 rounded-lg shadow-lg border-2 transition-all ${
        isSelected ? 'border-blue-500' : 'border-gray-600'
      }`}
      style={{
        backgroundColor: '#1a1a1a',
        transform: `rotate(${component.rotation}deg)`,
        minWidth: '90px',
      }}
    >
      <Handle type="target" position={Position.Left} />
      
      <div className="flex flex-col items-center gap-2">
        <div
          className="text-xl flex items-center justify-center w-8 h-8 rounded-full"
          style={{ backgroundColor: color + '20', border: `2px solid ${color}` }}
        >
          {icon}
        </div>
        <div className="text-white text-xs font-medium capitalize text-center">
          {component.displayName || component.type}
        </div>
        <div className="text-gray-400 text-[10px]">
          {component.rotation}°
        </div>
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default OpticalNode;
