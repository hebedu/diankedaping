import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  Thermometer, 
  Wind, 
  Zap, 
  Cpu, 
  ShieldAlert, 
  Database,
  Info,
  Clock,
  HardDrive,
  Activity
} from 'lucide-react';

interface PhysicalMachineDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  machineName: string;
}

// --- Mock 数据 ---
const hardwareDetail = {
  name: "PM-CORE-01",
  healthStatus: "warning",
  lastReportTime: "2026-05-14 11:22:31",

  overview: {
    outletTemp: 42,
    averageRpm: 8600,
    totalPower: 152,
    cpuStatus: "ok",
    powerStatus: "ok",
    raidStatus: "warning"
  },

  temperature: {
    inletTemp: 28,
    outletTemp: 42,
    cpu0Temp: 39,
    cpu1Temp: 40,
    pchTemp: 43,
    raid0Temp: 48
  },

  fanSpeed: {
    fan0FSpeed: 8700,
    fan0RSpeed: 8600,
    fan1FSpeed: 8550,
    fan1RSpeed: 8620,
    fan2FSpeed: 8680,
    fan2RSpeed: 8590,
    fan3FSpeed: 8610,
    fan3RSpeed: 8640,
    fanM2Speed: 0
  },

  power: {
    totalPower: 152,
    psu0Pout: 80,
    psu1Pout: 72,
    cpuPower: 65
  },

  voltage: {
    p12v: 12.06,
    p5v: 5.06,
    p3v3: 3.26,
    cpuVcore: 1.08
  },

  diskStatus: {
    diskCount: 25,
    normalCount: 25,
    warningCount: 0,
    failedCount: 0,
    disks: Array.from({ length: 25 }).map((_, index) => ({
      name: `DISK${index}`,
      status: 0
    }))
  },

  componentStatus: {
    cpu0Status: 0,
    cpu1Status: 0,
    psu0Status: 0,
    psu1Status: 0,
    raid0Status: 1, // warning
    meFwStatus: 0
  },

  systemInfo: {
    bmcVersion: "4.27",
    firmwareVersion: "4.1.23",
    scrapeDuration: 0.83,
    lastUpdated: "11 秒前",
    ip: "10.5.165.76"
  }
};

