import { create } from 'zustand';
import type { TopologyNode, Region, Connection, Device, SubTopology, TopologyVersion } from '../types';
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
  isResizing: boolean;
  isLocal: boolean;
  isReadOnly: boolean;
  
  // Version History State
  versions: TopologyVersion[];
  isVersionDrawerOpen: boolean;
  isPreviewMode: boolean;
  previewVersionId: string | null;
  previewData: Snapshot | null;
}

export type ConfigStatus = '已发布' | '已保存草稿' | '有未保存修改' | '基于已发布版本编辑中';

export interface Snapshot {
  regions: Region[];
  nodes: TopologyNode[];
  connections: Connection[];
}

interface SubTopologyContent {
  nodes: TopologyNode[];
  connections: Connection[];
}

interface AppState extends ViewState {
  regions: Region[];
  nodes: TopologyNode[];
  connections: Connection[];
  
  // Sub Topology Data Store
  subTopologyData: Record<string, SubTopologyContent>;

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
  setResizing: (isResizing: boolean) => void;

  // History Actions
  saveHistory: () => void;
  undo: () => void;
  redo: () => void;
  
  // Lifecycle Actions
  saveDraft: () => void;
  publishConfig: () => void;
  
  // Version History Actions
  setVersionDrawerOpen: (isOpen: boolean) => void;
  enterPreviewMode: (versionId: string) => void;
  exitPreviewMode: () => void;
  restoreVersion: (versionId: string) => void;

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
  { id: 'r1', name: '外部用户区', type: 'external', position: { x: -350, y: 50 }, width: 250, height: 250 },
  { id: 'r2', name: '核心网络安全域', type: 'security', position: { x: 0, y: 50 }, width: 450, height: 350 },
  { id: 'r3', name: '算力服务区', type: 'compute', position: { x: 550, y: 50 }, width: 400, height: 400 },
  { id: 'r4', name: '数据服务区', type: 'data', position: { x: 1050, y: 50 }, width: 400, height: 400 },
  { id: 'r5', name: '运维区', type: 'ops', position: { x: 0, y: 450 }, width: 450, height: 300 },
];

const initialNodes: TopologyNode[] = [
  { id: 'n1', name: '边界防火墙', iconType: 'firewall', relatedTopologyId: 't3', regionId: 'r2', position: { x: 50, y: 80 } },
  { id: 'n2', name: '核心路由器', iconType: 'router', relatedTopologyId: 't1', regionId: 'r2', position: { x: 250, y: 80 } },
  { id: 'n3', name: '运维堡垒机', iconType: 'server', regionId: 'r5', position: { x: 160, y: 100 } },
  { id: 'n4', name: '交换机集群 A', iconType: 'group', relatedTopologyId: 't1', regionId: 'r2', position: { x: 250, y: 220 } },
  { id: 'n5', name: '服务器集群 A', iconType: 'group', relatedTopologyId: 't2', regionId: 'r3', position: { x: 130, y: 150 } },
];

const initialConnections: Connection[] = [
  { id: 'c2', source: 'n1', target: 'n2', type: 'default', direction: '无方向' },
  { id: 'c3', source: 'n2', target: 'n4', type: 'default', direction: '无方向' },
  { id: 'c4', source: 'n4', target: 'n5', type: 'default', direction: '无方向' },
  { id: 'c5', source: 'n3', target: 'n4', type: 'default', direction: '无方向' },
];

