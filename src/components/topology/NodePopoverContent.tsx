import React from 'react';
import { useStore } from '../../store/useStore';
import { X, Server, Shield, SwitchCamera, Network, Layers, LayoutTemplate, Monitor, Info, Database, Globe, Cloud } from 'lucide-react';
import type { TopologyNode, Region, IconType } from '../../types';

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
  'group': <LayoutTemplate className="w-5 h-5" />,
};

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

  const getStatusColor = (status?: string) => {
    switch (status) {
      case '正常': return 'bg-emerald-500';
      case '异常': return 'bg-rose-500';
      case '告警': return 'bg-amber-500';
      default: return 'bg-slate-400';
    }
  };

  if (type === 'node') {
    const node = nodes.find(n => n.id === id);
    if (!node) return null;
    const region = regions.find(r => r.id === node.regionId);

    const isDevice = node.relationType === 'device';
    const isSubTopology = node.relationType === 'subTopology';

    const nodeDevices = isDevice ? availableDevices.filter(d => node.relatedDeviceIds?.includes(d.id)) : [];
    const nodeStatus = isDevice && nodeDevices.length > 0 
      ? (nodeDevices.some(d => d.status === '异常') ? '异常' : (nodeDevices.some(d => d.status === '告警') ? '告警' : '正常'))
      : '正常';

    const subTopologyName = isSubTopology 
      ? availableSubTopologies.find(t => t.id === node.relatedTopologyId)?.name || '未知子拓扑'
      : '';

    // 配置模式下的轻量 Hover 浮层
    if (compact && !isPreview) {
      return (
        <div className="w-[240px] bg-white rounded-2xl shadow-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 truncate text-sm flex-1 mr-2">{node.name}</h3>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap ${getStatusColor(nodeStatus)}`}>
              {nodeStatus}
            </span>
          </div>

          <div className="space-y-2 text-[12px]">
            <div className="flex justify-between">
              <span className="text-slate-400">资源类型</span>
              <span className="text-slate-600 font-medium">{isDevice ? '物理设备' : '逻辑拓扑'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">关联详情</span>
              <span className="text-slate-600 font-medium truncate max-w-[120px]">
                {isDevice ? (nodeDevices.length > 1 ? `${nodeDevices.length} 个设备` : nodeDevices[0]?.name) : subTopologyName}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-50 flex items-center justify-center text-[11px] text-slate-400 font-medium">
            <Info className="w-3 h-3 mr-1" />
            点击查看详情
          </div>
        </div>
      );
    }

    // 预览模式或全量模式
    return (
      <div className={`${compact ? 'w-64 p-4' : 'w-[420px] p-6'} bg-white rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden relative`}>
        {!compact && (
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col space-y-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm ${compact ? 'hidden' : ''}`}>
                {iconMap[node.iconType] || <Server className="w-7 h-7 text-primary" />}
              </div>
              <div>
                <h3 className={`font-black text-slate-800 tracking-tight leading-tight ${compact ? 'text-sm' : 'text-xl'}`}>{node.name}</h3>
                <div className="flex items-center mt-1 space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(nodeStatus)}`}></span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{nodeStatus}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-4 pt-1">
            <div>
              <div className="text-[11px] text-slate-400 mb-1 font-medium uppercase tracking-wider">关联类型</div>
              <div className="text-[13px] font-bold text-slate-800">
                {isDevice ? '关联物理设备' : '关联逻辑子拓扑'}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 mb-1 font-medium uppercase tracking-wider">关联资源</div>
              <div className="text-[13px] font-bold text-slate-800">
                {isDevice ? (nodeDevices.length > 1 ? `${nodeDevices.length} 个设备` : (nodeDevices[0]?.name || '-')) : (subTopologyName || '-')}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 mb-1 font-medium uppercase tracking-wider">所属区域</div>
              <div className="text-[13px] font-bold text-slate-800 truncate" title={region?.name}>{region ? region.name : '自由放置'}</div>
            </div>
          </div>

          {!compact && (
            <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (window.confirm(`确定要删除节点 ${node.name} 吗？`)) {
                    removeNode(node.id);
                    handleClose(e);
                  }
                }}
                className="px-5 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-xl text-xs font-black transition-all"
              >删除</button>
              <button 
                onClick={(e) => { e.stopPropagation(); setNodeModalOpen(true, node); }}
                className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >编辑节点</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === 'region') {
    const region = regions.find(r => r.id === id);
    if (!region) return null;
    const regionNodes = nodes.filter(n => n.regionId === region.id);

    return (
      <div className="w-72 bg-white rounded-3xl shadow-2xl border border-slate-200/60 p-6 overflow-hidden relative">
        {!compact && (
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center space-x-3 mb-5">
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100/50 text-emerald-500 shadow-sm">
             <LayoutTemplate className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight leading-tight">{region.name}</h3>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">区域配置</div>
          </div>
        </div>
        
        <div className="space-y-3 mb-5">
          <div className="flex justify-between items-center bg-slate-50 rounded-xl p-3 border border-slate-100 shadow-sm">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">节点总数</span>
            <span className="text-sm font-black text-slate-800">{regionNodes.length} <span className="text-[10px] text-slate-400">个</span></span>
          </div>
        </div>

        {!isPreview && (
          <div className="flex space-x-2 pt-2 border-t border-slate-100">
            <button 
              onClick={(e) => { e.stopPropagation(); setRegionModalOpen(true, region); }}
              className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-xl text-xs font-black transition-all"
            >编辑</button>
            <button 
              onClick={(e) => { 
                e.stopPropagation();
                if (regionNodes.length > 0) {
                  alert('当前区域内存在节点，请先迁移或删除区域内对象。');
                  return;
                }
                if (window.confirm(`确定要删除区域 ${region.name} 吗？`)) {
                  removeRegion(region.id);
                  handleClose(e);
                }
              }}
              className="flex-1 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-black transition-all border border-rose-100 hover:bg-rose-100"
            >删除</button>
          </div>
        )}
      </div>
    );
  }

  return null;
};
