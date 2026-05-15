import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { Save, Eye, Send, ArrowLeft, Undo2, Redo2, Boxes, History } from 'lucide-react';

export const Toolbar = () => {
  const { 
    mode, activeSubTopologyId, isPreview, setPreview, setViewMode, 
    nodes, availableSubTopologies,
    setRegionModalOpen, 
    past, future, undo, redo,
    configStatus, saveDraft, publishConfig,
    isLocal, isReadOnly,
    setVersionDrawerOpen, isPreviewMode, exitPreviewMode, previewVersionId
  } = useStore();

  const handlePublish = () => {
    const errors: string[] = [];
    nodes.forEach(n => {
      if (!n.relatedTopologyId) {
        errors.push(`节点 ${n.name} 未指定关联子拓扑`);
      }
    });

    if (errors.length > 0) {
      alert(`发布失败，存在以下配置问题：\n${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}`);
    } else {
      if (window.confirm('确认发布配置？\n发布后，当前草稿将覆盖线上大屏配置。')) {
        publishConfig();
        alert('配置已发布');
      }
    }
  };

  const handleSaveDraft = () => {
    saveDraft();
    alert('编辑进度已暂存');
  };

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
    <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-50">
      
      {/* 左侧：返回与面包屑 */}
      <div className="flex items-center space-x-4">
        {mode === 'sub' && (
          <button 
            onClick={() => setViewMode('main')}
            className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-primary transition-all mr-1 border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div className="flex items-center space-x-2">
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
        
        <div className={`px-2.5 py-0.5 rounded-full text-[10px] border font-black uppercase tracking-wider ${
          isPreviewMode ? 'bg-amber-50 text-amber-600 border-amber-200' :
          isPreview ? 'bg-primary/5 text-primary border-primary/20' :
          statusColors[configStatus]
        }`}>
          {isPreviewMode ? '历史版本预览' : isPreview ? '预览模式' : configStatus}
        </div>
      </div>

      {/* 右侧：操作区 */}
      <div className="flex items-center space-x-3">
        {/* 撤销/重做 */}
        {!isPreview && !isPreviewMode && (
          <div className="flex items-center space-x-1 mr-2 pr-4 border-r border-slate-100">
            <button 
              onClick={undo}
              disabled={past.length === 0}
              className={`p-2 rounded-xl transition-all ${past.length > 0 ? 'text-slate-600 hover:bg-slate-50 cursor-pointer' : 'text-slate-200 cursor-not-allowed'}`}
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button 
              onClick={redo}
              disabled={future.length === 0}
              className={`p-2 rounded-xl transition-all ${future.length > 0 ? 'text-slate-600 hover:bg-slate-50 cursor-pointer' : 'text-slate-200 cursor-not-allowed'}`}
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center space-x-2.5">
          {!isPreview && !isPreviewMode && mode === 'main' && (
            <button 
              onClick={() => setRegionModalOpen(true)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white text-primary border-2 border-primary/20 hover:border-primary hover:bg-primary/[0.02] active:scale-95 transition-all shadow-sm"
            >
              <Boxes className="w-4 h-4" />
              <span className="text-sm font-black tracking-tight">新增区域</span>
            </button>
          )}

          {isPreview || isPreviewMode ? (
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => isPreviewMode ? exitPreviewMode() : setPreview(false)}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl border-2 border-primary/20 text-primary bg-white hover:border-primary text-sm font-black transition-all active:scale-95"
              >
                <Eye className="w-4 h-4" />
                <span>退出预览</span>
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => setPreview(true)}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white text-primary border-2 border-primary/20 hover:border-primary hover:bg-primary/[0.02] active:scale-95 transition-all"
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm font-black">预览模式</span>
              </button>
              <button 
                onClick={handleSaveDraft}
                disabled={configStatus === '已保存草稿' || configStatus === '已发布'}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-black active:scale-95 transition-all border-2 ${
                  configStatus === '有未保存修改' 
                    ? 'bg-white text-primary border-primary/20 hover:border-primary hover:bg-primary/[0.02]' 
                    : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>保存草稿</span>
              </button>
              <button 
                onClick={handlePublish}
                className="flex items-center space-x-2 px-7 py-2.5 rounded-xl bg-primary text-white text-sm font-black hover:bg-primary-hover active:scale-95 transition-all shadow-lg shadow-primary/30 border-2 border-primary"
              >
                <Send className="w-4 h-4" />
                <span>发布配置</span>
              </button>

              {!isPreview && !isPreviewMode && (
                <div className="flex items-center space-x-3 ml-1 pl-1">
                  <div className="w-px h-6 bg-slate-200" />
                  <button 
                    onClick={() => setVersionDrawerOpen(true)}
                    title="版本历史"
                    className="p-2.5 rounded-xl bg-white text-slate-400 border-2 border-slate-100 hover:border-slate-300 hover:text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
                  >
                    <History className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
