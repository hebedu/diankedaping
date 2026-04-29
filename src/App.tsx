import React from 'react';
import { useStore } from './store/useStore';
import { Toolbar } from './components/layout/Toolbar';
import { LeftPanel } from './components/panels/LeftPanel';
import { RightPanel } from './components/panels/RightPanel';
import { TopologyCanvas } from './components/topology/TopologyCanvas';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { RegionModal } from './components/modals/RegionModal';
import { NodeModal } from './components/modals/NodeModal';
import { ConnectionModal } from './components/modals/ConnectionModal';
import { ReactFlowProvider } from 'reactflow';

function App() {
  const { isPreview } = useStore();

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-bg text-text font-sans">
      <RegionModal />
      <NodeModal />
      <ConnectionModal />
      {/* 全局顶栏 */}
      <Header />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* 全局左侧菜单 */}
        <Sidebar />

        {/* 主内容区（当前页内容） */}
        <div className="flex flex-col flex-1 overflow-hidden relative bg-white m-4 rounded-xl border border-border shadow-sm">
          {/* 拓扑编辑器顶部工具栏 */}
          <Toolbar />
          
          {/* 预览模式提示 */}
          {isPreview && (
            <div className="bg-primary/10 text-primary py-1 px-4 text-sm text-center border-b border-primary/20 font-medium tracking-wide">
              当前为预览模式，不会影响大屏展示
            </div>
          )}

          {/* 编辑器主体内容 */}
          <div className="flex flex-1 overflow-hidden relative bg-slate-50/50">
            {/* 拓扑左侧面板 */}
            {!isPreview && <LeftPanel />}

            {/* 拓扑画布 (核心) */}
            <div className="flex-1 relative h-full flex overflow-hidden">
              <ReactFlowProvider>
                <div className="flex-1 relative">
                  <TopologyCanvas />
                </div>
                {!isPreview && <RightPanel />}
              </ReactFlowProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
