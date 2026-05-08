import React, { useState, useMemo } from 'react';
import { 
  X, Search, Filter, Check, Server, LayoutTemplate,
  ChevronRight, AlertCircle, Plus, RefreshCw, ExternalLink, Info
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
            <h3 className="text-sm font-bold text-slate-800">
              {type === 'device' ? '选择关联设备' : '选择关联子拓扑'}
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">
              {type === 'device' ? `已选择 ${tempSelected.length} 个资源` : '请选择一个目标子拓扑'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 space-y-3 bg-white">
            <div className="flex items-center space-x-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 group focus-within:border-primary/50 transition-all">
              <Search className="w-4 h-4 text-slate-400 group-focus-within:text-primary" />
              <input 
                type="text" 
                placeholder={`搜索${type === 'device' ? '名称或 IP' : '子拓扑名称'}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-semibold w-full placeholder:text-slate-300"
              />
            </div>

            {type === 'subTopology' && (
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-400">找不到目标子拓扑？</span>
                  <a 
                    href="/topology/new" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[11px] text-primary font-bold flex items-center space-x-1 hover:underline group"
                  >
                    <span>去新建子拓扑</span>
                    <ExternalLink className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
                <button 
                  type="button"
                  title="刷新列表"
                  className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-500 hover:text-primary hover:border-primary/30 transition-all active:scale-95 group bg-white shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5 group-active:animate-spin" />
                  <span className="text-xs font-bold">刷新</span>
                </button>
              </div>
            )}

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

            {/* List Header (Hidden in Sub-topo mode as per screenshot) */}
            {type === 'device' && (
              <div className="flex items-center justify-between pt-2 px-1">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  设备列表
                </span>
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
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredTopos.length === 0 ? (
                  <div className="py-20 text-center text-slate-300 text-xs italic">暂无可关联的子拓扑</div>
                ) : (
                  filteredTopos.map(topo => {
                    const isSelected = tempSelected.includes(topo.id);
                    return (
                      <div 
                        key={topo.id}
                        onClick={() => handleToggle(topo.id)}
                        className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border group ${
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
                            <span className="text-[10px] font-semibold text-slate-400">{topo.devices?.length || 0} 个设备</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className={`text-[10px] font-bold transition-all ${isSelected ? 'text-primary' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`}>查看子拓扑</span>
                          <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-primary translate-x-1' : 'text-slate-300'}`} />
                        </div>
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
            <Info className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium text-slate-400">
              一个节点只能关联一个子拓扑作为下钻入口
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
              {type === 'device' ? `确认选择 (${tempSelected.length})` : '确认关联'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
