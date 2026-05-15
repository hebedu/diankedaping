import React, { useState } from 'react';
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
  LayoutTemplate,
  ChevronDown
} from 'lucide-react';
import { useStore } from '../../store/useStore';

interface NavMenuItemProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  hasSubmenu?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  children?: React.ReactNode;
}

const NavMenuItem = ({ 
  icon: Icon, 
  label, 
  isActive = false, 
  hasSubmenu = false, 
  isOpen = false, 
  onToggle,
  children 
}: NavMenuItemProps) => {
  return (
    <div className="px-3 mb-1">
      <div 
        onClick={onToggle}
        className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer transition-all duration-200 ${
          isActive 
            ? 'text-primary bg-primary/10 font-medium' 
            : 'text-text hover:bg-bg hover:text-primary group'
        }`}
      >
        <div className="flex items-center">
          <Icon className={`w-4 h-4 mr-3 transition-colors ${
            isActive ? 'text-primary' : 'text-muted group-hover:text-primary'
          }`} />
          <span>{label}</span>
        </div>
        {hasSubmenu && (
          <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : 'group-hover:text-primary'
          }`} />
        )}
      </div>
      {hasSubmenu && isOpen && (
        <div className="ml-7 mt-1 space-y-1 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

const SubMenuItem = ({ 
  label, 
  isActive = false, 
  onClick 
}: { 
  label: string; 
  isActive?: boolean; 
  onClick?: () => void;
}) => (
  <div 
    onClick={onClick}
    className={`px-4 py-1.5 text-xs rounded cursor-pointer transition-colors ${
      isActive 
        ? 'text-primary bg-primary/5 font-medium' 
        : 'text-muted hover:text-primary hover:bg-bg'
    }`}
  >
    {label}
  </div>
);

export const Sidebar = () => {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'infrastructure': true,
    'alerts': false
  });
  const { activeMenu, setActiveMenu } = useStore();

  const toggleMenu = (id: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="w-64 bg-panel border-r border-border h-full flex flex-col text-sm shadow-sm z-20">
      <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        {/* Main Menu */}
        <NavMenuItem 
          icon={LayoutDashboard} 
          label="仪表盘" 
          isActive={activeMenu === 'dashboard'}
          onToggle={() => setActiveMenu('dashboard')}
        />
        
        <NavMenuItem 
          icon={Bell} 
          label="告警事件" 
          hasSubmenu 
          isOpen={openMenus['alerts']}
          onToggle={() => toggleMenu('alerts')}
        >
          <SubMenuItem label="待处理告警" />
          <SubMenuItem label="历史记录" />
        </NavMenuItem>

        <div className="mt-6 mb-2 px-6 text-[11px] text-muted font-bold uppercase tracking-wider opacity-60">全景监控</div>
        
        <NavMenuItem 
          icon={Activity} 
          label="应用性能监控" 
          isActive={activeMenu === 'apm'}
          onToggle={() => setActiveMenu('apm')}
        />
        
        <NavMenuItem 
          icon={Server} 
          label="基础设施监控" 
          hasSubmenu 
          isOpen={openMenus['infrastructure']}
          onToggle={() => toggleMenu('infrastructure')}
        >
          <SubMenuItem 
            label="机器列表" 
            isActive={activeMenu === 'machine-list'}
            onClick={() => setActiveMenu('machine-list')}
          />
          <SubMenuItem 
            label="物理机列表" 
            isActive={activeMenu === 'physical-machine-list'}
            onClick={() => setActiveMenu('physical-machine-list')}
          />
          <SubMenuItem label="容器列表" />
          <SubMenuItem label="网络设备" />
          <SubMenuItem label="进程监控" />
        </NavMenuItem>

        <NavMenuItem 
          icon={LayoutTemplate} 
          label="大屏拓扑配置" 
          isActive={activeMenu === 'topology-config'} 
          onToggle={() => setActiveMenu('topology-config')}
        />

        <NavMenuItem icon={Users} label="用户访问监控" />

        <div className="mt-6 mb-2 px-6 text-[11px] text-muted font-bold uppercase tracking-wider opacity-60">数据检索</div>

        <NavMenuItem icon={LineChart} label="时序指标" />
        <NavMenuItem icon={Network} label="链路追踪" />
        <NavMenuItem icon={Search} label="日志分析" />
      </div>
      
      <div className="p-4 border-t border-border flex justify-between items-center text-muted bg-slate-50/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-text">管理员</span>
            <span className="text-[10px] opacity-70">在线</span>
          </div>
        </div>
        <Monitor className="w-4 h-4 cursor-pointer hover:text-primary transition-colors" />
      </div>
    </div>
  );
};
