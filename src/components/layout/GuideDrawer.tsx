import React from 'react';
import { X, BookOpen, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useStore } from '../../store/useStore';
import guideContent from '../../assets/guide.md?raw';

export const GuideDrawer = () => {
  const { isGuideOpen, setGuideOpen } = useStore();

  if (!isGuideOpen) return null;

  const handleDownload = () => {
    const blob = new Blob([guideContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '大屏拓扑配置页交互规则说明最终版.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={() => setGuideOpen(false)}
      />
      
      {/* Drawer Content */}
      <div className="relative w-[800px] max-w-[90vw] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-black tracking-tight text-slate-800">大屏拓扑配置交互说明</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleDownload}
              className="flex items-center space-x-1 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors text-xs font-bold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载markdown文档</span>
            </button>
            <button 
              onClick={() => setGuideOpen(false)}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <div className="prose prose-slate prose-sm max-w-none 
            prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-800
            prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
            prose-p:text-slate-600 prose-p:leading-relaxed
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:text-slate-800 prose-strong:font-bold
            prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-slate-50 prose-pre:text-slate-700 prose-pre:border prose-pre:border-slate-100
            prose-table:border-collapse prose-table:w-full prose-table:text-sm
            prose-th:bg-slate-50 prose-th:p-3 prose-th:text-left prose-th:font-bold prose-th:text-slate-700 prose-th:border prose-th:border-slate-200
            prose-td:p-3 prose-td:border prose-td:border-slate-200 prose-td:text-slate-600
            prose-li:text-slate-600 marker:text-slate-400
            prose-blockquote:border-l-4 prose-blockquote:border-primary/40 prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:text-slate-700 prose-blockquote:not-italic
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {guideContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};
