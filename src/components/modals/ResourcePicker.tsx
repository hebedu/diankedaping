import React, { useState, useMemo } from 'react';
import { 
  X, Search, Filter, Check, Server, LayoutTemplate, 
  ChevronRight, AlertCircle 
} from 'lucide-react';
import type { Device, SubTopology } from '../../types';

interface ResourcePickerProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'device' | 'subTopology';
  availableDevices: Device[];
  availableSubTopologies: SubTopology[];
  selectedIds: string[];
  onConfirm: (ids: string[]) => void;
}

export const ResourcePicker = ({
  isOpen,
  onClose,
  type,
  availableDevices,
  availableSubTopologies,
  selectedIds,
  onConfirm
}: ResourcePickerProps) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('全部');
  const [tempSelected, setTempSelected] = useState<string[]>(selectedIds);

  // Sync temp selection when opened
  React.useEffect(() => {
    if (isOpen) {
      setTempSelected(selectedIds);
      setSearch('');
      setTypeFilter('全部');
    }
  }, [isOpen, selectedIds]);

  const deviceTypes = useMemo(() => {
    const types = new Set(availableDevices.map(d => d.type));
    return ['全部', ...Array.from(types)];
  }, [availableDevices]);

  const filteredDevices = useMemo(() => {
    return availableDevices.filter(d => {
      const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.ip.includes(search);
      const matchType = typeFilter === '全部' || d.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [availableDevices, search, typeFilter]);

  const filteredTopos = useMemo(() => {
    return availableSubTopologies.filter(t => 
      t.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [availableSubTopologies, search]);

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    if (type === 'device') {
      setTempSelected(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    } else {
      setTempSelected([id]);
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[600px]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-800">选择{type === 'device' ? '关联设备' : '关联集群'}</h3>
            <p className="text-[10px] text-slate-400 font-medium">
              {type === 'device' ? `已选择 ${tempSelected.length} 个资源` : '请选择一个目标集群'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-lg text-slate-400 transition-all shadow-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 space-y-3 bg-white">
            <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 group focus-within:border-primary/50 transition-all">
              <Search className="w-4 h-4 text-slate-400 group-focus-within:text-primary" />
              <input 
                type="text" 
                placeholder={`搜索${type === 'device' ? '名称或 IP' : '集群名称'}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-semibold w-full placeholder:text-slate-300"
              />
            </div>

            {type === 'device' && (
              <div className="flex items-center overflow-x-auto pb-1 no-scrollbar">
                {deviceTypes.map(t => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all border ${
                      typeFilter === t 
                        ? 'bg-primary text-white border-primary shadow-sm' 
                        : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4">
            {type === 'device' ? (
              <div className="space-y-1">
                {filteredDevices.length === 0 ? (
                  <div className="py-20 text-center text-slate-300 text-xs italic">未找到匹配的设备</div>
                ) : (
                  filteredDevices.map(device => {
                    const isSelected = tempSelected.includes(device.id);
                    return (
                      <div 
                        key={device.id}
                        onClick={() => handleToggle(device.id)}
                        className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${
                          isSelected ? 'bg-primary/[0.03] border-primary/20 shadow-sm' : 'hover:bg-slate-50 border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'bg-primary border-primary' : 'border-slate-200 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-slate-700'}`}>{device.name}</span>
                            <span className="text-[10px] font-mono font-semibold text-slate-400">{device.ip} · {device.type}</span>
                          </div>
                        </div>
                        <div className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          device.status === '正常' ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'
                        }`}>
                          {device.status}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredTopos.length === 0 ? (
                  <div className="py-20 text-center text-slate-300 text-xs italic">暂无可关联的集群</div>
                ) : (
                  filteredTopos.map(topo => {
                    const isSelected = tempSelected.includes(topo.id);
                    return (
                      <div 
                        key={topo.id}
                        onClick={() => handleToggle(topo.id)}
                        className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${
                          isSelected ? 'bg-primary/[0.03] border-primary/20 shadow-sm' : 'hover:bg-slate-50 border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'bg-primary border-primary' : 'border-slate-200 bg-white'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-slate-700'}`}>{topo.name}</span>
                            <span className="text-[10px] font-semibold text-slate-400">包含 {topo.nodeCount} 个节点</span>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-primary translate-x-1' : 'text-slate-300'}`} />
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2 text-slate-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium">
              {type === 'device' ? '支持跨分类多选设备关联' : '仅限单选一个集群作为入口'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-slate-600">取消</button>
            <button 
              onClick={() => onConfirm(tempSelected)}
              disabled={tempSelected.length === 0}
              className={`px-6 py-2 rounded-xl text-white text-sm font-bold shadow-lg transition-all active:scale-95 ${
                tempSelected.length === 0 ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-primary hover:bg-primary-hover shadow-primary/20'
              }`}
            >
              确定选择 {tempSelected.length > 0 && `(${tempSelected.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
