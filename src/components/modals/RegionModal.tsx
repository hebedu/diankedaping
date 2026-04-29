import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const RegionModal = () => {
  const { isRegionModalOpen, setRegionModalOpen, addRegion, updateRegion, editingRegion } = useStore();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('security');

  useEffect(() => {
    if (isRegionModalOpen) {
      if (editingRegion) {
        setName(editingRegion.name || '');
        setSelectedColor(editingRegion.type || 'security');
      } else {
        setName('');
        setSelectedColor('security');
      }
    }
  }, [isRegionModalOpen, editingRegion]);

  if (!isRegionModalOpen) return null;

  const colorOptions = [
    { id: 'security', bg: 'bg-blue-100', border: 'border-blue-400' },
    { id: 'compute', bg: 'bg-emerald-100', border: 'border-emerald-400' },
    { id: 'data', bg: 'bg-amber-100', border: 'border-amber-400' },
    { id: 'ops', bg: 'bg-purple-100', border: 'border-purple-400' },
    { id: 'external', bg: 'bg-green-100', border: 'border-green-400' },
    { id: 'cyan', bg: 'bg-cyan-100', border: 'border-cyan-400' },
    { id: 'rose', bg: 'bg-rose-100', border: 'border-rose-400' },
    { id: 'slate', bg: 'bg-slate-100', border: 'border-slate-400' },
  ];

  const handleSave = () => {
    if (!name.trim()) {
      alert('请输入区域名称');
      return;
    }
    
    if (editingRegion?.id) {
      updateRegion(editingRegion.id, {
        name: name.trim(),
        type: selectedColor as any
      });
    } else {
      addRegion({
        id: `r-${Date.now()}`,
        name: name.trim(),
        type: selectedColor as any,
        position: { x: 100, y: 100 },
        width: 400,
        height: 300
      });
    }
    
    setRegionModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-[480px] animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">{editingRegion ? '编辑区域' : '新增区域'}</h3>
          <button 
            onClick={() => setRegionModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center">
              区域名称 <span className="text-rose-500 ml-1">*</span>
            </label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如 核心网络安全域"
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              autoFocus
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">
              区域背景颜色
            </label>
            <div className="flex flex-wrap gap-3">
              {colorOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedColor(opt.id)}
                  className={`w-8 h-8 rounded-md border-2 transition-all ${opt.bg} ${
                    selectedColor === opt.id ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-transparent hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 bg-slate-50 rounded-b-lg space-x-3">
          <button 
            onClick={() => setRegionModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-md flex items-center space-x-1.5 shadow-md shadow-primary/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>保存</span>
          </button>
        </div>
      </div>
    </div>
  );
};