// 预置子拓扑内部数据
const initialSubTopologyData: Record<string, SubTopologyContent> = {
  't1': {
    nodes: [
      { id: 't1_n1', name: '核心交换机-01', iconType: 'switch', relatedTopologyId: 't1', position: { x: 100, y: 100 } },
      { id: 't1_n2', name: '核心交换机-02', iconType: 'switch', relatedTopologyId: 't1', position: { x: 300, y: 100 } },
      { id: 't1_n3', name: '汇聚交换机-01', iconType: 'switch', relatedTopologyId: 't1', position: { x: 200, y: 250 } },
    ],
    connections: [
      { id: 't1_c1', source: 't1_n1', target: 't1_n2', type: 'default', direction: '无方向' },
      { id: 't1_c2', source: 't1_n1', target: 't1_n3', type: 'default', direction: '无方向' },
      { id: 't1_c3', source: 't1_n2', target: 't1_n3', type: 'default', direction: '无方向' },
    ]
  },
  't2': {
    nodes: [
      { id: 't2_n1', name: '业务服务器-A1', iconType: 'server', relatedTopologyId: 't2', position: { x: 150, y: 100 } },
      { id: 't2_n2', name: '业务服务器-A2', iconType: 'server', relatedTopologyId: 't2', position: { x: 350, y: 100 } },
      { id: 't2_n3', name: '数据库服务器', iconType: 'database', relatedTopologyId: 't2', position: { x: 250, y: 250 } },
    ],
    connections: [
      { id: 't2_c1', source: 't2_n1', target: 't2_n3', type: 'default', direction: '单向' },
      { id: 't2_c2', source: 't2_n2', target: 't2_n3', type: 'default', direction: '单向' },
    ]
  },
  't3': {
    nodes: [
      { id: 't3_n1', name: '安全分析引擎', iconType: 'middleware', relatedTopologyId: 't3', position: { x: 100, y: 100 } },
      { id: 't3_n2', name: '日志采集器', iconType: 'terminal', relatedTopologyId: 't3', position: { x: 300, y: 100 } },
    ],
    connections: [
      { id: 't3_c1', source: 't3_n2', target: 't3_n1', type: 'default', direction: '单向' },
    ]
  }
};

const mockDevices: Device[] = [
  { id: 'd1', name: 'FW-01', ip: '192.168.1.1', type: '防火墙' },
  { id: 'd2', name: 'FW-02', ip: '192.168.1.2', type: '防火墙' },
  { id: 'd3', name: 'Router-Core', ip: '10.0.0.1', type: '路由器' },
  { id: 'd4', name: 'Router-Edge', ip: '10.0.0.2', type: '路由器' },
  { id: 'd5', name: 'Switch-Core-01', ip: '10.0.1.1', type: '交换机' },
  { id: 'd6', name: 'Switch-Core-02', ip: '10.0.1.2', type: '交换机' },
  { id: 'd7', name: 'Switch-Acc-01', ip: '10.0.2.1', type: '交换机' },
  { id: 'd8', name: 'Server-Web-01', ip: '172.16.0.10', type: '服务器' },
  { id: 'd9', name: 'Server-Web-02', ip: '172.16.0.11', type: '服务器' },
  { id: 'd10', name: 'Server-DB-Master', ip: '172.16.1.5', type: '服务器' },
  { id: 'd11', name: 'Server-DB-Slave', ip: '172.16.1.6', type: '服务器' },
  { id: 'd12', name: 'Bastion-01', ip: '192.168.10.5', type: '服务器' },
  { id: 'd13', name: 'Log-Collector', ip: '192.168.10.10', type: '终端' },
  { id: 'd14', name: 'Security-Analyzer', ip: '192.168.10.15', type: '终端' },
];

