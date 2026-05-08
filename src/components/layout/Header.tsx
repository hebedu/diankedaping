import React, { useState } from 'react';
import { Bot, Home, BookOpen, User, ChevronDown, HelpCircle } from 'lucide-react';
import { GuideDrawer } from './GuideDrawer';

export const Header = () => {
  const [isGuideOpen, setGuideOpen] = useState(false);

  return (
    <div className="h-14 bg-panel border-b border-border flex items-center justify-between px-4 z-20 shadow-sm relative">
      <GuideDrawer isOpen={isGuideOpen} onClose={() => setGuideOpen(false)} />
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 mr-4">
          <div className="w-6 h-6 rounded bg-primary text-white flex items-center justify-center font-bold text-xs">SRE</div>
          <span className="font-bold text-text text-base tracking-wide">综合运维管理平台</span>
        </div>
      </div>

      <div className="flex items-center space-x-5">
        <button className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors text-sm font-medium border border-indigo-100">
          <Bot className="w-4 h-4 text-indigo-500" />
          <span>AI运维</span>
        </button>
        
        <div className="flex items-center space-x-1 text-muted hover:text-text cursor-pointer transition-colors text-sm">
          <Home className="w-4 h-4 mr-1" />
          <span>工作台</span>
        </div>
        
        <div className="flex items-center space-x-1 text-muted hover:text-text cursor-pointer transition-colors text-sm">
          <BookOpen className="w-4 h-4 mr-1" />
          <span>文档中心</span>
        </div>

        <div 
          onClick={() => setGuideOpen(true)}
          className="flex items-center space-x-1 text-primary hover:text-primary-hover cursor-pointer transition-colors text-sm font-bold bg-primary/5 hover:bg-primary/10 px-2.5 py-1.5 rounded-md mr-2"
        >
          <HelpCircle className="w-4 h-4 mr-1" />
          <span>交互说明</span>
        </div>

        <div className="h-4 w-px bg-border"></div>

        <div className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 py-1 px-2 rounded transition-colors">
          <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">超</div>
          <span className="text-sm font-medium text-text">超管</span>
          <ChevronDown className="w-4 h-4 text-muted" />
        </div>
      </div>
    </div>
  );
};
