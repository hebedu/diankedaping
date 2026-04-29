import React from 'react';
import { useStore } from '../../store/useStore';
import { 
  X, Server, LayoutTemplate, Link2, Trash2, Activity, Info, 
  Clock, ChevronRight, Shield, Network, Layers, Database,
  ArrowRight, ArrowLeft, ArrowLeftRight, ExternalLink, Globe, Cloud, Monitor, Edit3, SwitchCamera
} from 'lucide-react';
import type { TopologyNode, IconType } from '../../types';

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

export const RightPanel = () => {
  const { 
    selectedElementId, 
    selectedElementType, 
    clearSelection,
    nodes,
    regions,
    connections,
    removeNode,
    removeConnection,
    selectElement,
    isPreview,
    setNodeModalOpen,
    setViewMode,
    updateConnection,
    availableDevices,
    availableSubTopologies
  } = useStore();

  if (isPreview || !selectedElementId || selectedElementType === 'region') return null;

  let content = null;
  let title = "";
  let icon = null;

  const handleDelete = () => {
    if (selectedElementType === 'node') {
      if (window.confirm('确认删除该节点及相关连线？')) {
        removeNode(selectedElementId);
        clearSelection();
      }
    } else if (selectedElementType === 'connection') {
      if (window.confirm('确定要删除该链路吗？')) {
        removeConnection(selectedElementId);
        clearSelection();
      }
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case '正常': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      case '告警': return 'text-amber-500 bg-amber-50 border-amber-100';
      case '异常': return 'text-rose-500 bg-rose-50 border-rose-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  const renderRelatedItem = (targetId: string, relationType: 'in' | 'out' | 'bi', connType: string) => {
    const targetNode = nodes.find(n => n.id === targetId);
    if (!targetNode) return null;

    return (
      <div 
        key={targetId}
        onClick={() => selectElement(targetId, 'node')}
        className="group flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer mb-2 shadow-sm"
      >
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className={`p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:text-primary transition-colors`}>
            {iconMap[targetNode.iconType] || <Server className="w-4 h-4" />}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-black text-slate-700 truncate">{targetNode.name}</span>
            <span className="text-[10px] text-slate-400 font-bold">{connType}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {relationType === 'out' && <ArrowRight className="w-3.5 h-3.5 text-blue-500 animate-pulse" />}
          {relationType === 'in' && <ArrowLeft className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />}
          {relationType === 'bi' && <ArrowLeftRight className="w-3.5 h-3.5 text-purple-500" />}
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary" />
        </div>
      </div>
    );
  };

  if (selectedElementType === 'node') {
    const node = nodes.find(n => n.id === selectedElementId);
    if (node) {
      title = "节点详情";
      icon = <div className="p-1.5 bg-blue-50 text-primary rounded-lg">{iconMap[node.iconType]}</div>;
      const region = regions.find(r => r.id === node.regionId);
      
      const nodeDevices = node.relationType === 'device' 
        ? availableDevices.filter(d => node.relatedDeviceIds?.includes(d.id))
        : [];
      
      const subTopology = node.relationType === 'subTopology'
        ? availableSubTopologies.find(t => t.id === node.relatedTopologyId)
        : null;

      const aggregatedStatus = nodeDevices.length > 0 
        ? (nodeDevices.some(d => d.status === '异常') ? '异常' : (nodeDevices.some(d => d.status === '告警') ? '告警' : '正常'))
        : '正常';

      content = (
        <div className="space-y-6">
          {/* Node Summary */}
          <div className="flex items-center space-x-4 p-4 bg-slate-50 border border-slate-100 rounded-xl shadow-sm">
            <div className="p-3 bg-white rounded-xl shadow-sm text-primary border border-slate-100">
              {iconMap[node.iconType]}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black text-slate-800 truncate mb-1">{node.name}</h4>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase ${getStatusColor(aggregatedStatus)}`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${aggregatedStatus === '正常' ? 'bg-emerald-500' : aggregatedStatus === '异常' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                  状态：{aggregatedStatus}
                </span>
              </div>
            </div>
          </div>
          
          {/* Basic Info Section */}
          <div className="space-y-4 px-1">
            <div className="flex items-center space-x-2 pb-1 border-b border-slate-50">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">节点信息</span>
            </div>
            
            <div className="grid grid-cols-1 gap-4 text-xs">
              <div className="flex justify-between items-start">
                <span className="text-slate-400 font-medium">图标类型</span>
                <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-bold text-[10px] uppercase">{node.iconType}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-slate-400 font-medium">关联类型</span>
                <span className="px-2 py-0.5 bg-blue-50 text-primary rounded font-bold text-[10px]">
                  {node.relationType === 'device' ? '关联物理设备' : '关联逻辑子拓扑'}
                </span>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-slate-400 font-medium">所属区域</span>
                <span className="text-slate-700 font-bold text-right max-w-[160px] leading-relaxed">{region?.name || '自由放置'}</span>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-slate-400 font-medium">备注说明</span>
                <span className="text-slate-500 font-medium text-right max-w-[160px] italic leading-relaxed">{node.description || '无备注信息'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">最近更新</span>
                <span className="text-slate-500 font-medium flex items-center">
                  <Clock className="w-3 h-3 mr-1 opacity-50" />
                  刚刚
                </span>
              </div>
            </div>
          </div>

          {/* Associated Resources Section */}
          <div className="space-y-4 px-1">
            <div className="flex items-center space-x-2 pb-1 border-b border-slate-50">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">关联资源明细</span>
            </div>

            {node.relationType === 'device' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">物理设备 ({nodeDevices.length})</span>
                </div>
                <div className="max-h-48 overflow-y-auto custom-scrollbar pr-1 space-y-2">
                  {nodeDevices.map(d => (
                    <div key={d.id} className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between shadow-sm group hover:border-primary/30 transition-all">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-primary transition-colors">
                          <Server className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-black text-slate-700 truncate">{d.name}</span>
                          <span className="text-[10px] font-mono font-bold text-slate-400">{d.ip}</span>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(d.status).split(' ')[0].replace('text-', 'bg-')}`} />
                    </div>
                  ))}
                  {nodeDevices.length === 0 && <div className="py-4 text-center text-[10px] text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">未选择任何设备</div>}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center space-x-3 shadow-sm">
                <div className="p-2 bg-white rounded-lg text-indigo-500 shadow-sm border border-indigo-50">
                  <LayoutTemplate className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">子拓扑对象</span>
                  <span className="text-sm font-bold text-indigo-700 truncate">{subTopology?.name || '未知子拓扑'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Related Links Section */}
          <div className="space-y-4 px-1">
            <div className="flex items-center space-x-2 pb-1 border-b border-slate-50">
              <Link2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">关联链路图谱</span>
            </div>

            <div className="space-y-2">
              {(() => {
                const relatedOut = connections.filter(c => c.source === selectedElementId && c.direction !== '双向');
                const relatedIn = connections.filter(c => c.target === selectedElementId && c.direction !== '双向');
                const relatedBi = connections.filter(c => (c.source === selectedElementId || c.target === selectedElementId) && c.direction === '双向');

                if (relatedOut.length === 0 && relatedIn.length === 0 && relatedBi.length === 0) {
                  return <div className="py-6 text-center text-[11px] text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">暂无任何关联连线</div>;
                }

                return (
                  <>
                    {relatedOut.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold text-blue-500 flex items-center mb-2 px-1 uppercase tracking-widest">
                          <ArrowRight className="w-3 h-3 mr-1.5" /> 流量流出 ({relatedOut.length})
                        </div>
                        {relatedOut.map(c => renderRelatedItem(c.target, 'out', c.type))}
                      </div>
                    )}
                    {relatedIn.length > 0 && (
                      <div>
                        <div className="text-[10px] font-black text-emerald-500 flex items-center mb-2 px-1 uppercase tracking-widest">
                          <ArrowLeft className="w-3 h-3 mr-1.5" /> 流量流入 ({relatedIn.length})
                        </div>
                        {relatedIn.map(c => renderRelatedItem(c.source, 'in', c.type))}
                      </div>
                    )}
                    {relatedBi.length > 0 && (
                      <div>
                        <div className="text-[10px] font-black text-purple-500 flex items-center mb-2 px-1 uppercase tracking-widest">
                          <ArrowLeftRight className="w-3 h-3 mr-1.5" /> 双向互连 ({relatedBi.length})
                        </div>
                        {relatedBi.map(c => {
                          const targetId = c.source === selectedElementId ? c.target : c.source;
                          return renderRelatedItem(targetId, 'bi', c.type);
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      );
    }
  } else if (selectedElementType === 'connection') {
    const conn = connections.find(c => c.id === selectedElementId);
    if (conn) {
      title = "链路详情";
      icon = <div className="p-1.5 bg-blue-50 text-primary rounded-lg"><Link2 className="w-4 h-4" /></div>;
      content = (
        <div className="space-y-6">
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">物理链路类型</label>
              <select 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold appearance-none cursor-pointer"
                value={conn.type}
                onChange={(e) => updateConnection(conn.id, { type: e.target.value })}
              >
                <option value="400G光纤线">400G光纤线</option>
                <option value="200G光纤线">200G光纤线</option>
                <option value="100G光纤线">100G光纤线</option>
                <option value="25G光纤线">25G光纤线</option>
                <option value="10G光纤线">10G光纤线</option>
                <option value="1G双绞线">1G双绞线</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
               <div className="flex items-center text-blue-600">
                 <Activity className="w-4 h-4 mr-2" />
                 <span className="text-xs font-black uppercase tracking-wider">实时链路状态</span>
               </div>
               <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${conn.status === '正常' ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'}`}>
                 {conn.status}
               </span>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full z-10 shadow-2xl animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center space-x-3">
          {icon}
          <h3 className="font-black text-slate-800 tracking-tight">{title}</h3>
        </div>
        <button 
          onClick={clearSelection}
          className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-600 shadow-sm hover:shadow-md active:scale-95"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {content}
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-3">
        {selectedElementType === 'node' && (
          <>
            {nodes.find(n => n.id === selectedElementId)?.relationType === 'subTopology' && (
              <button 
                onClick={() => {
                  const node = nodes.find(n => n.id === selectedElementId);
                  if (node?.relatedTopologyId) setViewMode('sub', node.relatedTopologyId);
                }}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all text-sm font-black active:scale-95"
              >
                <ExternalLink className="w-4 h-4" />
                <span>进入子拓扑</span>
              </button>
            )}
            
            <button 
              onClick={() => {
                const node = nodes.find(n => n.id === selectedElementId);
                if (node) setNodeModalOpen(true, node);
              }}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl border-2 border-primary/20 text-primary bg-white hover:bg-primary/5 transition-all text-sm font-black active:scale-95 shadow-sm"
            >
              <Edit3 className="w-4 h-4" />
              <span>修改关联属性</span>
            </button>
          </>
        )}

        <button 
          onClick={handleDelete}
          className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl border-2 border-rose-100 text-rose-500 bg-white hover:bg-rose-50 transition-all text-sm font-black active:scale-95 shadow-sm"
        >
          <Trash2 className="w-4 h-4" />
          <span>移除此{selectedElementType === 'node' ? '拓扑节点' : '连接链路'}</span>
        </button>
      </div>
    </div>
  );
};