const mockSubTopologies: SubTopology[] = [
  { id: 't1', name: '交换机子拓扑', nodeCount: 4, updatedAt: '2024-03-20', devices: mockDevices.filter(d => d.type === '交换机' || d.type === '路由器') },
  { id: 't2', name: '服务器子拓扑', nodeCount: 5, updatedAt: '2024-03-19', devices: mockDevices.filter(d => d.type === '服务器') },
  { id: 't3', name: '安全域内部拓扑', nodeCount: 4, updatedAt: '2024-03-18', devices: mockDevices.filter(d => d.type === '防火墙' || d.type === '终端') },
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
  isResizing: false,
  isLocal: true,
  isReadOnly: false,
  
  regions: initialRegions,
  nodes: initialNodes,
  connections: initialConnections,
  subTopologyData: initialSubTopologyData,
  availableDevices: mockDevices,
  availableSubTopologies: mockSubTopologies,
  
  past: [],
  future: [],
  configStatus: '基于已发布版本编辑中',
  isConnectionMode: false,
  
  versions: [
    {
      id: 'V1',
      type: 'published',
      timestamp: '2024-05-01 10:00:00',
      operator: '管理员',
      isActive: true,
      data: { nodes: initialNodes, connections: initialConnections, regions: initialRegions }
    },
    {
      id: 'D2',
      type: 'draft',
      timestamp: '2024-05-01 09:45:00',
      operator: '管理员',
      data: { nodes: initialNodes, connections: initialConnections, regions: initialRegions }
    },
    {
      id: 'D1',
      type: 'draft',
      timestamp: '2024-05-01 09:30:00',
      operator: '管理员',
      data: { nodes: initialNodes, connections: initialConnections, regions: initialRegions }
    }
  ],
  isVersionDrawerOpen: false,
  isPreviewMode: false,
  previewVersionId: null,
  previewData: null,

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
  setResizing: (isResizing) => set({ isResizing }),

  setConnectionMode: (isMode) => set({ isConnectionMode: isMode }),

  saveDraft: () => set((state) => {
    const newVersion: TopologyVersion = {
      id: `D${state.versions.filter(v => v.type === 'draft').length + 1}`,
      type: 'draft',
      timestamp: new Date().toLocaleString(),
      operator: '管理员',
      data: {
        nodes: state.nodes,
        connections: state.connections,
        regions: state.regions
      }
    };
    return { 
      configStatus: '已保存草稿',
      versions: [newVersion, ...state.versions]
    };
  }),
  
  publishConfig: () => set((state) => {
    const newVersion: TopologyVersion = {
      id: `V${state.versions.filter(v => v.type === 'published').length + 1}`,
      type: 'published',
      timestamp: new Date().toLocaleString(),
      operator: '管理员',
      isActive: true,
      data: {
        nodes: state.nodes,
        connections: state.connections,
        regions: state.regions
      }
    };
    const updatedVersions = state.versions.map(v => ({
      ...v,
      isActive: v.type === 'published' ? false : v.isActive
    }));
    return { 
      configStatus: '已发布',
      past: [],
      future: [],
      versions: [newVersion, ...updatedVersions]
    };
  }),

  setVersionDrawerOpen: (isOpen) => set({ isVersionDrawerOpen: isOpen }),
  
  enterPreviewMode: (versionId) => set((state) => {
    const version = state.versions.find(v => v.id === versionId);
    if (!version) return state;
    return {
      isPreviewMode: true,
      previewVersionId: versionId,
      selectedElementId: null,
      selectedElementType: null,
      previewData: {
        nodes: version.data.nodes,
        connections: version.data.connections,
        regions: version.data.regions
      }
    };
  }),
  
  exitPreviewMode: () => set({ isPreviewMode: false, previewVersionId: null, previewData: null }),
  
  restoreVersion: (versionId) => set((state) => {
    const version = state.versions.find(v => v.id === versionId);
    if (!version) return state;
    return {
      nodes: version.data.nodes,
      connections: version.data.connections,
      regions: version.data.regions,
      isPreviewMode: false,
      previewVersionId: null,
      previewData: null,
      configStatus: '有未保存修改'
    };
  }),

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
  setPreview: (isPreview) => set({ isPreview, selectedElementId: null, selectedElementType: null }),
  setRegionModalOpen: (isOpen, data = null) => set({ isRegionModalOpen: isOpen, editingRegion: data }),
  setNodeModalOpen: (isOpen, data = null) => set({ isNodeModalOpen: isOpen, editingNode: data }),
  setConnectionModalOpen: (isOpen, data = null) => set({ isConnectionModalOpen: isOpen, pendingConnection: data }),

  addRegion: (region) => set((state) => {
    const snapshot = { regions: state.regions, nodes: state.nodes, connections: state.connections };
    return {
      past: [...state.past, snapshot],
      future: [],
      regions: [...state.regions, { ...region, id: region.id || `region_${Date.now()}` }],
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
    const newNode = { ...node, id: node.id || `node_${Date.now()}` };
    if (state.mode === 'sub' && state.activeSubTopologyId) {
      const subId = state.activeSubTopologyId;
      const currentSub = state.subTopologyData[subId] || { nodes: [], connections: [] };
      return {
        ...state,
        past: [...state.past, snapshot],
        future: [],
        subTopologyData: {
          ...state.subTopologyData,
          [subId]: { ...currentSub, nodes: [...currentSub.nodes, newNode] }
        },
        configStatus: '有未保存修改'
      };
    }
    return {
      ...state,
      past: [...state.past, snapshot],
      future: [],
      nodes: [...state.nodes, newNode],
      configStatus: '有未保存修改'
    };
  }),
  updateNode: (id, data) => set((state) => {
    const snapshot = { regions: state.regions, nodes: state.nodes, connections: state.connections };
    if (state.mode === 'sub' && state.activeSubTopologyId) {
      const subId = state.activeSubTopologyId;
      const currentSub = state.subTopologyData[subId];
      return {
        ...state,
        past: [...state.past, snapshot],
        future: [],
        subTopologyData: {
          ...state.subTopologyData,
          [subId]: { ...currentSub, nodes: currentSub.nodes.map(n => n.id === id ? { ...n, ...data } : n) }
        },
        configStatus: '有未保存修改'
      };
    }
    return {
      ...state,
      past: [...state.past, snapshot],
      future: [],
      nodes: state.nodes.map(n => n.id === id ? { ...n, ...data } : n),
      configStatus: '有未保存修改'
    };
  }),
  removeNode: (id) => set((state) => {
    const snapshot = { regions: state.regions, nodes: state.nodes, connections: state.connections };
    if (state.mode === 'sub' && state.activeSubTopologyId) {
      const subId = state.activeSubTopologyId;
      const currentSub = state.subTopologyData[subId];
      return {
        ...state,
        past: [...state.past, snapshot],
        future: [],
        subTopologyData: {
          ...state.subTopologyData,
          [subId]: { 
            nodes: currentSub.nodes.filter(n => n.id !== id),
            connections: currentSub.connections.filter(c => c.source !== id && c.target !== id)
          }
        },
        configStatus: '有未保存修改'
      };
    }
    return {
      ...state,
      past: [...state.past, snapshot],
      future: [],
      nodes: state.nodes.filter(n => n.id !== id),
      connections: state.connections.filter(c => c.source !== id && c.target !== id),
      configStatus: '有未保存修改'
    };
  }),

  addConnection: (conn) => set((state) => {
    const snapshot = { regions: state.regions, nodes: state.nodes, connections: state.connections };
    const newConn = { ...conn, id: conn.id || `conn_${Date.now()}` };
    if (state.mode === 'sub' && state.activeSubTopologyId) {
      const subId = state.activeSubTopologyId;
      const currentSub = state.subTopologyData[subId];
      return {
        past: [...state.past, snapshot],
        future: [],
        subTopologyData: {
          ...state.subTopologyData,
          [subId]: { ...currentSub, connections: [...currentSub.connections, newConn] }
        },
        configStatus: '有未保存修改'
      };
    }
    return {
      past: [...state.past, snapshot],
      future: [],
      connections: [...state.connections, newConn],
      configStatus: '有未保存修改'
    };
  }),
  updateConnection: (id, data) => set((state) => {
    const snapshot = { regions: state.regions, nodes: state.nodes, connections: state.connections };
    if (state.mode === 'sub' && state.activeSubTopologyId) {
      const subId = state.activeSubTopologyId;
      const currentSub = state.subTopologyData[subId];
      return {
        past: [...state.past, snapshot],
        future: [],
        subTopologyData: {
          ...state.subTopologyData,
          [subId]: { ...currentSub, connections: currentSub.connections.map(c => c.id === id ? { ...c, ...data } : c) }
        },
        configStatus: '有未保存修改'
      };
    }
    return {
      past: [...state.past, snapshot],
      future: [],
      connections: state.connections.map(c => c.id === id ? { ...c, ...data } : c),
      configStatus: '有未保存修改'
    };
  }),
  removeConnection: (id) => set((state) => {
    const snapshot = { regions: state.regions, nodes: state.nodes, connections: state.connections };
    if (state.mode === 'sub' && state.activeSubTopologyId) {
      const subId = state.activeSubTopologyId;
      const currentSub = state.subTopologyData[subId];
      return {
        past: [...state.past, snapshot],
        future: [],
        subTopologyData: {
          ...state.subTopologyData,
          [subId]: { ...currentSub, connections: currentSub.connections.filter(c => c.id !== id) }
        },
        configStatus: '有未保存修改'
      };
    }
    return {
      past: [...state.past, snapshot],
      future: [],
      connections: state.connections.filter(c => c.id !== id),
      configStatus: '有未保存修改'
    };
  }),
}));
