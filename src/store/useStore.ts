import { create } from 'zustand';
import type { TopologyNode, Region, Connection, Device, SubTopology } from '../types';
import type { HelperLine } from '../utils/snapHelper';

interface ViewState {
  mode: 'main' | 'sub';
  activeSubTopologyId?: string;
  selectedElementId?: string;
  selectedElementType?: 'node' | 'region' | 'connection';
  isPreview: boolean;
  
  // Modals & Forms State
  isRegionModalOpen: boolean;
  editingRegion: Partial<Region> | null;
  
  isNodeModalOpen: boolean;
  editingNode: Partial<TopologyNode> | null;
  
  isConnectionModalOpen: boolean;
  pendingConnection: Partial<Connection> | null;
  helperLines: HelperLine[];
  isLeftPanelOpen: boolean;
  hoveredNodeId: string | null;
}

export type ConfigStatus = '已发布' | '已保存草稿' | '有未保存修改' | '基于已发布版本编辑中';

export interface Snapshot {
  regions: Region[];
  nodes: TopologyNode[];
  connections: Connection[];
}

interface AppState extends ViewState {
  regions: Region[];
  nodes: TopologyNode[];
  connections: Connection[];
  
  // Mock Data for selection
  availableDevices: Device[];
  availableSubTopologies: SubTopology[];

  // History State
  past: Snapshot[];
  future: Snapshot[];
  
  // Configuration Lifecycle
  configStatus: ConfigStatus;
  isConnectionMode: boolean;
  isConnectingLine: boolean;
  
  // Actions
  setViewMode: (mode: 'main' | 'sub', subId?: string) => void;
  selectElement: (id: string, type: 'node' | 'region' | 'connection') => void;
  clearSelection: () => void;
  setPreview: (isPreview: boolean) => void;
  
  setRegionModalOpen: (isOpen: boolean, editingData?: Partial<Region> | null) => void;
  setNodeModalOpen: (isOpen: boolean, editingData?: Partial<TopologyNode> | null) => void;
  setConnectionModalOpen: (isOpen: boolean, pendingData?: Partial<Connection> | null) => void;
  setConnectionMode: (isMode: boolean) => void;
  setConnectingLine: (isConnecting: boolean) => void;
  setReactFlowInstance: (instance: any) => void;
  setHelperLines: (lines: HelperLine[]) => void;
  setLeftPanelOpen: (isOpen: boolean) => void;
  setHoveredNodeId: (id: string | null) => void;

  // History Actions
  saveHistory: () => void;
  undo: () => void;
  redo: () => void;
  
  // Lifecycle Actions
  saveDraft: () => void;
  publishConfig: () => void;

  addRegion: (region: Region) => void;
  updateRegion: (id: string, region: Partial<Region>) => void;
  removeRegion: (id: string) => void;

  addNode: (node: TopologyNode) => void;
  updateNode: (id: string, node: Partial<TopologyNode>) => void;
  removeNode: (id: string) => void;

  addConnection: (conn: Connection) => void;
  updateConnection: (id: string, conn: Partial<Connection>) => void;
  removeConnection: (id: string) => void;
}

// 预置 Mock 数据
const initialRegions: Region[] = [
  { id: 'r1', name: '外部用户区', type: 'external', position: { x: -350, y: 150 }, width: 250, height: 250 },
  { id: 'r2', name: '核心网络安全域', type: 'security', position: { x: 0, y: 50 }, width: 450, height: 350 },
  { id: 'r3', name: '算力服务区', type: 'compute', position: { x: 550, y: 50 }, width: 400, height: 400 },
  { id: 'r4', name: '数据服务区', type: 'data', position: { x: 1050, y: 50 }, width: 400, height: 400 },
  { id: 'r5', name: '运维区', type: 'ops', position: { x: 0, y: 450 }, width: 450, height: 300 },
];

const initialNodes: TopologyNode[] = [
  { id: 'n1', name: '边界防火墙', iconType: 'firewall', relationType: 'device', relatedDeviceIds: ['d1'], regionId: 'r2', position: { x: 50, y: 80 } },
  { id: 'n2', name: '核心路由器', iconType: 'router', relationType: 'device', relatedDeviceIds: ['d2'], regionId: 'r2', position: { x: 250, y: 80 } },
  { id: 'n3', name: '运维堡垒机', iconType: 'server', relationType: 'device', relatedDeviceIds: ['d3'], regionId: 'r5', position: { x: 160, y: 100 } },
  { id: 'n4', name: '交换机集群 A', iconType: 'group', relationType: 'subTopology', relatedTopologyId: 't1', regionId: 'r2', position: { x: 250, y: 220 } },
  { id: 'n5', name: '服务器集群 A', iconType: 'group', relationType: 'subTopology', relatedTopologyId: 't2', regionId: 'r3', position: { x: 130, y: 150 } },
];

