
export type IconType = 
  | 'firewall'
  | 'router'
  | 'switch'
  | 'core-switch'
  | 'server'
  | 'terminal'
  | 'middleware'
  | 'database'
  | 'gateway'
  | 'cloud'
  | 'subTopology'
  | 'group';



export interface Position {
  x: number;
  y: number;
}

export interface Region {
  id: string;
  name: string;
  type: string;
  position: Position;
  width: number;
  height: number;
}

export interface TopologyNode {
  id: string;
  name: string; // 显示名称
  iconType: IconType;
  relatedTopologyId?: string;  // 关联子拓扑 ID
  regionId?: string;
  description?: string;
  position: Position;
  updatedAt?: string;
}

// Keep Device for selection in modal
export interface Device {
  id: string;
  type: string;
  name: string;
  ip: string;
}

// Keep SubTopology for selection in modal
export interface SubTopology {
  id: string;
  name: string;
  nodeCount: number;
  updatedAt: string;
  devices?: Device[]; // 子拓扑内包含的具体设备列表
}

export interface Connection {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  type: string;
  direction: '无方向' | '单向' | '双向';
  description?: string;
}

export interface TopologyVersion {
  id: string; // D1, V1 等
  type: 'draft' | 'published';
  timestamp: string;
  operator: string;
  isActive?: boolean;
  data: {
    nodes: TopologyNode[];
    connections: Connection[];
    regions: Region[];
  };
}
