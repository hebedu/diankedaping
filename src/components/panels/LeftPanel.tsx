import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { 
  Server, Shield, SwitchCamera, LayoutTemplate, Network, Monitor, 
  Plus, Search, Edit2, Trash2, 
  Box, ChevronLeft, ChevronRight, Crosshair, HelpCircle, 
  Database, Globe, Cloud, Layers
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
  'custom': <HelpCircle className="w-4 h-4" />,
};

export const LeftPanel = () => {
  const { 
    nodes, 
    setNodeModalOpen, 
    removeNode, 
    reactFlowInstance,
    selectElement,
    isLeftPanelOpen,
    setLeftPanelOpen
  } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');

  const handleLocate = (id: string) => {
    selectElement(id, 'node');
    if (reactFlowInstance) {
      const node = reactFlowInstance.getNodes().find((n: any) => n.id === id);
      if (node) {
        reactFlowInstance.fitView({ nodes: [node], duration: 800, padding: 0.5 });
      }
    }
  };

  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      const search = searchTerm.toLowerCase();
      return searchTerm === '' || 
        n.name.toLowerCase().includes(search) || 
        n.ip?.includes(searchTerm) ||
        n.relatedDeviceName?.toLowerCase().includes(search) ||
        n.relatedDeviceIp?.includes(searchTerm) ||
        n.relatedTopologyName?.toLowerCase().includes(search);
    });
  }, [nodes, searchTerm]);

  const renderNodeItem = (node: TopologyNode) => {
    return (
      <div
        key={node.id}
        className="flex items-center p-3 rounded-xl bg-white border border-slate-100 transition-all group mb-2 hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm cursor-pointer"
        onClick={() => handleLocate(node.id)}
      >
        <div className="p-2 bg-blue-50 text-primary rounded-lg mr-3">
          {iconMap[node.iconType] || <Server className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-slate-700 truncate">{node.name}</div>
        </div>
        
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleLocate(node.id); }}
            className="p-1.5 text-slate-400 hover:text-primary hover:bg-white rounded-lg shadow-sm"
            title="定位节点"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setNodeModalOpen(true, node); }}
            className="p-1.5 text-slate-400 hover:text-primary hover:bg-white rounded-lg shadow-sm"
            title="编辑节点"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('确认删除该节点及相关连线？')) {
                removeNode(node.id);
              }
            }}
            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-white rounded-lg shadow-sm"
            title="删除节点"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`relative flex transition-all duration-300 ease-in-out h-full ${isLeftPanelOpen ? 'w-72' : 'w-0'}`}>
      <button 
        onClick={() => setLeftPanelOpen(!isLeftPanelOpen)}
        className={`absolute top-1/2 -translate-y-1/2 -right-3 z-50 w-6 h-12 bg-white border border-slate-200 rounded-lg shadow-md flex items-center justify-center text-slate-400 hover:text-primary transition-all hover:scale-105 active:scale-95 group`}
        title={isLeftPanelOpen ? "收起节点管理" : "展开节点管理"}
      >
        {isLeftPanelOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      <div className={`w-72 bg-white border-r border-slate-200 flex flex-col h-full z-10 shadow-xl overflow-hidden font-sans transition-opacity duration-200 ${isLeftPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="p-4 border-b border-slate-100 bg-slate-50/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-primary rounded-lg shadow-md shadow-primary/20">
                <Box className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-base font-black text-slate-800 tracking-tight">节点管理</h2>
            </div>
            <button
              onClick={() => setNodeModalOpen(true)}
              className="flex items-center space-x-1.5 py-1.5 px-3 rounded-xl bg-primary text-white text-[11px] font-black hover:bg-primary-hover shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增节点</span>
            </button>
          </div>

          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="请搜索节点名称" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all placeholder:text-slate-400 shadow-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/10">
          {filteredNodes.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">当前拓扑节点</span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{filteredNodes.length}</span>
              </div>
              {filteredNodes.map(renderNodeItem)}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 px-6 text-center">
              <div className="p-4 bg-slate-100 rounded-full mb-3">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-500 mb-1">
                {searchTerm ? '未找到匹配节点' : '暂无节点'}
              </p>
              <p className="text-xs">
                {searchTerm ? '请尝试更换关键词' : '点击“新增节点”开始创建拓扑'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