const initialConnections: Connection[] = [
  { id: 'c2', source: 'n1', target: 'n2', type: 'default', direction: '单向', status: '正常' },
  { id: 'c3', source: 'n2', target: 'n4', type: 'default', direction: '单向', status: '正常' },
  { id: 'c4', source: 'n4', target: 'n5', type: 'default', direction: '单向', status: '正常' },
  { id: 'c5', source: 'n3', target: 'n4', type: 'default', direction: '单向', status: '正常' },
];

const mockDevices: Device[] = [
  { id: 'd1', name: 'FW-01', ip: '192.168.1.1', type: '防火墙', status: '正常' },
  { id: 'd2', name: 'Router-01', ip: '192.168.1.2', type: '路由器', status: '正常' },
  { id: 'd3', name: 'Bastion-01', ip: '10.0.0.5', type: '服务器', status: '正常' },
  { id: 'd4', name: 'Server-01', ip: '192.168.3.1', type: '服务器', status: '异常' },
  { id: 'd5', name: 'Switch-01', ip: '192.168.2.1', type: '交换机', status: '正常' },
];

const mockSubTopologies: SubTopology[] = [
  { id: 't1', name: '交换机子拓扑', nodeCount: 8, updatedAt: '2024-03-20' },
  { id: 't2', name: '服务器子拓扑', nodeCount: 12, updatedAt: '2024-03-19' },
  { id: 't3', name: '核心安全域拓扑', nodeCount: 5, updatedAt: '2024-03-18' },
];

