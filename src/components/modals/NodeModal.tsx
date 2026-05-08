import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { 
  X, Server, LayoutTemplate, Edit3, Plus, AlertCircle, 
  Info, ExternalLink, Shield, Network, SwitchCamera, 
  Monitor, Layers 
} from 'lucide-react';
import { ResourcePicker } from './ResourcePicker';
import type { TopologyNode, IconType } from '../../types';

interface NodeModalProps {}

const nodeIcons: { type: IconType; label: string; icon: React.ReactNode }[] = [
  { type: 'firewall', label: '防火墙', icon: <Shield className="w-5 h-5" /> },
  { type: 'router', label: '路由器', icon: <Network className="w-5 h-5" /> },
  { type: 'switch', label: '交换机', icon: <SwitchCamera className="w-5 h-5" /> },
  { type: 'server', label: '服务器', icon: <Server className="w-5 h-5" /> },
  { type: 'terminal', label: '终端', icon: <Monitor className="w-5 h-5" /> },
  { type: 'subTopology', label: '集群', icon: <LayoutTemplate className="w-5 h-5" /> },
];

export const NodeModal: React.FC<NodeModalProps> = () => {
  const { 
    isNodeModalOpen, 
    editingNode, 
    setNodeModalOpen, 
    addNode, 
    updateNode, 
    availableDevices,
    availableSubTopologies,
    activeRegionId
  } = useStore();

  const [formData, setFormData] = useState<Partial<TopologyNode>>({
    name: '',
    iconType: 'server',
    relatedTopologyId: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (editingNode) {
      setFormData(editingNode);
    } else {
      setFormData({
        name: '',
        iconType: 'server',
        relatedTopologyId: undefined,
        regionId: activeRegionId || undefined,
      });
    }
    setErrors({});
  }, [editingNode, isNodeModalOpen, activeRegionId]);

  if (!isNodeModalOpen) return null;

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = '请输入节点名称';
    
    if (!formData.relatedTopologyId) {
      newErrors.relatedTopologyId = '请选择关联子拓扑';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingNode) {
      updateNode(editingNode.id, formData);
    } else {
      addNode({
        ...formData,
        position: { x: 100, y: 100 },
      } as Omit<TopologyNode, 'id'>);
    }
    setNodeModalOpen(false);
  };

  const selectedSubTopology = (availableSubTopologies || []).find(t => t.id === formData.relatedTopologyId);

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setNodeModalOpen(false)} />
        
        <div className="relative bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border border-white/20">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{editingNode ? '编辑节点' : '新增节点'}</h2>
              <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">配置节点展示信息，并关联节点承载的资源</p>
            </div>
            <button 
              onClick={() => setNodeModalOpen(false)}
              className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-slate-600 shadow-sm hover:shadow-md active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] font-bold text-slate-900 mb-4 uppercase tracking-widest flex items-center">
                    <div className="w-1 h-3 bg-primary rounded-full mr-2" />
                    节点图标 <span className="text-rose-500 ml-1">*</span>
                  </label>
                  <div className="grid grid-cols-7 gap-3">
                    {nodeIcons.map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setFormData({ ...formData, iconType: item.type })}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all space-y-1 ${
                          formData.iconType === item.type 
                            ? 'border-primary bg-primary/5 text-primary shadow-sm ring-4 ring-primary/5' 
                            : 'border-slate-100 hover:border-slate-200 text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        <div className={formData.iconType === item.type ? 'scale-110 transition-transform' : ''}>
                          {item.icon}
                        </div>
                        <span className="text-[10px] font-semibold whitespace-nowrap">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-900 mb-2 uppercase tracking-widest">显示名称 <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="请输入节点名称"
                    className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl outline-none focus:ring-4 transition-all font-semibold text-sm ${
                      errors.name ? 'border-rose-500 focus:ring-rose-500/10' : 'border-slate-100 focus:ring-primary/10 focus:border-primary shadow-inner'
                    }`}
                  />
                  {errors.name && <p className="text-[10px] text-rose-500 mt-1.5 font-bold flex items-center px-1"><AlertCircle className="w-3 h-3 mr-1" /> {errors.name}</p>}
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-900 mb-2 uppercase tracking-widest">
                      关联子拓扑 <span className="text-rose-500">*</span>
                    </label>
                    <button 
                      type="button"
                      onClick={() => setPickerOpen(true)}
                      className="text-[10px] font-bold text-primary hover:text-primary-hover flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-primary/5 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      <span>点击选择资源</span>
                    </button>
                  </div>

                  <div className={`min-h-[100px] p-4 rounded-3xl border-2 border-dashed transition-all flex flex-wrap gap-2 items-start content-start ${
                    errors.relatedTopologyId ? 'border-rose-200 bg-rose-50/30' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                  }`}>
                    {!selectedSubTopology ? (
                      <div className="w-full h-full flex flex-col items-center justify-center py-4 space-y-2 opacity-40">
                        <LayoutTemplate className="w-8 h-8 text-slate-300" />
                        <span className="text-[11px] font-medium text-slate-400">暂未关联目标子拓扑</span>
                      </div>
                    ) : (
                      <div className="w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                            <LayoutTemplate className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800">{selectedSubTopology.name}</span>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">{selectedSubTopology.devices?.length || 0} 个设备</span>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setFormData({ ...formData, relatedTopologyId: undefined })}
                          className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                  {errors.relatedTopologyId && <p className="text-[10px] text-rose-500 mt-1.5 font-bold flex items-center px-1"><AlertCircle className="w-3 h-3 mr-1" /> {errors.relatedTopologyId}</p>}
                </div>
              </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start space-x-3 mt-8">
              <Info className="w-4 h-4 text-primary mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-primary mb-1">关联说明</h4>
                <p className="text-[11px] text-primary/70 leading-relaxed font-medium">
                  选择后，该节点将作为资源的逻辑映射。您可以通过右侧详情面板查看其关联的物理设备或集群信息。
                </p>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button 
              onClick={() => setNodeModalOpen(false)}
              className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >取消</button>
            <button 
              onClick={handleSubmit}
              className="px-8 py-2.5 bg-primary text-white rounded-2xl text-sm font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{editingNode ? '保存修改' : '创建节点'}</span>
            </button>
          </div>
        </div>
      </div>

      <ResourcePicker 
        isOpen={isPickerOpen} 
        onClose={() => setPickerOpen(false)} 
        type="subTopology"
        availableDevices={availableDevices || []}
        availableSubTopologies={availableSubTopologies || []}
        selectedIds={formData.relatedTopologyId ? [formData.relatedTopologyId] : []}
        onConfirm={(ids) => {
          setFormData({ ...formData, relatedTopologyId: ids[0] });
          setPickerOpen(false);
        }}
      />
    </>
  );
};
