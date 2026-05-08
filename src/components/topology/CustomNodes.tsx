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
  'firewall': <Shield className="w-5 h-5" />,
  'router': <Network className="w-5 h-5" />,
  'switch': <SwitchCamera className="w-5 h-5" />,
  'server': <Server className="w-5 h-5" />,
  'terminal': <Monitor className="w-5 h-5" />,
  'middleware': <Layers className="w-5 h-5" />,
  'database': <Database className="w-5 h-5" />,
  'gateway': <Globe className="w-5 h-5" />,
  'cloud': <Cloud className="w-5 h-5" />,
  'subTopology': <LayoutTemplate className="w-5 h-5" />,
  'group': <LayoutTemplate className="w-5 h-5" />,
};

export const RegionNode = React.memo(({ data, selected }: { data: Region; selected: boolean }) => {
  const allNodes = useStore((state) => state.nodes);
  const updateRegion = useStore((state) => state.updateRegion);
  const removeRegion = useStore((state) => state.removeRegion);
  const setRegionModalOpen = useStore((state) => state.setRegionModalOpen);
  const isPreview = useStore((state) => state.isPreview);
  const isPreviewMode = useStore((state) => state.isPreviewMode);
  const setHelperLines = useStore((state) => state.setHelperLines);
  const reactFlowInstance = useReactFlow();
  
  const regionNodes = React.useMemo(() => allNodes.filter(n => n.regionId === data.id), [allNodes, data.id]);

  const themeMap: Record<string, { bg: string, border: string, text: string, pillar: string }> = {
    'security': { bg: 'bg-blue-50/20', border: 'border-blue-400/60', text: 'text-blue-600', pillar: 'bg-blue-500' },
    'compute': { bg: 'bg-emerald-50/20', border: 'border-emerald-400/60', text: 'text-emerald-600', pillar: 'bg-emerald-500' },
    'data': { bg: 'bg-amber-50/20', border: 'border-amber-400/60', text: 'text-amber-600', pillar: 'bg-amber-500' },
    'ops': { bg: 'bg-purple-50/20', border: 'border-purple-400/60', text: 'text-purple-600', pillar: 'bg-purple-500' },
    'external': { bg: 'bg-green-50/20', border: 'border-green-400/60', text: 'text-green-600', pillar: 'bg-green-500' },
    'cyan': { bg: 'bg-cyan-50/20', border: 'border-cyan-400/60', text: 'text-cyan-600', pillar: 'bg-cyan-500' },
    'rose': { bg: 'bg-rose-50/20', border: 'border-rose-400/60', text: 'text-rose-600', pillar: 'bg-rose-500' },
    'slate': { bg: 'bg-slate-50/20', border: 'border-slate-400/60', text: 'text-slate-600', pillar: 'bg-slate-500' },
  };
  const theme = themeMap[data.type] || themeMap['compute'];

  return (
    <div 
      className={`relative w-full h-full rounded-[24px] border-2 border-dashed transition-all group ${theme.bg} ${theme.border} ${
        selected ? 'shadow-lg z-10 !border-solid !border-primary ring-4 ring-primary/10' : 'hover:border-primary/40'
      }`}
    >
      {/* 方案：悬浮式标题 (Floating Title Outside) */}
      <div className="absolute top-[-34px] left-0 flex items-center justify-between w-full pr-2 animate-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-black tracking-tight ${theme.text} uppercase`}>{data.name}</span>
        </div>

        {!isPreview && !isPreviewMode && (
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-primary shadow-sm active:scale-90"
              onClick={(e) => { e.stopPropagation(); setRegionModalOpen(true, data); }}
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button 
              className="p-1.5 hover:bg-rose-500 hover:text-white rounded-lg transition-all text-slate-400 shadow-sm active:scale-90"
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
        )}
      </div>

      {!isPreview && !isPreviewMode && (
        <NodeResizer 
          color="#3B82F6" 
          isVisible={selected} 
          minWidth={200} 
          minHeight={150}
          handleClassName="custom-resizer-handle"
          lineClassName="custom-resizer-line"
          onResizeStart={() => useStore.getState().setResizing(true)}
          onResize={(_, params) => {
            const allReactFlowNodes = reactFlowInstance.getNodes();
            const snapResult = getSmartSnapPos({ id: data.id, position: { x: params.x, y: params.y }, width: params.width, height: params.height, type: 'region' } as any, allReactFlowNodes, 'resize', params.direction);
            setHelperLines(snapResult.helperLines);
            if (snapResult.helperLines.length > 0) {
              reactFlowInstance.setNodes(nds => nds.map(n => n.id === data.id ? { ...n, position: { x: snapResult.x, y: snapResult.y }, style: { ...n.style, width: snapResult.width, height: snapResult.height } } : n));
            }
          }}
          onResizeEnd={() => {
            setHelperLines([]);
            useStore.getState().setResizing(false);
            const node = reactFlowInstance.getNode(data.id);
            if (node) updateRegion(data.id, { position: { x: Math.round(node.position.x), y: Math.round(node.position.y) }, width: Math.round(node.width || 0), height: Math.round(node.height || 0) });
          }}
        />
      )}
      <div className="flex-1 w-full h-full pointer-events-none"></div>
    </div>
  );
});

