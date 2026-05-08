import React from 'react';
import { useStore } from '../../store/useStore';
import { AlertCircle, X } from 'lucide-react';

export const PreviewBanner = () => {
  const { isPreviewMode, previewVersionId, exitPreviewMode } = useStore();

  if (!isPreviewMode) return null;

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-300">
      <div className="bg-amber-500/90 text-white px-8 py-3 rounded-2xl shadow-2xl shadow-amber-500/20 flex items-center justify-center space-x-3 backdrop-blur-md border border-white/20">
        <AlertCircle className="w-5 h-5 text-white animate-pulse" />
        <span className="text-sm font-black tracking-tight">
          当前正在预览历史版本 <span className="bg-white/20 px-2.5 py-0.5 rounded-lg mx-1.5">{previewVersionId}</span>，不可编辑
        </span>
      </div>
    </div>
  );
};
