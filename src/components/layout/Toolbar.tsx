import React, { useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Save, Eye, Send, ArrowLeft, Undo2, Redo2, Boxes } from 'lucide-react';

export const Toolbar = () => {
  const { 
    mode, activeSubTopologyId, isPreview, setPreview, setViewMode, 
    nodes, availableSubTopologies,
    setRegionModalOpen, 
    past, future, undo, redo,
    configStatus, saveDraft, publishConfig
  } = useStore();

  const handlePublish = () => {
    // 发布校验
    const errors: string[] = [];
    
    nodes.forEach(n => {
      if (n.relationType === 'device' && !n.relatedDeviceId) {
        errors.push(`节点 ${n.name} 已选择关联设备但未指定具体设备`);
      }
      if (n.relationType === 'subTopology' && !n.relatedTopologyId) {
        errors.push(`节点 ${n.name} 已选择关联子拓扑但未指定具体拓扑`);
      }
    });

    if (errors.length > 0) {
      alert(`发布失败，存在以下配置问题：\n${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}`);
    } else {
      if (window.confirm('确认发布配置？\n发布后，当前草稿将覆盖线上大屏配置，并影响正式大屏展示。是否确认发布？')) {
        publishConfig();
        alert('配置已发布');
      }
    }
  };

  const handleSaveDraft = () => {
    saveDraft();
    alert('草稿已保存');
  };

  // 快捷键支持：撤销/重做
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          if (future.length > 0) redo();
        } else {
          if (past.length > 0) undo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [past.length, future.length, undo, redo]);

  const activeSubTopology = activeSubTopologyId ? availableSubTopologies.find(t => t.id === activeSubTopologyId) : null;

  const statusColors = {
    '已发布': 'bg-emerald-50 text-emerald-600 border-emerald-200',
    '已保存草稿': 'bg-blue-50 text-blue-600 border-blue-200',
    '有未保存修改': 'bg-amber-50 text-amber-600 border-amber-200',
    '基于已发布版本编辑中': 'bg-slate-50 text-slate-500 border-slate-200'
  };

  return (
    <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4">
      {/* 左侧：返回与面包屑 + 状态 */}
      <div className="flex items-center space-x-3 text-sm font-medium">
        <div className="flex items-center space-x-1.5">
          {mode === 'sub' && (
            <button 
              onClick={() => setViewMode('main')}
              className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary transition-all mr-1 border border-transparent hover:border-slate-200"
              title="返回主拓扑"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <span 
            className={`cursor-pointer hover:text-primary transition-colors text-base font-black tracking-tight ${mode === 'main' ? 'text-slate-800' : 'text-slate-500'}`}
            onClick={() => setViewMode('main')}
          >
            大屏拓扑配置
          </span>
          {mode === 'sub' && activeSubTopology && (
            <>
              <span className="text-slate-300 font-normal px-1">/</span>
              <span className="text-slate-800 text-base font-black tracking-tight">{activeSubTopology.name}</span>
            </>
          )}
        </div>
        
        {/* 状态标识 */}
        <div className={`px-2.5 py-0.5 rounded-full text-[10px] border font-black uppercase tracking-wider ${statusColors[configStatus]}`}>
          {configStatus}
        </div>
      </div>

      {/* 右侧：操作区 */}
      <div className="flex items-center">
        {/* 撤销/重做 */}
        {!isPreview && (
          <div className="flex items-center space-x-1 mr-4 pr-4 border-r border-slate-200">
            <button 
              onClick={undo}
              disabled={past.length === 0}
              className={`p-1.5 rounded-lg transition-all ${past.length > 0 ? 'text-slate-600 hover:text-primary hover:bg-slate-100 cursor-pointer' : 'text-slate-200 cursor-not-allowed'}`}
              title="撤销 (Cmd/Ctrl + Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button 
              onClick={redo}
              disabled={future.length === 0}
              className={`p-1.5 rounded-lg transition-all ${future.length > 0 ? 'text-slate-600 hover:text-primary hover:bg-slate-100 cursor-pointer' : 'text-slate-200 cursor-not-allowed'}`}
              title="重做 (Cmd/Ctrl + Shift + Z)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 2. 配置操作组 - 仅在主拓扑模式下允许新增区域 */}
        {!isPreview && mode === 'main' && (
          <div className="flex items-center space-x-2 mr-5 pr-5 border-r border-slate-200">
            <button 
              onClick={() => setRegionModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 active:scale-95 transition-all border border-emerald-200 shadow-sm"
              title="新增区域"
            >
              <Boxes className="w-4 h-4" />
              <span className="text-sm font-black">新增区域</span>
            </button>
          </div>
        )}

        <div className="flex items-center space-x-2">
          {isPreview ? (
            <button 
              onClick={() => setPreview(false)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border-2 border-slate-200 text-slate-600 hover:border-slate-800 hover:text-slate-800 text-sm font-black transition-all active:scale-95"
            >
              <Eye className="w-4 h-4" />
              <span>退出预览</span>
            </button>
          ) : (
            <>
              <button 
                onClick={() => setPreview(true)}
                className="flex items-center space-x-1.5 px-3 py-2 text-sm font-black text-slate-600 hover:text-primary active:scale-95 transition-all mr-2"
              >
                <Eye className="w-4 h-4 opacity-70" />
                <span>预览模式</span>
              </button>
              <button 
                onClick={handleSaveDraft}
                disabled={configStatus === '已保存草稿' || configStatus === '已发布'}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-black active:scale-95 transition-all ${
                  configStatus === '有未保存修改' 
                    ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 shadow-sm' 
                    : 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed opacity-60'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>保存草稿</span>
              </button>
              <button 
                onClick={handlePublish}
                className="flex items-center space-x-2 px-6 py-2 rounded-xl bg-primary text-white text-sm font-black hover:bg-primary-hover active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                <Send className="w-4 h-4" />
                <span>发布配置</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
