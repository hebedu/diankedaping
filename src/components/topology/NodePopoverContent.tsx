import React from 'react';
import { useStore } from '../../store/useStore';
import { X, Server, LayoutTemplate, Edit3, Trash2 } from 'lucide-react';

export const NodePopoverContent = ({ 
  type, 
  id,
  compact = false
}: { 
  type: 'node' | 'region', 
  id: string,
  compact?: boolean
}) => {
  const { 
    clearSelection, 
    nodes, 
    regions,
    setViewMode,
    isPreview,
    setNodeModalOpen,
    setRegionModalOpen,
    removeNode,
    removeRegion,
    availableDevices,
    availableSubTopologies
  } = useStore();

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearSelection();
  };

  if (type === 'node') {
    const node = nodes.find(n => n.id === id);
    if (!node) return null;

    const subTopology = availableSubTopologies.find(t => t.id === node.relatedTopologyId);
    const deviceCount = subTopology?.devices?.length || 0;

    // 极致精简版 - 仅展示名称和关联情况
    return (
      <div className="w-[200px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col">
          <h3 className="font-black text-slate-800 text-sm tracking-tight truncate">{node.name}</h3>

        </div>

        <div className="pt-2 border-t border-slate-100/60">
          <div className="text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-wider">关联情况</div>
          <div className="text-[12px] font-black text-slate-700">
            {subTopology ? `包含 ${deviceCount} 个设备` : '无关联子拓扑'}
          </div>
        </div>

        {!isPreview && !compact && (
          <div className="pt-3 border-t border-slate-100/60 flex items-center space-x-2">
            <button 
              onClick={(e) => { e.stopPropagation(); setNodeModalOpen(true, node); }}
              className="flex-1 flex items-center justify-center space-x-1 py-1.5 bg-primary text-white rounded-lg text-[10px] font-black shadow-md shadow-primary/20 active:scale-95 transition-all"
            >
              <Edit3 className="w-3 h-3" />
              <span>编辑</span>
            </button>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                if (window.confirm(`确定要删除 ${node.name} 吗？`)) {
                  removeNode(node.id);
                  handleClose(e);
                }
              }}
              className="px-2 py-1.5 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-lg transition-all"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  }

  if (type === 'region') {
    const region = regions.find(r => r.id === id);
    if (!region) return null;
    const nodeCount = nodes.filter(n => n.regionId === region.id).length;

    return (
      <div className="w-[200px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col">
          <h3 className="font-black text-slate-800 text-sm tracking-tight truncate">{region.name}</h3>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">区域名称</div>
        </div>
        
        <div className="pt-2 border-t border-slate-100/60">
          <div className="text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-wider">资源统计</div>
          <div className="text-[12px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100/50">
            {nodeCount} 个拓扑节点
          </div>
        </div>

        {!isPreview && (
          <div className="pt-3 border-t border-slate-100/60 flex items-center space-x-2">
            <button 
              onClick={(e) => { e.stopPropagation(); setRegionModalOpen(true, region); }}
              className="flex-1 flex items-center justify-center space-x-1 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[10px] font-black hover:bg-slate-50 active:scale-95 transition-all"
            >
              <Edit3 className="w-3 h-3" />
              <span>编辑</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
};
