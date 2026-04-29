import React from 'react';
import { Handle, Position as FlowPosition, NodeToolbar, Position, NodeResizer, useReactFlow } from 'reactflow';
import { 
  Server, Shield, SwitchCamera, LayoutTemplate, Network, Trash2, Edit3, 
  Monitor, Layers, Database, Globe, Cloud,
  Info
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { TopologyNode, Region, IconType } from '../../types';
import { NodePopoverContent } from './NodePopoverContent';
import { getSmartSnapPos } from '../../utils/snapHelper';

const iconMap: Record<IconType, React.ReactNode> = {
  'firewall': <Shield className="w-6 h-6" />,
  'router': <Network className="w-6 h-6" />,
  'switch': <SwitchCamera className="w-6 h-6" />,
  'server': <Server className="w-6 h-6" />,
  'terminal': <Monitor className="w-6 h-6" />,
  'middleware': <Layers className="w-6 h-6" />,
  'database': <Database className="w-6 h-6" />,
  'gateway': <Globe className="w-6 h-6" />,
  'cloud': <Cloud className="w-5 h-5" />,
  'subTopology': <LayoutTemplate className="w-5 h-5" />,
  'group': <LayoutTemplate className="w-6 h-6" />,
};

export const RegionNode = ({ data, selected }: { data: Region; selected: boolean }) => {
  const allNodes = useStore((state) => state.nodes);
  const updateRegion = useStore((state) => state.updateRegion);
  const removeRegion = useStore((state) => state.removeRegion);
  const setRegionModalOpen = useStore((state) => state.setRegionModalOpen);
  const isPreview = useStore((state) => state.isPreview);
  const setHelperLines = useStore((state) => state.setHelperLines);
  const reactFlowInstance = useReactFlow();
  
  const regionNodes = allNodes.filter(n => n.regionId === data.id);

  const themeMap: Record<string, { bg: string, border: string, text: string, solidBg: string }> = {
    'security': { bg: 'bg-blue-50/30', border: 'border-blue-400', text: 'text-blue-700', solidBg: 'bg-blue-100' },
    'compute': { bg: 'bg-emerald-50/30', border: 'border-emerald-400', text: 'text-emerald-700', solidBg: 'bg-emerald-100' },
    'data': { bg: 'bg-amber-50/30', border: 'border-amber-400', text: 'text-amber-700', solidBg: 'bg-amber-100' },
    'ops': { bg: 'bg-purple-50/30', border: 'border-purple-400', text: 'text-purple-700', solidBg: 'bg-purple-100' },
    'external': { bg: 'bg-green-50/30', border: 'border-green-400', text: 'text-green-700', solidBg: 'bg-green-100' },
    'cyan': { bg: 'bg-cyan-50/30', border: 'border-cyan-400', text: 'text-cyan-700', solidBg: 'bg-cyan-100' },
    'rose': { bg: 'bg-rose-50/30', border: 'border-rose-400', text: 'text-rose-700', solidBg: 'bg-rose-100' },
    'slate': { bg: 'bg-slate-50/30', border: 'border-slate-400', text: 'text-slate-700', solidBg: 'bg-slate-100' },
  };
  const theme = themeMap[data.type] || themeMap['compute'];

  return (
    <>
      <div 
        className={`relative rounded-3xl border-[1.5px] border-solid transition-all group flex flex-col overflow-hidden ${theme.bg} ${theme.border} ${
          selected ? 'shadow-[0_0_20px_rgba(59,130,246,0.4)] border-2 !border-primary scale-[1.01]' : 'hover:border-primary/50'
        }`}
        style={{ width: '100%', height: '100%' }}
      >
        {!isPreview && (
          <NodeResizer 
            color="#3B82F6" 
            isVisible={selected} 
            minWidth={250} 
            minHeight={200}
            handleStyle={{ 
              width: 14, 
              height: 14, 
              backgroundColor: '#fff', 
              border: '2.5px solid #3B82F6',
              borderRadius: '6px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}
            lineStyle={{
              borderWidth: 2,
              borderStyle: 'solid',
              borderColor: '#3B82F6',
              opacity: 0.6
            }}
            onResize={(_, params) => {
              const allReactFlowNodes = reactFlowInstance.getNodes();
              const nodeToSnap = {
                id: data.id,
                position: { x: params.x, y: params.y },
                width: params.width,
                height: params.height,
                type: 'region'
              } as any;
              
              const snapResult = getSmartSnapPos(nodeToSnap, allReactFlowNodes, 'resize');
              setHelperLines(snapResult.helperLines);

              if (snapResult.helperLines.length > 0) {
                reactFlowInstance.setNodes((nodes) =>
                  nodes.map((n) => {
                    if (n.id === data.id) {
                      return { 
                        ...n, 
                        position: { x: snapResult.x, y: snapResult.y },
                        style: { ...n.style, width: snapResult.width, height: snapResult.height }
                      };
                    }
                    return n;
                  })
                );
              }
            }}
            onResizeEnd={(_, { x, y, width, height }) => {
              setHelperLines([]);
              updateRegion(data.id, { position: { x, y }, width, height });
            }}
          />
        )}

        <div className={`w-full px-5 py-4 flex flex-col border-b border-black/5 shrink-0 ${theme.solidBg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className={`p-1.5 rounded-lg bg-white/40 shadow-sm ${theme.text}`}>
                <LayoutTemplate className="w-4 h-4" />
              </div>
              <span className={`text-base font-black tracking-tight ${theme.text}`}>{data.name}</span>
            </div>
            
            <div className="flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                className="w-7 h-7 bg-white/60 hover:bg-white rounded-lg flex items-center justify-center transition-all text-slate-500 hover:text-primary shadow-sm hover:shadow-md"
                title="编辑区域"
                onClick={(e) => { e.stopPropagation(); setRegionModalOpen(true, data); }}
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button 
                className="w-7 h-7 bg-white/60 hover:bg-rose-500 hover:text-white rounded-lg flex items-center justify-center transition-all text-slate-500 shadow-sm hover:shadow-md"
                title="删除区域"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (regionNodes.length > 0) {
                    alert('当前区域内存在节点，请先迁移或删除区域内对象。');
                    return;
                  }
                  if (window.confirm(`确定要删除区域 ${data.name} 吗？`)) {
                    removeRegion(data.id);
                  }
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 w-full h-full pointer-events-none"></div>
      </div>
    </>
  );
};

// ==========================================
// 统一节点组件 (Unified Node)
// ==========================================
export const UnifiedNode = ({ data, selected, dragging }: { data: TopologyNode; selected: boolean, dragging: boolean }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const { isConnectionMode, isConnectingLine, setViewMode, isPreview, availableDevices, availableSubTopologies } = useStore();
  
  const handleClass = `!w-2.5 !h-2.5 !bg-white !border-[2px] !border-primary transition-opacity duration-200 ${
    (selected || isConnectionMode || isHovered || isConnectingLine) ? 'opacity-100 !pointer-events-auto' : 'opacity-0 pointer-events-none'
  }`;

  const isSubTopology = data.relationType === 'subTopology';
  const isDevice = data.relationType === 'device';

  // Get associated devices details
  const nodeDevices = React.useMemo(() => {
    if (!isDevice || !data.relatedDeviceIds) return [];
    return availableDevices.filter(d => data.relatedDeviceIds?.includes(d.id));
  }, [isDevice, data.relatedDeviceIds, availableDevices]);


  const subTopologyName = React.useMemo(() => {
    if (!isSubTopology || !data.relatedTopologyId) return '未知子拓扑';
    return availableSubTopologies.find(t => t.id === data.relatedTopologyId)?.name || '未知子拓扑';
  }, [isSubTopology, data.relatedTopologyId, availableSubTopologies]);

  return (
    <div 
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isPreview && (
        <NodeToolbar isVisible={isHovered && !selected && !dragging && !isConnectionMode && !isConnectingLine} position={Position.Right} offset={15}>
          <NodePopoverContent type="node" id={data.id} compact={true} />
        </NodeToolbar>
      )}
      
      <div 
        className={`bg-white rounded-2xl border-2 border-slate-100 flex flex-col items-center justify-center p-4 w-32 transition-all relative ${
          selected ? 'shadow-[0_0_25px_rgba(59,130,246,0.3)] ring-4 ring-primary/10 border-primary scale-105 z-50' : 
          'hover:border-primary/40 shadow-lg shadow-slate-200/50'
        }`}
        onDoubleClick={() => {
          if (isSubTopology && data.relatedTopologyId) {
            setViewMode('sub', data.relatedTopologyId);
          }
        }}
      >
        {/* Handles */}
        <Handle type="source" position={FlowPosition.Left} className={`${handleClass} !-left-1.5`} id="left-s" />
        <Handle type="source" position={FlowPosition.Right} className={`${handleClass} !-right-1.5`} id="right-s" />
        <Handle type="source" position={FlowPosition.Top} className={`${handleClass} !-top-1.5`} id="top-s" />
        <Handle type="source" position={FlowPosition.Bottom} className={`${handleClass} !-bottom-1.5`} id="bottom-s" />
        
        <Handle type="target" position={FlowPosition.Left} className={`${handleClass} !-left-1.5 opacity-0`} id="left-t" />
        <Handle type="target" position={FlowPosition.Right} className={`${handleClass} !-right-1.5 opacity-0`} id="right-t" />
        <Handle type="target" position={FlowPosition.Top} className={`${handleClass} !-top-1.5 opacity-0`} id="top-t" />
        <Handle type="target" position={FlowPosition.Bottom} className={`${handleClass} !-bottom-1.5 opacity-0`} id="bottom-t" />
        
        <Handle 
          type="target" 
          position={FlowPosition.Top} 
          className={`!w-full !h-full !top-0 !left-0 !bg-transparent !border-none !rounded-2xl transition-all ${isConnectingLine ? 'z-[100] !pointer-events-auto cursor-crosshair' : '!pointer-events-none'}`} 
          id="node-card-target" 
        />


        {/* Icon Area */}
        <div className={`relative w-14 h-14 flex items-center justify-center rounded-2xl bg-blue-50/50 text-primary mb-3 shadow-inner`}>
          {React.cloneElement((iconMap[data.iconType] || iconMap['server']) as React.ReactElement<any>, { strokeWidth: 1.5 })}
        </div>
        
        {/* Text Area */}
        <div className="flex flex-col items-center w-full text-center px-1">
          <div className="text-xs font-bold text-slate-800 truncate w-full" title={data.name}>
            {data.name}
          </div>
          <div className="text-[10px] font-semibold text-slate-400 mt-1 truncate w-full font-mono uppercase tracking-tight">
            {isSubTopology ? `子拓扑: ${subTopologyName}` : (nodeDevices.length > 1 ? `${nodeDevices.length} 个设备` : (nodeDevices[0]?.ip || '未关联设备'))}
          </div>
        </div>
      </div>
    </div>
  );
};
