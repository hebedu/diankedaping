import { X, Trash2, Network } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const ConnectionModal = () => {
  const { 
    isConnectionModalOpen, 
    setConnectionModalOpen, 
    pendingConnection, 
    removeConnection,
    nodes 
  } = useStore();
  
  if (!isConnectionModalOpen || !pendingConnection) return null;

  const getElementName = (id?: string) => {
    if (!id) return '未知';
    const node = nodes.find(n => n.id === id);
    return node ? node.name : '未知节点';
  };

  const handleDelete = () => {
    if (pendingConnection?.id) {
      if (window.confirm('确定要删除这条连接关系吗？')) {
        removeConnection(pendingConnection.id);
        setConnectionModalOpen(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[420px] animate-in fade-in zoom-in duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/30">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Network className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-base font-black text-slate-800 tracking-tight">连接关系</h3>
          </div>
          <button 
            onClick={() => setConnectionModalOpen(false)}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 text-center">
              <div className="py-3 px-4 bg-slate-50 rounded-xl border border-slate-100 text-xs font-black text-slate-700 truncate shadow-sm">
                {getElementName(pendingConnection.source)}
              </div>
            </div>
            
            <div className="flex flex-col items-center pt-4">
              <div className="h-[2px] w-12 bg-slate-200 rounded-full relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-slate-300 rounded-full border-2 border-white shadow-sm"></div>
              </div>
            </div>

            <div className="flex-1 text-center">
              <div className="py-3 px-4 bg-slate-50 rounded-xl border border-slate-100 text-xs font-black text-slate-700 truncate shadow-sm">
                {getElementName(pendingConnection.target)}
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 flex items-start space-x-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
            <p className="text-xs text-blue-700/80 leading-relaxed font-medium">
              该连接仅表示两个节点之间存在拓扑关系，不区分方向。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-5 bg-slate-50/50 border-t border-slate-100">
          <button 
            onClick={handleDelete}
            className="flex items-center space-x-2 px-4 py-2.5 text-xs font-black text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-95 group"
          >
            <Trash2 className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            <span>删除连接</span>
          </button>
          
          <button 
            onClick={() => setConnectionModalOpen(false)}
            className="px-8 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 text-xs font-black rounded-xl shadow-sm hover:shadow active:scale-95 transition-all"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
