import React from 'react';
import { 
  LayoutDashboard, 
  Bell, 
  Activity, 
  Server, 
  Users, 
  Search, 
  LineChart, 
  Network, 
  Monitor, 
  LayoutTemplate
} from 'lucide-react';

export const Sidebar = () => {
  return (
    <div className="w-64 bg-panel border-r border-border h-full flex flex-col text-sm shadow-sm z-20">
      <div className="flex-1 overflow-y-auto py-2">
        {/* Menu Items */}
        <div className="px-3 mb-1">
          <div className="flex items-center px-3 py-2 text-text hover:bg-bg rounded cursor-pointer transition-colors">
            <LayoutDashboard className="w-4 h-4 mr-3 text-muted" />
            <span>仪表盘</span>
          </div>
        </div>

        <div className="px-3 mb-1">
          <div className="flex items-center justify-between px-3 py-2 text-text hover:bg-bg rounded cursor-pointer transition-colors">
            <div className="flex items-center">
              <Bell className="w-4 h-4 mr-3 text-muted" />
              <span>告警事件</span>
            </div>
            <span className="text-xs text-muted">v</span>
          </div>
        </div>

        <div className="mt-4 mb-2 px-6 text-xs text-muted font-medium">全景监控</div>
        
        <div className="px-3 mb-1">
          <div className="flex items-center px-3 py-2 text-text hover:bg-bg rounded cursor-pointer transition-colors">
            <Activity className="w-4 h-4 mr-3 text-muted" />
            <span>应用性能监控</span>
          </div>
        </div>

        <div className="px-3 mb-1">
          <div className="flex items-center justify-between px-3 py-2 text-text hover:bg-bg rounded cursor-pointer transition-colors">
            <div className="flex items-center">
              <Server className="w-4 h-4 mr-3 text-muted" />
              <span>基础设施监控</span>
            </div>
            <span className="text-xs text-muted">^</span>
          </div>
          {/* Sub menu */}
          <div className="ml-7 mt-1 space-y-1">
            <div className="px-4 py-2 text-text hover:bg-bg rounded cursor-pointer transition-colors">机器列表</div>
            <div className="px-4 py-2 text-text hover:bg-bg rounded cursor-pointer transition-colors">容器列表</div>
            <div className="px-4 py-2 text-text hover:bg-bg rounded cursor-pointer transition-colors">网络设备</div>
            <div className="px-4 py-2 text-text hover:bg-bg rounded cursor-pointer transition-colors">进程监控</div>
          </div>
        </div>

        <div className="px-3 mt-1 mb-1">
          <div className="flex items-center justify-between px-3 py-2 text-primary bg-primary/10 rounded cursor-pointer transition-colors font-medium">
            <div className="flex items-center">
              <LayoutTemplate className="w-4 h-4 mr-3 text-primary" />
              <span>大屏配置</span>
            </div>
          </div>
        </div>

        <div className="px-3 mb-1">
          <div className="flex items-center px-3 py-2 text-text hover:bg-bg rounded cursor-pointer transition-colors">
            <Users className="w-4 h-4 mr-3 text-muted" />
            <span>用户访问监控</span>
          </div>
        </div>

        <div className="mt-4 mb-2 px-6 text-xs text-muted font-medium">数据检索</div>

        <div className="px-3 mb-1">
          <div className="flex items-center px-3 py-2 text-text hover:bg-bg rounded cursor-pointer transition-colors">
            <LineChart className="w-4 h-4 mr-3 text-muted" />
            <span>时序指标</span>
          </div>
        </div>
        
        <div className="px-3 mb-1">
          <div className="flex items-center px-3 py-2 text-text hover:bg-bg rounded cursor-pointer transition-colors">
            <Network className="w-4 h-4 mr-3 text-muted" />
            <span>链路追踪</span>
          </div>
        </div>

        <div className="px-3 mb-1">
          <div className="flex items-center px-3 py-2 text-text hover:bg-bg rounded cursor-pointer transition-colors">
            <Search className="w-4 h-4 mr-3 text-muted" />
            <span>日志分析</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-border flex justify-between items-center text-muted">
        <Monitor className="w-5 h-5 cursor-pointer hover:text-text transition-colors" />
      </div>
    </div>
  );
};
