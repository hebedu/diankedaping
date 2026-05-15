import React, { useState } from 'react';
import { PhysicalMachineDrawer } from './PhysicalMachineDrawer';
import { 
  Search, 
  Settings, 
  RefreshCw, 
  ChevronDown, 
  AlertCircle
} from 'lucide-react';

interface MachineType {
  id: string;
  name: string;
  ip: string;
  manufacturer?: string;
  firmwareVersion?: string;
  bmcVersion?: string;
  assetLocation: string;
  powerStatus: string;
  collectStatus: string;
  temperature: string;
  fanStatus: string;
  totalPower: string;
  powerLoad: string;
}

const initialMockData: MachineType[] = [
  {
    id: '1',
    name: 'PM-CORE-01',
    ip: '10.5.165.76',
    manufacturer: '浪潮 (Inspur)',
    firmwareVersion: 'V4.27',
    bmcVersion: 'V2.11',
    assetLocation: '10.5.165.76 / Inspur',
    powerStatus: '开机',
    collectStatus: '成功',
    temperature: '21°C / 26°C',
    fanStatus: '正常',
    totalPower: '160W',
    powerLoad: '35%'
  },
  {
    id: '2',
    name: 'PM-EDGE-02',
    ip: '10.5.165.77',
    manufacturer: '戴尔 (Dell)',
    firmwareVersion: '1.5.0',
    bmcVersion: '3.21.30',
    assetLocation: '机柜 A-02',
    powerStatus: '关机',
    collectStatus: '失败',
    temperature: 'N/A',
    fanStatus: '异常',
    totalPower: '0W',
    powerLoad: '0%'
  },
  {
    id: '3',
    name: 'PM-GPU-03',
    ip: '10.5.165.78',
    manufacturer: '华为 (Huawei)',
    firmwareVersion: 'V5.12',
    bmcVersion: 'iMana 200',
    assetLocation: '机柜 B-01',
    powerStatus: '开机',
    collectStatus: '成功',
    temperature: '25°C / 32°C',
    fanStatus: '正常',
    totalPower: '450W',
    powerLoad: '65%'
  },
  {
    id: '4',
    name: 'PM-STG-04',
    ip: '10.5.165.79',
    manufacturer: '新华三 (H3C)',
    firmwareVersion: 'G3-1.02',
    bmcVersion: 'HDM-1.12',
    assetLocation: '机柜 C-05',
    powerStatus: '开机',
    collectStatus: '成功',
    temperature: '22°C / 28°C',
    fanStatus: '正常',
    totalPower: '280W',
    powerLoad: '40%'
  },
  {
    id: '5',
    name: 'PM-WEB-05',
    ip: '10.5.165.80',
    manufacturer: '浪潮 (Inspur)',
    firmwareVersion: 'V5.0.2',
    bmcVersion: 'ISPM-2.0',
    assetLocation: '机柜 A-08',
    powerStatus: '开机',
    collectStatus: '成功',
    temperature: '20°C / 24°C',
    fanStatus: '正常',
    totalPower: '180W',
    powerLoad: '30%'
  },
  {
    id: '6',
    name: 'PM-DB-06',
    ip: '10.5.165.81',
    manufacturer: '戴尔 (Dell)',
    firmwareVersion: '2.1.4',
    bmcVersion: 'iDRAC 9',
    assetLocation: '机柜 D-02',
    powerStatus: '开机',
    collectStatus: '成功',
    temperature: '24°C / 30°C',
    fanStatus: '正常',
    totalPower: '320W',
    powerLoad: '55%'
  },
  {
    id: '7',
    name: 'PM-TEST-07',
    ip: '10.5.165.82',
    manufacturer: '惠普 (HP)',
    firmwareVersion: 'U30 2.42',
    bmcVersion: 'iLO 5',
    assetLocation: '机柜 T-01',
    powerStatus: '开机',
    collectStatus: '警告',
    temperature: '28°C / 38°C',
    fanStatus: '正常',
    totalPower: '210W',
    powerLoad: '45%'
  },
  {
    id: '8',
    name: 'PM-CDN-08',
    ip: '10.5.165.83',
    manufacturer: '华为 (Huawei)',
    firmwareVersion: 'ARM-V1.0',
    bmcVersion: 'iMana 300',
    assetLocation: '机柜 E-04',
    powerStatus: '开机',
    collectStatus: '成功',
    temperature: '19°C / 23°C',
    fanStatus: '正常',
    totalPower: '120W',
    powerLoad: '25%'
  },
  {
    id: '9',
    name: 'PM-BK-09',
    ip: '10.5.165.84',
    manufacturer: '曙光 (Sugon)',
    firmwareVersion: 'V3.2.1',
    bmcVersion: 'SMC-1.5',
    assetLocation: '机柜 C-09',
    powerStatus: '关机',
    collectStatus: '成功',
    temperature: 'N/A',
    fanStatus: '正常',
    totalPower: '0W',
    powerLoad: '0%'
  },
  {
    id: '10',
    name: 'PM-CORE-10',
    ip: '10.5.165.85',
    manufacturer: '浪潮 (Inspur)',
    firmwareVersion: 'V5.2.1',
    bmcVersion: 'ISPM-3.0',
    assetLocation: '机柜 A-01',
    powerStatus: '开机',
    collectStatus: '成功',
    temperature: '22°C / 27°C',
    fanStatus: '正常',
    totalPower: '580W',
    powerLoad: '75%'
  }
];