export const useStore = create<AppState>((set) => ({
  mode: 'main',
  isPreview: false,
  isRegionModalOpen: false,
  editingRegion: null,
  isNodeModalOpen: false,
  editingNode: null,
  isConnectionModalOpen: false,
  pendingConnection: null,
  reactFlowInstance: null,
  helperLines: [],
  isLeftPanelOpen: true,
  hoveredNodeId: null,
  
  regions: initialRegions,
  nodes: initialNodes,
  connections: initialConnections,
  availableDevices: mockDevices,
  availableSubTopologies: mockSubTopologies,
  
  past: [],
  future: [],
  configStatus: '基于已发布版本编辑中',
  isConnectionMode: false,

  saveHistory: () => set((state) => {
    const snapshot: Snapshot = {
      regions: state.regions,
      nodes: state.nodes,
      connections: state.connections,
    };
    return {
      past: [...state.past, snapshot],
      future: [],
      configStatus: '有未保存修改',
    };
  }),

  isConnectingLine: false,
  setConnectingLine: (isConnecting) => set({ isConnectingLine: isConnecting }),
  setReactFlowInstance: (instance) => set({ reactFlowInstance: instance }),
  setHelperLines: (lines) => set({ helperLines: lines }),
  setLeftPanelOpen: (isOpen) => set({ isLeftPanelOpen: isOpen }),
  setHoveredNodeId: (id) => set({ hoveredNodeId: id }),

  setConnectionMode: (isMode) => set({ isConnectionMode: isMode }),

  saveDraft: () => set({ configStatus: '已保存草稿' }),
  
  publishConfig: () => set({ configStatus: '已发布', past: [], future: [] }),

  undo: () => set((state) => {
    if (state.past.length === 0) return state;
    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, -1);
    const current: Snapshot = {
      regions: state.regions,
      nodes: state.nodes,
      connections: state.connections,
    };
    return {
      past: newPast,
      future: [current, ...state.future],
      regions: previous.regions,
      nodes: previous.nodes,
      connections: previous.connections,
      configStatus: '有未保存修改',
    };
  }),

  redo: () => set((state) => {
    if (state.future.length === 0) return state;
    const next = state.future[0];
    const newFuture = state.future.slice(1);
    const current: Snapshot = {
      regions: state.regions,
      nodes: state.nodes,
      connections: state.connections,
    };
    return {
      past: [...state.past, current],
      future: newFuture,
      regions: next.regions,
      nodes: next.nodes,
      connections: next.connections,
      configStatus: '有未保存修改',
    };
  }),

  setViewMode: (mode, subId) => set({ mode, activeSubTopologyId: subId, selectedElementId: undefined }),
  selectElement: (id, type) => set({ selectedElementId: id, selectedElementType: type }),
  clearSelection: () => set({ selectedElementId: undefined, selectedElementType: undefined }),
  setPreview: (isPreview) => set({ isPreview }),
  setRegionModalOpen: (isOpen, data = null) => set({ isRegionModalOpen: isOpen, editingRegion: data }),
  setNodeModalOpen: (isOpen, data = null) => set({ isNodeModalOpen: isOpen, editingNode: data }),
  setConnectionModalOpen: (isOpen, data = null) => set({ isConnectionModalOpen: isOpen, pendingConnection: data }),

  addRegion: (region) => set((state) => {
    const snapshot = { regions: state.regions, nodes: state.nodes, connections: state.connections };
    return {
      past: [...state.past, snapshot],
      future: [],
      regions: [...state.regions, region],
      configStatus: '有未保存修改'
    };
  }),
  updateRegion: (id, data) => set((state) => {
    const snapshot = { regions: state.regions, nodes: state.nodes, connections: state.connections };
    return {
      past: [...state.past, snapshot],
      future: [],
      regions: state.regions.map(r => r.id === id ? { ...r, ...data } : r),
      configStatus: '有未保存修改'
    };
  }),
  removeRegion: (id) => set((state) => {
    const snapshot = { regions: state.regions, nodes: state.nodes, connections: state.connections };
    return {
      past: [...state.past, snapshot],
      future: [],
      regions: state.regions.filter(r => r.id !== id),
      configStatus: '有未保存修改'
    };
  }),

  addNode: (node) => set((state) => {
    const snapshot = { regions: state.regions, nodes: state.nodes, connections: state.connections };
    const newState = {
      ...state,
      past: [...state.past, snapshot],
      future: [],
      nodes: [...state.nodes, node],
      configStatus: '有未保存修改'
    };
    return autoAdjustRegions(newState);
  }),
  updateNode: (id, data) => set((state) => {
    const snapshot = { regions: state.regions, nodes: state.nodes, connections: state.connections };
    const newState = {
      ...state,
      past: [...state.past, snapshot],
      future: [],
      nodes: state.nodes.map(n => n.id === id ? { ...n, ...data } : n),
      configStatus: '有未保存修改'
    };
    return autoAdjustRegions(newState);
  }),
  removeNode: (id) => set((state) => {
    const snapshot = { regions: state.regions, nodes: state.nodes, connections: state.connections };
    const newState = {
      ...state,
      past: [...state.past, snapshot],
      future: [],
      nodes: state.nodes.filter(n => n.id !== id),
      configStatus: '有未保存修改'
    };
    return autoAdjustRegions(newState);
  }),

  addConnection: (conn) => set((state) => {
    const snapshot = { regions: state.regions, nodes: state.nodes, connections: state.connections };
    return {
      past: [...state.past, snapshot],
      future: [],
      connections: [...state.connections, conn],
      configStatus: '有未保存修改'
    };
  }),
  updateConnection: (id, data) => set((state) => {
    const snapshot = { regions: state.regions, nodes: state.nodes, connections: state.connections };
    return {
      past: [...state.past, snapshot],
      future: [],
      connections: state.connections.map(c => c.id === id ? { ...c, ...data } : c),
      configStatus: '有未保存修改'
    };
  }),
  removeConnection: (id) => set((state) => {
    const snapshot = { regions: state.regions, nodes: state.nodes, connections: state.connections };
    return {
      past: [...state.past, snapshot],
      future: [],
      connections: state.connections.filter(c => c.id !== id),
      configStatus: '有未保存修改'
    };
  }),
}));

/**
 * 自动调整区域大小的辅助函数
 */
function autoAdjustRegions(state: AppState): AppState {
  const padding = 40; 

  const newRegions = state.regions.map(region => {
    const regionNodes = state.nodes.filter(n => n.regionId === region.id);

    if (regionNodes.length === 0) {
      return { ...region, width: 280, height: 180 }; 
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    regionNodes.forEach(n => {
      minX = Math.min(minX, n.position.x);
      minY = Math.min(minY, n.position.y);
      maxX = Math.max(maxX, n.position.x + 120); // 估计节点宽度
      maxY = Math.max(maxY, n.position.y + 100); // 估计节点高度
    });

    const newWidth = maxX + padding;
    const newHeight = maxY + padding;

    if (minX < 30 || minY < 30) {
      const offsetX = minX < 30 ? 60 - minX : 0;
      const offsetY = minY < 30 ? 60 - minY : 0;

      state.nodes = state.nodes.map(n => 
        n.regionId === region.id ? { ...n, position: { x: n.position.x + offsetX, y: n.position.y + offsetY } } : n
      );

      return {
        ...region,
        position: { x: region.position.x - offsetX, y: region.position.y - offsetY },
        width: newWidth + offsetX,
        height: newHeight + offsetY
      };
    }

    return {
      ...region,
      width: newWidth,
      height: newHeight
    };
  });

  return { ...state, regions: newRegions, nodes: state.nodes };
}