// --- 通用小组件 ---
const StatusBadge = ({ status, text }: { status: 'ok' | 'warning' | 'error' | 'na', text?: string }) => {
  const configs = {
    ok: { color: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-600', label: '正常' },
    warning: { color: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-600', label: '注意' },
    error: { color: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-600', label: '异常' },
    na: { color: 'bg-slate-400', bg: 'bg-slate-50', text: 'text-slate-500', label: 'N/A' }
  };
  const config = configs[status];
  return (
    <div className={`flex items-center space-x-1.5 px-2 py-0.5 rounded border border-transparent ${config.bg}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${config.color}`} />
      <span className={`text-[11px] font-bold ${config.text}`}>{text || config.label}</span>
    </div>
  );
};

const SectionHeader = ({ title, summary, status }: { title: string, summary?: string, status?: 'ok' | 'warning' | 'error' }) => (
  <div className="flex items-center justify-between py-1">
    <div className="flex items-center space-x-2">
      <span className="text-sm font-black text-slate-800 tracking-tight">{title}</span>
      {status && (
        <div className={`w-1.5 h-1.5 rounded-full ${
          status === 'ok' ? 'bg-green-500' : status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
        }`} />
      )}
    </div>
    {summary && <span className="text-[11px] text-slate-400">{summary}</span>}
  </div>
);

// --- 子 Tab 组件 ---

// 1. 概览信息
const OverviewTab = () => {
  const { overview, temperature, systemInfo } = hardwareDetail;
  
  return (
    <div className="space-y-8">
      {/* 系统信息区块 */}
      <section>
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-1 h-3.5 bg-primary rounded-full" />
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">系统信息</h3>
        </div>
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-3 divide-x divide-slate-200 text-sm">
        <div className="flex flex-col items-center px-4">
          <span className="text-slate-400 text-[11px] mb-1 font-medium">IP 地址</span>
          <span className="font-mono font-bold text-slate-700">{systemInfo.ip}</span>
        </div>
        <div className="flex flex-col items-center px-4">
          <span className="text-slate-400 text-[11px] mb-1 font-medium">BMC 版本</span>
          <span className="font-bold text-slate-700">{systemInfo.bmcVersion}</span>
        </div>
        <div className="flex flex-col items-center px-4">
          <span className="text-slate-400 text-[11px] mb-1 font-medium">固件版本</span>
          <span className="font-bold text-slate-700">{systemInfo.firmwareVersion}</span>
        </div>
      </div>
      </section>

      {/* 概览信息区块 */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2 mb-1">
          <div className="w-1 h-3.5 bg-primary rounded-full" />
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">概览信息</h3>
        </div>
        
        {/* 指标卡片 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center space-x-2 text-slate-500 mb-2">
            <Thermometer className="w-4 h-4" />
            <span className="text-xs font-bold">当前温度</span>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className={`text-2xl font-black ${overview.outletTemp > 45 ? 'text-amber-500' : 'text-slate-800'}`}>
              {overview.outletTemp}
            </span>
            <span className="text-xs font-bold text-slate-400">°C</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">出风口温度，反映设备整体散热</p>
        </div>
        
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center space-x-2 text-slate-500 mb-2">
            <Wind className="w-4 h-4" />
            <span className="text-xs font-bold">平均转速</span>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black text-slate-800">{overview.averageRpm}</span>
            <span className="text-xs font-bold text-slate-400">RPM</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">有效风扇转速的平均值</p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center space-x-2 text-slate-500 mb-2">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-bold">当前功率</span>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black text-slate-800">{overview.totalPower}</span>
            <span className="text-xs font-bold text-slate-400">W</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">当前整机功耗</p>
        </div>
      </div>

      {/* 状态灯 */}
      <div className="flex items-center space-x-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500">CPU 状态</span>
          <StatusBadge status={overview.cpuStatus as any} />
        </div>
        <div className="w-px h-4 bg-slate-100" />
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500">电源状态</span>
          <StatusBadge status={overview.powerStatus as any} />
        </div>
      </div>

      {/* 图表预览 (SVG 模拟) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border border-slate-100 rounded-xl bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.02)]">
          <h4 className="text-xs font-black text-slate-800 mb-6 flex items-center justify-between">
            最近 24 小时温度曲线
          </h4>
          <div className="h-40 w-full flex flex-col">
            <div className="flex-1 flex space-x-2">
              {/* Y轴标签 */}
              <div className="flex flex-col justify-between text-[9px] font-mono text-slate-300 pb-5 pt-1">
                <span>60°C</span>
                <span>40°C</span>
                <span>20°C</span>
                <span className="text-slate-200">0°C</span>
              </div>
              {/* 图表主体 */}
              <div className="flex-1 relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                  {/* 网格参考线 */}
                  <line x1="0" y1="0" x2="100" y2="0" stroke="#f8fafc" strokeWidth="0.5" />
                  <line x1="0" y1="13.3" x2="100" y2="13.3" stroke="#f8fafc" strokeWidth="0.5" />
                  <line x1="0" y1="26.6" x2="100" y2="26.6" stroke="#f8fafc" strokeWidth="0.5" />
                  
                  {/* 核心阈值线 (红色/黄色) */}
                  <line x1="0" y1="8" x2="100" y2="8" stroke="#EF4444" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.6" />
                  <line x1="0" y1="15" x2="100" y2="15" stroke="#F59E0B" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.6" />
                  
                  {/* 底部基准轴 */}
                  <line x1="0" y1="40" x2="100" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                  
                  {/* 模拟曲线 */}
                  <path d="M0,30 Q10,25 20,28 T40,20 T60,22 T80,18 T100,21" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M0,20 Q10,18 20,19 T40,15 T60,16 T80,12 T100,14" fill="none" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
                </svg>
              </div>
            </div>
            {/* X轴标签 */}
            <div className="flex justify-between pl-8 text-[9px] font-mono text-slate-300 mt-2">
              <span>24h前</span>
              <span>12h前</span>
              <span>现在</span>
            </div>
          </div>
        </div>

        <div className="p-4 border border-slate-100 rounded-xl bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.02)]">
          <h4 className="text-xs font-black text-slate-800 mb-6 flex items-center justify-between">
            最近 24 小时功耗曲线
          </h4>
          <div className="h-40 w-full flex flex-col">
            <div className="flex-1 flex space-x-2">
              {/* Y轴标签 */}
              <div className="flex flex-col justify-between text-[9px] font-mono text-slate-300 pb-5 pt-1">
                <span>400W</span>
                <span>200W</span>
                <span className="text-slate-200">0W</span>
              </div>
              {/* 图表主体 */}
              <div className="flex-1 relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                  {/* 网格参考线 */}
                  <line x1="0" y1="0" x2="100" y2="0" stroke="#f8fafc" strokeWidth="0.5" />
                  <line x1="0" y1="20" x2="100" y2="20" stroke="#f8fafc" strokeWidth="0.5" />
                  
                  {/* 底部基准轴 */}
                  <line x1="0" y1="40" x2="100" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                  
                  {/* 模拟曲线 */}
                  <path d="M0,35 Q10,32 20,33 T40,28 T60,30 T80,25 T100,27" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M0,38 Q10,36 20,37 T40,32 T60,34 T80,29 T100,31" fill="none" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
                </svg>
              </div>
            </div>
            {/* X轴标签 */}
            <div className="flex justify-between pl-8 text-[9px] font-mono text-slate-300 mt-2">
              <span>24h前</span>
              <span>12h前</span>
              <span>现在</span>
            </div>
          </div>
        </div>
      </div>
      </section>
    </div>
  );
};

// 2. 传感器数据
const SensorsTab = () => {
  const [openSections, setOpenSections] = useState<string[]>(['temp', 'fan', 'power', 'volt', 'sensors']);
  
  const toggleSection = (id: string) => {
    setOpenSections(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const { temperature, fanSpeed, power, voltage, diskStatus, componentStatus } = hardwareDetail;

  return (
    <div className="space-y-2">
      {/* 温度监控 */}
      <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
        <div 
          onClick={() => toggleSection('temp')}
          className="p-3 bg-white cursor-pointer flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <SectionHeader title="温度监控" />
          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${openSections.includes('temp') ? 'rotate-90' : ''}`} />
        </div>
        {openSections.includes('temp') && (
          <div className="p-4 pt-0 bg-white border-t border-slate-50">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-50">
                  <th className="text-left py-2 font-bold">传感器</th>
                  <th className="text-left py-2 font-bold">当前值</th>
                  <th className="text-left py-2 font-bold">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { name: '进风温度', val: temperature.inletTemp },
                  { name: '出风温度', val: temperature.outletTemp },
                  { name: 'CPU0 温度', val: temperature.cpu0Temp },
                  { name: 'CPU1 温度', val: temperature.cpu1Temp },
                  { name: 'PCH 温度', val: temperature.pchTemp },
                  { name: 'RAID 卡温度', val: temperature.raid0Temp },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="py-2 text-slate-600 font-bold">{row.name}</td>
                    <td className="py-2 font-mono">{row.val}°C</td>
                    <td className="py-2"><StatusBadge status={row.val > 45 ? 'warning' : 'ok'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 风扇监控 */}
      <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
        <div 
          onClick={() => toggleSection('fan')}
          className="p-3 bg-white cursor-pointer flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <SectionHeader title="风扇监控" />
          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${openSections.includes('fan') ? 'rotate-90' : ''}`} />
        </div>
        {openSections.includes('fan') && (
          <div className="p-4 pt-0 bg-white border-t border-slate-50">
             <table className="w-full text-xs">
              <tbody className="divide-y divide-slate-50">
                {Object.entries(fanSpeed).map(([key, val], i) => (
                  <tr key={i}>
                    <td className="py-2 text-slate-600 font-bold uppercase tracking-tight">{key.replace('fan', 'FAN ')}</td>
                    <td className="py-2 font-mono">{val === 0 ? 'N/A' : `${val} RPM`}</td>
                    <td className="py-2"><StatusBadge status={val === 0 ? 'na' : 'ok'} text={val === 0 ? '未连接' : '正常'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 电源功耗 */}
      <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
        <div 
          onClick={() => toggleSection('power')}
          className="p-3 bg-white cursor-pointer flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <SectionHeader title="电源与功耗" />
          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${openSections.includes('power') ? 'rotate-90' : ''}`} />
        </div>
        {openSections.includes('power') && (
          <div className="p-4 pt-0 bg-white border-t border-slate-50">
             <table className="w-full text-xs">
              <tbody className="divide-y divide-slate-50">
                <tr>
                  <td className="py-2 text-slate-600 font-bold">整机功耗</td>
                  <td className="py-2 font-mono">{power.totalPower}W</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-600 font-bold">PSU0 输出</td>
                  <td className="py-2 font-mono">{power.psu0Pout}W</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-600 font-bold">PSU1 输出</td>
                  <td className="py-2 font-mono">{power.psu1Pout}W</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

       {/* 电压监控 */}
       <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
        <div 
          onClick={() => toggleSection('volt')}
          className="p-3 bg-white cursor-pointer flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <SectionHeader title="电压监控" />
          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${openSections.includes('volt') ? 'rotate-90' : ''}`} />
        </div>
        {openSections.includes('volt') && (
          <div className="p-4 pt-0 bg-white border-t border-slate-50">
             <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-50 text-[10px]">
                  <th className="text-left py-2">电压轨</th>
                  <th className="text-left py-2">标准值</th>
                  <th className="text-left py-2">当前值</th>
                  <th className="text-left py-2">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { name: 'P12V', std: '12V', cur: voltage.p12v, diff: '+0.5%' },
                  { name: 'P5V', std: '5V', cur: voltage.p5v, diff: '+1.2%' },
                  { name: 'P3V3', std: '3.3V', cur: voltage.p3v3, diff: '-1.2%' },
                  { name: 'CPU Vcore', std: '-', cur: voltage.cpuVcore, diff: '-' },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="py-2 text-slate-600 font-bold">{row.name}</td>
                    <td className="py-2 text-slate-400">{row.std}</td>
                    <td className="py-2 font-mono font-bold">{row.cur}V</td>
                    <td className="py-2"><StatusBadge status="ok" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 硬盘与组件 */}
      <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
        <div 
          onClick={() => toggleSection('sensors')}
          className="p-3 bg-white cursor-pointer flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <SectionHeader title="硬盘与组件状态" />
          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${openSections.includes('sensors') ? 'rotate-90' : ''}`} />
        </div>
        {openSections.includes('sensors') && (
          <div className="p-4 bg-white border-t border-slate-50 space-y-6">
            {/* 槽位矩阵 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-500">硬盘槽位矩阵</span>
                <div className="flex items-center space-x-3 text-[10px]">
                  <div className="flex items-center space-x-1"><div className="w-2 h-2 bg-green-500 rounded-sm" /><span>正常</span></div>
                  <div className="flex items-center space-x-1"><div className="w-2 h-2 bg-amber-500 rounded-sm" /><span>注意</span></div>
                  <div className="flex items-center space-x-1"><div className="w-2 h-2 bg-red-500 rounded-sm" /><span>故障</span></div>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {diskStatus.disks.map((disk, i) => (
                  <div key={i} className="flex flex-col items-center p-1.5 bg-slate-50 rounded border border-slate-100">
                    <Database className={`w-3.5 h-3.5 mb-1 ${disk.status === 0 ? 'text-green-500' : 'text-amber-500'}`} />
                    <span className="text-[8px] font-mono text-slate-400">{disk.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 核心组件 */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 block">核心组件状态</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'CPU0', status: componentStatus.cpu0Status },
                  { name: 'CPU1', status: componentStatus.cpu1Status },
                  { name: 'PSU0', status: componentStatus.psu0Status },
                  { name: 'PSU1', status: componentStatus.psu1Status },
                  { name: 'RAID0', status: componentStatus.raid0Status },
                  { name: 'ME FW', status: componentStatus.meFwStatus },
                ].map((comp, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                    <span className="text-xs font-bold text-slate-700">{comp.name}</span>
                    <div className="flex items-center space-x-2">
                      {comp.desc && <span className="text-[9px] text-amber-500">{comp.desc}</span>}
                      <StatusBadge status={comp.status === 0 ? 'ok' : comp.status === 1 ? 'warning' : 'error'} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const PhysicalMachineDrawer = ({ isOpen, onClose, machineName }: PhysicalMachineDrawerProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sensors'>('overview');
  
  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      {/* 遮罩层 */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px] animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* 抽屉面板 */}
      <div className="relative w-[720px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* 头部 */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-base font-black text-slate-800 tracking-tight">物理机详情</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab 导航 */}
        <div className="px-6 border-b border-slate-100 flex space-x-8">
          {[
            { id: 'overview', label: '基本信息' },
            { id: 'sensors', label: '传感器数据' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 text-sm font-black relative transition-colors ${
                activeTab === tab.id ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>{tab.label}</span>
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
            </button>
          ))}
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'sensors' && <SensorsTab />}
        </div>


      </div>
    </div>
  );
};
