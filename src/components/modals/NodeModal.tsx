import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { 
  X, Server, Shield, SwitchCamera, Network, Monitor, 
  Layers, Database, Globe, Cloud, LayoutTemplate,
  AlertCircle, CheckCircle2, Search, Info as InfoIcon,
  Filter, Check, Plus, Edit3, Trash2
} from 'lucide-react';
import type { TopologyNode, IconType, RelationType, ElementStatus } from '../../types';
import { ResourcePicker } from './ResourcePicker';

const icons: { type: IconType; label: string; icon: React.ReactNode }[] = [
  { type: 'firewall', label: '防火墙', icon: <Shield className="w-5 h-5" /> },
  { type: 'router', label: '路由器', icon: <Network className="w-5 h-5" /> },
  { type: 'switch', label: '交换机', icon: <SwitchCamera className="w-5 h-5" /> },
  { type: 'server', label: '服务器', icon: <Server className="w-5 h-5" /> },
  { type: 'terminal', label: '终端', icon: <Monitor className="w-5 h-5" /> },
  { type: 'middleware', label: '中间件', icon: <Layers className="w-5 h-5" /> },
  { type: 'subTopology', label: '集群', icon: <LayoutTemplate className="w-5 h-5" /> },
];

export const NodeModal = () => {
  const { 
    isNodeModalOpen, 
    editingNode, 
    setNodeModalOpen, 
    addNode, 
    updateNode, 
    availableDevices,
    availableSubTopologies
  } = useStore();

  const [formData, setFormData] = useState<Partial<TopologyNode>>({
    name: '',
    iconType: 'server',
    relationType: 'device',
    relatedDeviceIds: [],
    regionId: '',
    description: '',
  });

  const [isPickerOpen, setPickerOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingNode) {
      setFormData(editingNode);
    } else {
      setFormData({
        name: '',
        iconType: 'server',
        relationType: 'device',
        relatedDeviceIds: [],
        regionId: '',
        description: '',
      });
    }
    setErrors({});
    setPickerOpen(false);
  }, [editingNode, isNodeModalOpen]);

  if (!isNodeModalOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = '请输入节点名称';
    if (formData.relationType === 'device' && (!formData.relatedDeviceIds || formData.relatedDeviceIds.length === 0)) {
      newErrors.relatedDeviceIds = '请至少选择一个关联设备';
    }
    if (formData.relationType === 'subTopology' && !formData.relatedTopologyId) {
      newErrors.relatedTopologyId = '请选择一个关联集群';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingNode) {
      updateNode(editingNode.id, formData);
    } else {
      const newNode: TopologyNode = {
        ...formData as TopologyNode,
        id: `node_${Date.now()}`,
        position: formData.position || { x: 100, y: 100 },
        updatedAt: new Date().toISOString(),
      };
      addNode(newNode);
    }
    setNodeModalOpen(false);
  };

  const handlePickerConfirm = (ids: string[]) => {
    if (formData.relationType === 'device') {
      setFormData({ ...formData, relatedDeviceIds: ids });
      if (ids.length === 1 && !formData.name) {
        const device = availableDevices.find(d => d.id === ids[0]);
        if (device) setFormData(prev => ({ ...prev, name: device.name }));
      }
    } else {
      const topoId = ids[0];
      const topo = availableSubTopologies.find(t => t.id === topoId);
      setFormData({ 
        ...formData, 
        relatedTopologyId: topoId,
        name: formData.name || (topo?.name || ''),
        iconType: 'subTopology'
      });
    }
    setPickerOpen(false);
  };

  const selectedDevices = availableDevices.filter(d => formData.relatedDeviceIds?.includes(d.id));
  const selectedSubTopology = availableSubTopologies.find(t => t.id === formData.relatedTopologyId);

  return (
    <>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setNodeModalOpen(false)} />
        
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">新增节点</h2>
              <p className="text-sm text-slate-400 mt-1 font-medium">配置节点展示信息，并关联节点承载的资源</p>
            </div>
            <button 
              onClick={() => setNodeModalOpen(false)}
              className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {/* Section 1: 节点信息 */}
            <div className="space-y-6 mb-10">
              <div className="flex items-center pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">节点信息</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-widest">显示名称 *</label>
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

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-3 uppercase tracking-widest">节点图标 *</label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {icons.map((item) => (
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
              </div>
            </div>

            {/* Section 2: 关联资源 */}
            <div className="space-y-6 mb-4">
              <div className="flex items-center pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">关联资源</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-3 uppercase tracking-widest">关联类型 *</label>
                  <div className="flex items-center space-x-8 px-1">
                    <label className="flex items-center space-x-2.5 cursor-pointer group">
                      <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-all ${
                        formData.relationType === 'device' ? 'border-primary bg-primary' : 'border-slate-200 group-hover:border-slate-300 bg-white'
                      }`}>
                        {formData.relationType === 'device' && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                      </div>
                      <input 
                        type="radio" 
                        className="hidden" 
                        checked={formData.relationType === 'device'} 
                        onChange={() => setFormData({ ...formData, relationType: 'device' })} 
                      />
                      <span className={`text-sm transition-colors ${formData.relationType === 'device' ? 'font-bold text-slate-800' : 'font-medium text-slate-400 group-hover:text-slate-500'}`}>关联设备</span>
                    </label>

                    <label className="flex items-center space-x-2.5 cursor-pointer group">
                      <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-all ${
                        formData.relationType === 'subTopology' ? 'border-primary bg-primary' : 'border-slate-200 group-hover:border-slate-300 bg-white'
                      }`}>
                        {formData.relationType === 'subTopology' && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                      </div>
                      <input 
                        type="radio" 
                        className="hidden" 
                        checked={formData.relationType === 'subTopology'} 
                        onChange={() => setFormData({ ...formData, relationType: 'subTopology' })} 
                      />
                      <span className={`text-sm transition-colors ${formData.relationType === 'subTopology' ? 'font-bold text-slate-800' : 'font-medium text-slate-400 group-hover:text-slate-500'}`}>关联集群</span>
                    </label>
                  </div>
                </div>

                {/* Selected Resources Summary */}
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                      {formData.relationType === 'device' ? '已选关联设备' : '已选集群'}
                    </label>
                    <button 
                      type="button"
                      onClick={() => setPickerOpen(true)}
                      className="text-[10px] font-bold text-primary hover:text-primary-hover flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-primary/5 transition-all"
                    >
                      {formData.relatedDeviceIds?.length || formData.relatedTopologyId ? <Edit3 className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                      <span>{formData.relatedDeviceIds?.length || formData.relatedTopologyId ? '重新选择' : '点击选择资源'}</span>
                    </button>
                  </div>

                  <div className={`min-h-[100px] p-4 rounded-3xl border-2 border-dashed transition-all flex flex-wrap gap-2 items-start content-start ${
                    errors.relatedDeviceIds || errors.relatedTopologyId ? 'border-rose-200 bg-rose-50/30' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                  }`}>
                    {formData.relationType === 'device' ? (
                      selectedDevices.length === 0 ? (
                        <div className="w-full h-full flex flex-col items-center justify-center py-4 space-y-2 opacity-40">
                          <Server className="w-8 h-8 text-slate-300" />
                          <span className="text-[11px] font-medium text-slate-400">暂未选择任何物理设备</span>
                        </div>
                      ) : (
                        selectedDevices.map(device => (
                          <div key={device.id} className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm animate-in zoom-in-90 duration-200">
                            <div className={`w-1.5 h-1.5 rounded-full ${device.status === '正常' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                            <span className="text-xs font-semibold text-slate-700">{device.name}</span>
                            <button 
                              type="button" 
                              onClick={() => setFormData(prev => ({ ...prev, relatedDeviceIds: prev.relatedDeviceIds?.filter(id => id !== device.id) }))}
                              className="text-slate-300 hover:text-rose-500 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      )
                    ) : (
                      !selectedSubTopology ? (
                        <div className="w-full h-full flex flex-col items-center justify-center py-4 space-y-2 opacity-40">
                          <LayoutTemplate className="w-8 h-8 text-slate-300" />
                          <span className="text-[11px] font-medium text-slate-400">暂未关联目标集群</span>
                        </div>
                      ) : (
                        <div className="w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                              <LayoutTemplate className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-800">{selectedSubTopology.name}</span>
                              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">集群对象 · {selectedSubTopology.nodeCount} 节点</span>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, relatedTopologyId: undefined }))}
                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                  {errors.relatedDeviceIds && <p className="text-[10px] text-rose-500 mt-1.5 font-bold flex items-center px-1"><AlertCircle className="w-3 h-3 mr-1" /> {errors.relatedDeviceIds}</p>}
                  {errors.relatedTopologyId && <p className="text-[10px] text-rose-500 mt-1.5 font-bold flex items-center px-1"><AlertCircle className="w-3 h-3 mr-1" /> {errors.relatedTopologyId}</p>}

                  {formData.relationType === 'subTopology' && (
                    <div className="flex items-start space-x-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 shadow-sm">
                      <InfoIcon className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-indigo-700">跳转入口说明</span>
                        <span className="text-[10px] font-medium text-indigo-500/80 leading-relaxed mt-0.5">选择后，该节点将作为进入目标集群的唯一入口，支持双击下钻。</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-end space-x-4 bg-white">
            <button
              type="button"
              onClick={() => setNodeModalOpen(false)}
              className="px-6 py-3 rounded-2xl text-slate-400 font-bold hover:text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className={`px-10 py-3 rounded-2xl text-white font-bold shadow-xl transition-all flex items-center space-x-2 active:scale-95 ${
                (formData.relationType === 'device' && (!formData.relatedDeviceIds || formData.relatedDeviceIds.length === 0)) ||
                (formData.relationType === 'subTopology' && !formData.relatedTopologyId) ||
                !formData.name
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-primary hover:bg-primary-hover shadow-primary/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingNode ? '完成配置' : '创建节点'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Resource Picker Modal */}
      <ResourcePicker 
        isOpen={isPickerOpen}
        onClose={() => setPickerOpen(false)}
        type={formData.relationType as 'device' | 'subTopology'}
        availableDevices={availableDevices}
        availableSubTopologies={availableSubTopologies}
        selectedIds={formData.relationType === 'device' ? (formData.relatedDeviceIds || []) : (formData.relatedTopologyId ? [formData.relatedTopologyId] : [])}
        onConfirm={handlePickerConfirm}
      />
    </>
  );
};