export const PhysicalMachineList = () => {
  const [machineList] = useState<MachineType[]>(initialMockData);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedMachineName, setSelectedMachineName] = useState('');

  const openDetails = (name: string) => {
    setSelectedMachineName(name);
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-transparent relative overflow-hidden">
      {/* 顶部标题 */}
      <div className="px-6 py-4 flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[#1d2129]">物理机列表</h2>
      </div>

      <div className="mx-6 mb-6 flex-1 bg-white flex flex-col overflow-hidden shadow-sm rounded-sm">
        {/* 工具栏 */}
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* 搜索框 */}
            <div className="relative group flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-[#86909c] group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="搜索管理 IP"
                className="pl-9 pr-4 py-1.5 w-64 bg-white border border-[#e5e6eb] rounded text-sm text-[#1d2129] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-[#86909c]"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="p-1.5 text-[#4e5969] hover:text-[#1d2129] hover:bg-[#f2f3f5] rounded transition-all">
              <Settings className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-[#4e5969] hover:text-[#1d2129] hover:bg-[#f2f3f5] rounded transition-all">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 表格区域 */}
        <div className="flex-1 overflow-x-auto px-6 pb-0">
          <div className="min-w-max">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#f7f8fa] border-b border-[#e5e6eb]">
                  <th className="px-4 py-3 text-[13px] font-medium text-[#4e5969] whitespace-nowrap">管理 IP</th>
                  <th className="px-4 py-3 text-[13px] font-medium text-[#4e5969] whitespace-nowrap">厂商</th>
                  <th className="px-4 py-3 text-[13px] font-medium text-[#4e5969] whitespace-nowrap">固件版本</th>
                  <th className="px-4 py-3 text-[13px] font-medium text-[#4e5969] whitespace-nowrap">BMC版本</th>
                  <th className="px-4 py-3 text-[13px] font-medium text-[#4e5969] whitespace-nowrap">电源状态</th>
                  <th className="px-4 py-3 text-[13px] font-medium text-[#4e5969] whitespace-nowrap">温度</th>
                  <th className="px-4 py-3 text-[13px] font-medium text-[#4e5969] whitespace-nowrap">风扇状态</th>
                  <th className="px-4 py-3 text-[13px] font-medium text-[#4e5969] whitespace-nowrap">总功率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e6eb]">
              {machineList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-4 py-3.5 text-sm">
                    <span 
                      onClick={() => openDetails(item.name)}
                      className="text-blue-600 font-medium hover:text-blue-700 cursor-pointer font-mono whitespace-nowrap"
                    >
                      {item.ip}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#1d2129] whitespace-nowrap">{item.manufacturer || '-'}</td>
                  <td className="px-4 py-3.5 text-sm text-[#1d2129] font-mono whitespace-nowrap">{item.firmwareVersion || '-'}</td>
                  <td className="px-4 py-3.5 text-sm text-[#1d2129] font-mono whitespace-nowrap">{item.bmcVersion || '-'}</td>
                  <td className="px-4 py-3.5 text-sm">
                    <div className="flex items-center space-x-1.5">
                      <div className={`w-2 h-2 rounded-full ${item.powerStatus === '开机' ? 'bg-[#00b42a]' : 'bg-[#c9cdd4]'}`} />
                      <span className="text-[#1d2129] whitespace-nowrap">{item.powerStatus}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#1d2129] whitespace-nowrap">
                    {item.temperature.includes('/') ? (
                      <div className="flex items-center space-x-1.5 text-xs">
                        <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 flex items-center space-x-1">
                          <span className="text-[10px] scale-90">进</span><span className="font-mono font-medium">{item.temperature.split('/')[0].trim()}</span>
                        </span>
                        <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 flex items-center space-x-1">
                          <span className="text-[10px] scale-90">出</span><span className="font-mono font-medium">{item.temperature.split('/')[1].trim()}</span>
                        </span>
                      </div>
                    ) : (
                      <span className="text-[#86909c] text-xs px-2">{item.temperature}</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-sm">
                    <span className={item.fanStatus === '正常' ? 'text-[#1d2129]' : 'text-[#f53f3f] font-medium'}>
                      {item.fanStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#1d2129] font-mono">{item.totalPower}</td>
                </tr>
              ))}
              {machineList.length === 0 && (
                <tr className="h-[400px]">
                  <td colSpan={8} className="text-center py-20">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center">
                           <div className="w-10 h-12 bg-white rounded border border-slate-200 flex flex-col p-1 space-y-1 shadow-sm">
                              <div className="w-full h-1 bg-slate-100 rounded"></div>
                              <div className="w-2/3 h-1 bg-slate-100 rounded"></div>
                              <div className="w-full h-1 bg-slate-100 rounded"></div>
                           </div>
                        </div>
                        <div className="absolute -right-1 -bottom-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                          <AlertCircle className="w-4 h-4 text-slate-300" />
                        </div>
                      </div>
                      <span className="text-sm text-muted">暂无数据</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
        
        {/* 分页组件 */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-[#e5e6eb] bg-white text-[13px]">
          <div className="text-[#4e5969]">共 {machineList.length} 条数据</div>
          <div className="flex items-center space-x-1 text-[#1d2129]">
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#f2f3f5] text-[#86909c] transition-colors">&lt;</button>
            <button className="w-7 h-7 flex items-center justify-center rounded bg-blue-50 text-blue-600 border border-blue-100 font-medium">1</button>
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#f2f3f5] text-[#86909c] transition-colors">&gt;</button>
            <div className="ml-3 flex items-center space-x-1 border border-[#e5e6eb] rounded px-2 py-1 cursor-pointer hover:border-blue-500 transition-colors bg-white">
               <span>10 条/页</span>
               <ChevronDown className="w-3.5 h-3.5 text-[#86909c]" />
            </div>
          </div>
        </div>
      </div>

      <PhysicalMachineDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        machineName={selectedMachineName}
      />
    </div>
  );
};
