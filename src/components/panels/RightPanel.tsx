import React from 'react';
import { useStore } from '../../store/useStore';
import { 
  X, Server, LayoutTemplate, Link2, Trash2, Info, 
  ChevronRight, ChevronDown, Shield, Network, Layers, Database,
  ExternalLink, Globe, Cloud, Monitor, Edit3, SwitchCamera
} from 'lucide-react';
import type { TopologyNode, IconType } from '../../types';

const iconMap: Record<IconType, React.ReactNode> = {
  'firewall': <Shield className="w-4 h-4" />,
  'router': <Network className="w-4 h-4" />,
  'switch': <SwitchCamera className="w-4 h-4" />,
  'server': <Server className="w-4 h-4" />,
  'terminal': <Monitor className="w-4 h-4" />,
  'middleware': <Layers className="w-4 h-4" />,
  'database': <Database className="w-4 h-4" />,
  'gateway': <Globe className="w-4 h-4" />,
  'cloud': <Cloud className="w-4 h-4" />,
  'group': <LayoutTemplate className="w-4 h-4" />,
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
  const [isTopoExpanded, setIsTopoExpanded] = React.useState(true);

  const mode = useStore(s => s.mode);

  // 在预览模式、子拓扑模式、未选中元素、或选中区域/连线时，均不显示右侧面板
  if (isPreview || mode === 'sub' || !selectedElementId || selectedElementType === 'region' || selectedElementType === 'connection') return null;

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

  const renderRelatedItem = (targetId: string, connType: string, connectionId: string) => {
    const targetNode = nodes.find(n => n.id === targetId);
    if (!targetNode) return null;

    return (
      <div 
        key={connectionId}
        className="group flex items-center justify-between py-2.5 px-3 bg-transparent border-b border-slate-100 last:border-0"
      >
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="p-1.5 rounded-lg text-slate-400">
            {iconMap[targetNode.iconType] || <Server className="w-3.5 h-3.5" />}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-700 truncate">{targetNode.name}</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{connType}</span>
          </div>
        </div>
        
        {mode === 'main' && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('确定要删除这条节点连接关系吗？')) {
                removeConnection(connectionId);
              }
            }}
            className="p-1.5 rounded-lg text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
            title="删除关系"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  };

  if (selectedElementType === 'node') {
    const node = nodes.find(n => n.id === selectedElementId);
    if (node) {
      title = "节点详情";
      icon = <div className="p-1.5 bg-blue-50 text-primary rounded-lg">{iconMap[node.iconType]}</div>;

      
      const subTopology = availableSubTopologies.find(t => t.id === node.relatedTopologyId);
      const nodeDevices = subTopology?.devices || [];
      const relatedConns = connections.filter(c => c.source === selectedElementId || c.target === selectedElementId);

      content = (
        <div className="space-y-8">
          {/* Simple Node Summary - Top Aligned */}
          <div className="flex items-start space-x-4 px-2">
            <div className="p-3 bg-slate-50 rounded-xl text-primary border border-slate-100 mt-1 shadow-sm">
              {iconMap[node.iconType]}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xl font-black text-slate-800 truncate tracking-tight leading-tight">{node.name}</h4>

            </div>
          </div>

          <div className="space-y-8">
            {/* 关联子拓扑区块 - 容器化展示 */}
            <div className="space-y-4 px-1">
              <div className="flex items-center space-x-2 pb-1">
                <span className="text-sm font-black text-slate-800 tracking-tight">关联子拓扑</span>
              </div>
              
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                {node.relatedTopologyId ? (
                  <>
                    {/* 子拓扑头部卡片 */}
                    <div 
                      className="p-4 bg-primary/[0.03] border-b border-slate-50 flex items-center justify-between cursor-pointer hover:bg-primary/[0.06] transition-all"
                      onClick={() => setIsTopoExpanded(!isTopoExpanded)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-primary/10 text-primary">
                          <LayoutTemplate className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-slate-800 tracking-tight">
                            {availableSubTopologies.find(t => t.id === node.relatedTopologyId)?.name || '未定义子拓扑'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                            包含 {nodeDevices.length} 台设备
                          </span>
                        </div>
                      </div>
                      {isTopoExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>

                    {/* 设备列表 */}
                    {isTopoExpanded && nodeDevices.length > 0 && (
                      <div className="divide-y divide-slate-50/60 animate-in fade-in slide-in-from-top-2 duration-200">
                        {nodeDevices.map(d => (
                          <div key={d.id} className="p-4 flex items-center justify-between hover:bg-slate-50/30 transition-all group">
                            <div className="flex items-center space-x-3.5 overflow-hidden">
                              <div className="p-2.5 bg-slate-50 rounded-2xl text-slate-400 border border-slate-100 group-hover:text-primary group-hover:border-primary/20 transition-all">
                                <Server className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[12px] font-bold text-slate-700 truncate">{d.name}</span>
                                <span className="text-[10px] font-mono text-slate-400">{d.ip}</span>
                              </div>
                            </div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase px-2 py-1 bg-slate-50 rounded-lg border border-slate-100/50">{d.type}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-8 text-center text-[10px] text-slate-400 italic">未选择关联子拓扑</div>
                )}
              </div>
            </div>

              {/* 节点关系区块 */}
              <div className="space-y-4 px-1">
                <div className="flex items-center space-x-2 pb-2 border-b-2 border-slate-50">
                  <Link2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-sm font-black text-slate-700 tracking-tight">节点关系 ({relatedConns.length})</span>
                </div>
                <div className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
                  {relatedConns.length === 0 ? (
                    <div className="py-8 text-center text-[10px] text-slate-400 italic">暂无节点连接关系</div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {relatedConns.map(c => {
                        const targetId = c.source === selectedElementId ? c.target : c.source;
                        return renderRelatedItem(targetId, c.type, c.id);
                      })}
                    </div>
                  )}
                </div>
              </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full z-10 shadow-2xl animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center space-x-3">
          <h3 className="font-black text-slate-800 tracking-tight text-lg">{title}</h3>
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

      <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
        {selectedElementType === 'node' && (
          <>
            {/* 已移除进入子拓扑按钮 */}
            
            {/* Action buttons only in MAIN mode */}
            {mode === 'main' && (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => {
                    const node = nodes.find(n => n.id === selectedElementId);
                    if (node) setNodeModalOpen(true, node);
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 py-3.5 rounded-2xl border-2 border-primary/20 text-primary bg-white hover:bg-primary/5 transition-all text-sm font-black active:scale-95 shadow-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>编辑节点</span>
                </button>

                <button 
                  onClick={handleDelete}
                  className="flex-1 flex items-center justify-center space-x-2 py-3.5 rounded-2xl border-2 border-rose-100 text-rose-500 bg-white hover:bg-rose-50 transition-all text-sm font-black active:scale-95 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>删除节点</span>
                </button>
              </div>
            )}
          </>
        )}

        {selectedElementType === 'connection' && mode === 'main' && (
           <button 
           onClick={handleDelete}
           className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-2xl border-2 border-rose-100 text-rose-500 bg-white hover:bg-rose-50 transition-all text-sm font-black active:scale-95 shadow-sm"
         >
           <Trash2 className="w-4 h-4" />
           <span>删除链路</span>
         </button>
        )}
      </div>
    </div>
  );
};