export const UnifiedNode = React.memo(({ data, selected, dragging }: { data: TopologyNode; selected: boolean, dragging: boolean }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const isConnectionMode = useStore(s => s.isConnectionMode);
  const isConnectingLine = useStore(s => s.isConnectingLine);
  const isPreview = useStore(s => s.isPreview);
  const isPreviewMode = useStore(s => s.isPreviewMode);
  const isResizing = useStore(s => s.isResizing);

  const handleClass = `!w-2 !h-2 !bg-white !border-[2px] !border-primary transition-all duration-200 ${
    (selected || isConnectionMode || isHovered || isConnectingLine) && !isResizing 
      ? 'opacity-100 scale-100 !pointer-events-auto' 
      : 'opacity-0 scale-50 pointer-events-none'
  } hover:!scale-150 hover:!bg-primary hover:!border-white`;

  return (
    <div 
      className={`relative flex flex-col items-center justify-center w-[80px] group transition-all ${
        selected ? 'z-50 scale-105' : 'z-10'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 图标核心区 - 所有的连线锚点都在这里 */}
      <div className={`relative w-16 h-16 flex items-center justify-center rounded-2xl transition-all duration-300 ${
        selected ? 'bg-white shadow-lg ring-2 ring-primary border-primary' : 'bg-white/40 backdrop-blur-[2px] border border-slate-200/40 hover:border-primary/40 shadow-sm'
      }`}>
        {/* Handles 聚焦在图标周围 */}
        <Handle type="target" position={FlowPosition.Left} className={`${handleClass} !-left-1`} id="left-t" />
        <Handle type="target" position={FlowPosition.Right} className={`${handleClass} !-right-1`} id="right-t" />
        <Handle type="target" position={FlowPosition.Top} className={`${handleClass} !-top-1`} id="top-t" />
        <Handle type="target" position={FlowPosition.Bottom} className={`${handleClass} !-bottom-1`} id="bottom-t" />
        <Handle type="source" position={FlowPosition.Left} className={`${handleClass} !-left-1`} id="left-s" />
        <Handle type="source" position={FlowPosition.Right} className={`${handleClass} !-right-1`} id="right-s" />
        <Handle type="source" position={FlowPosition.Top} className={`${handleClass} !-top-1`} id="top-s" />
        <Handle type="source" position={FlowPosition.Bottom} className={`${handleClass} !-bottom-1`} id="bottom-s" />

        {/* 全局连接触发区 */}
        <Handle 
          type="target" 
          position={FlowPosition.Top} 
          className={`!w-full !h-full !top-0 !left-0 !bg-transparent !border-none !opacity-0 ${isConnectingLine ? 'z-[40] !pointer-events-auto cursor-crosshair' : '!pointer-events-none'}`} 
          id="full-icon-target" 
        />

        <div className="text-primary transition-all group-hover:scale-110">
          {React.cloneElement((iconMap[data.iconType] || iconMap['server']) as React.ReactElement<any>, { strokeWidth: 1.5, className: 'w-10 h-10' })}
        </div>

        {/* 连线时的靶心 */}
        {isConnectingLine && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <div className="w-6 h-6 border border-primary/10 rounded-full animate-pulse" />
          </div>
        )}
      </div>

      {!isPreview && !isPreviewMode && (
        <NodeToolbar isVisible={isHovered && !selected && !dragging && !isConnectionMode && !isConnectingLine && !isResizing} position={Position.Right} offset={10}>
          <NodePopoverContent type="node" id={data.id} compact={true} />
        </NodeToolbar>
      )}
      
      {/* 悬浮文字区 */}
      <div className="mt-1.5 w-full text-center px-0.5">
        <div className={`text-[9px] font-bold leading-tight truncate transition-colors ${selected ? 'text-primary' : 'text-slate-500'}`} title={data.name}>
          {data.name}
        </div>
      </div>
    </div>
  );
});
