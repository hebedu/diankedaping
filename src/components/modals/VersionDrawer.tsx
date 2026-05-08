import React, { useState, useMemo } from 'react';
import { 
  X, History, Clock, User, Eye, RotateCcw, 
  CheckCircle2, Search, Filter, AlertTriangle
} from 'lucide-react';
import { useStore } from '../../store/useStore';

export const VersionDrawer = () => {
  const { 
    isVersionDrawerOpen, setVersionDrawerOpen, 
    versions, enterPreviewMode, restoreVersion,
    configStatus
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'published'>('all');

  const filteredVersions = useMemo(() => {
    if (activeTab === 'all') return versions;
    return versions.filter(v => v.type === activeTab);
  }, [versions, activeTab]);

  if (!isVersionDrawerOpen) return null;

  const handleRestore = (versionId: string) => {
    const msg = configStatus === '有未保存修改' 
      ? '当前存在未保存修改，恢复历史版本后，这些未保存修改将被覆盖。确认继续？'
      : '确定要基于此版本恢复吗？恢复后将覆盖当前工作区内容。';
      
    if (window.confirm(msg)) {
      restoreVersion(versionId);
      setVersionDrawerOpen(false);
      alert('已恢复为所选版本');
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex justify-end overflow-hidden">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-300" 
        onClick={() => setVersionDrawerOpen(false)} 
      />
      
      <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-500 ease-out">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <History className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 tracking-tight">版本历史</h3>
            </div>
          </div>
          <button 
            onClick={() => setVersionDrawerOpen(false)} 
            className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all shadow-sm border border-transparent hover:border-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description & Filter */}
        <div className="p-6 space-y-6">
          <div className="bg-primary/[0.03] border border-primary/10 rounded-2xl p-4">
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              保存草稿和发布配置后会自动生成版本记录。<br />
              恢复历史版本只会生成当前草稿，不会直接影响线上大屏。
            </p>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-xl">
            {[
              { id: 'all', label: '全部', count: versions.length },
              { id: 'draft', label: '草稿版本', count: versions.filter(v => v.type === 'draft').length },
              { id: 'published', label: '发布版本', count: versions.filter(v => v.type === 'published').length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 text-[11px] font-black rounded-lg transition-all flex items-center justify-center ${
                  activeTab === tab.id 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] ${
                  activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-slate-200/50 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
          {filteredVersions.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-300 space-y-4">
              <History className="w-12 h-12 opacity-20" />
              <p className="text-sm font-bold italic">暂无版本记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVersions.map((v, idx) => (
                <div 
                  key={v.id} 
                  className="group relative bg-white border border-slate-100 rounded-2xl p-5 transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-0.5"
                >
                  {/* Status Badge (Above Title) */}
                  {v.isActive && (
                    <div className="mb-2">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>当前生效</span>
                      </span>
                    </div>
                  )}

                  {/* Title Area */}
                  <div className="mb-1 px-0.5">
                    <h4 className="text-[15px] font-black text-slate-800 tracking-tight">
                      {v.id} · {v.type === 'published' ? '发布版本' : '草稿版本'}
                    </h4>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center space-x-2 mb-6 text-[11px] font-medium text-slate-400 px-0.5">
                    <span>{v.timestamp}</span>
                    <span className="opacity-30">|</span>
                    <span>操作人：{v.operator}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => {
                        enterPreviewMode(v.id);
                        setVersionDrawerOpen(false);
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl bg-slate-50 text-slate-600 text-xs font-black hover:bg-slate-100 transition-all active:scale-95 border border-slate-100"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>查看预览</span>
                    </button>
                    <button 
                      onClick={() => handleRestore(v.id)}
                      className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl bg-white border border-primary/20 text-primary text-xs font-black hover:bg-primary/[0.03] hover:border-primary/40 transition-all active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>恢复该版本</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
