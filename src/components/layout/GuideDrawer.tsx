import React from 'react';
import { X, BookOpen, Info, MousePointer2, Layers, Share2 } from 'lucide-react';

interface GuideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideDrawer: React.FC<GuideDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Drawer Content */}
      <div className="relative w-[500px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-black tracking-tight text-slate-800">大屏拓扑配置交互说明</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
          {/* Section 1: 核心模型 */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 text-primary">
              <Layers className="w-5 h-5" />
              <h3 className="text-base font-black uppercase tracking-wider">1. 核心业务模型</h3>
            </div>
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="text-sm font-bold text-slate-700 mb-2">拓扑 = 区域 + 节点 + 连线</div>
              <p className="text-sm text-slate-500 leading-relaxed">
                节点是画布中的唯一核心对象。设备只是节点的关联资源，子拓扑只能通过节点进入。区域仅作为视觉分组，不具备强容器属性。
              </p>
            </div>
          </section>

          {/* Section 2: 页面状态 */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 text-amber-500">
              <Info className="w-5 h-5" />
              <h3 className="text-base font-black uppercase tracking-wider">2. 页面状态规则</h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                { status: '基于已发布版本编辑中', desc: '初始状态，加载已发布版本' },
                { status: '有未保存修改', desc: '新增、删除、移动、编辑对象后触发' },
                { status: '已保存草稿', desc: '保存当前工作区到本地草稿' },
                { status: '已发布', desc: '同步至正式线上大屏' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                  <span className="text-xs font-bold text-slate-700">{item.status}</span>
                  <span className="text-[10px] text-slate-400">{item.desc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: 交互操作 */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 text-indigo-500">
              <MousePointer2 className="w-5 h-5" />
              <h3 className="text-base font-black uppercase tracking-wider">3. 核心交互逻辑</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-sm text-slate-600">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                <span><strong className="text-slate-800">编辑模式：</strong> 默认处于可编辑状态，支持拖拽、连线、新增对象。</span>
              </li>
              <li className="flex items-start space-x-3 text-sm text-slate-600">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                <span><strong className="text-slate-800">预览模式：</strong> 点击“预览大屏”进入只读状态，隐藏所有编辑面板，仅保留缩放平移与子拓扑跳转。</span>
              </li>
              <li className="flex items-start space-x-3 text-sm text-slate-600">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                <span><strong className="text-slate-800">连线规则：</strong> 仅支持“节点到节点”的连接。双击节点或点击右侧按钮进入子拓扑。</span>
              </li>
            </ul>
          </section>

          {/* Section 4: 隔离规则 */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 text-emerald-500">
              <Share2 className="w-5 h-5" />
              <h3 className="text-base font-black uppercase tracking-wider">4. 本地/局域网隔离</h3>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
              <p className="text-xs text-emerald-700 leading-relaxed font-medium">
                当前系统已实现同步隔离：本地开发环境（localhost）具备全功能编辑权限；局域网访问（10.5.165.76）默认锁定为“预览模式”，限制所有敏感的写操作，确保大屏展示安全。
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors shadow-sm"
          >
            我已了解
          </button>
        </div>
      </div>
    </div>
  );
};
