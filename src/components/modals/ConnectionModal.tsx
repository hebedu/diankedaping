import React, { useState, useEffect } from 'react';
import { X, Save, ArrowRightLeft, ArrowRight, MoveHorizontal } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Connection } from '../../types';

export const ConnectionModal = () => {
  const { isConnectionModalOpen, setConnectionModalOpen, pendingConnection, addConnection, updateConnection, removeConnection, devices, groups } = useStore();
  
  const [formData, setFormData] = useState<Partial<Connection>>({
    direction: '单向',
    status: '正常',
    type: 'default',
  });

  useEffect(() => {
    if (isConnectionModalOpen && pendingConnection) {
      setFormData({
        ...pendingConnection,
        direction: '单向',
        status: '正常',
        type: 'default',
      });
    }
  }, [isConnectionModalOpen, pendingConnection]);

  if (!isConnectionModalOpen) return null;

  const handleSave = () => {
    if (!formData.source || !formData.target) {
      alert('连线源或目标丢失');
      return;
    }

    if (formData.id) {
      // Edit existing connection
      updateConnection(formData.id, formData);
    } else {
      // Create new connection
      addConnection({
        ...formData,
        id: `c-${Date.now()}`,
      } as Connection);
    }
    
    setConnectionModalOpen(false);
  };

  const handleDelete = () => {
    if (formData.id) {
      if (window.confirm('确定要删除这条连线吗？')) {
        removeConnection(formData.id);
        setConnectionModalOpen(false);
      }
    }
  };

  const getElementName = (id?: string) => {
    if (!id) return '未知';
    const device = devices.find(d => d.id === id);
    if (device) return device.displayName;
    const group = groups.find(g => g.id === id);
    if (group) return group.displayName;
    return '未知';
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-[400px] animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">{formData.id ? '编辑连线' : '配置连线属性'}</h3>
          <button 
            onClick={() => setConnectionModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-50 p-3 rounded-md text-sm text-slate-600 flex justify-between items-center border border-slate-100">
            <div className="font-medium truncate flex-1 text-center" title={getElementName(formData.source)}>{getElementName(formData.source)}</div>
            <div className="mx-2 flex items-center justify-center">
              {formData.direction === '双向' ? (
                <div className="p-1.5 text-slate-500 bg-slate-100 rounded-full shadow-inner mx-1" title="双向连线">
                  <MoveHorizontal className="w-4 h-4" />
                </div>
              ) : (
                <button
                  onClick={() => setFormData({ ...formData, source: formData.target, target: formData.source })}
                  className="p-1.5 rounded-full text-slate-400 hover:text-primary hover:bg-primary/10 transition-all hover:scale-110 active:rotate-180 group"
                  title="点击互换源和目标节点"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="font-medium truncate flex-1 text-center" title={getElementName(formData.target)}>{getElementName(formData.target)}</div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center">连线方向</label>
            <select 
              value={formData.direction || '单向'}
              onChange={(e) => setFormData({ ...formData, direction: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
            >

              <option value="单向">单向</option>
              <option value="双向">双向</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 rounded-b-lg">
          <div>
            {formData.id && (
              <button 
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-md transition-colors"
              >
                删除连线
              </button>
            )}
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setConnectionModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
            >
              取消
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-md flex items-center space-x-1.5 shadow-md shadow-primary/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{formData.id ? '保存修改' : '确认连线'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
