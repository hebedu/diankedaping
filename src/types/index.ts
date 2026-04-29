export type ElementStatus = '正常' | '告警' | '异常' | '离线';

export type IconType = 
  | 'firewall'
  | 'router'
  | 'switch'
  | 'server'
  | 'terminal'
  | 'middleware'
  | 'database'
  | 'gateway'
  | 'cloud'
  | 'subTopology'
  | 'group';

export type RelationType = 'device' | 'subTopology';

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
  relationType: RelationType;
  relatedDeviceIds?: string[]; // 关联设备列表 (支持多选)
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
  status: ElementStatus;
}

// Keep SubTopology for selection in modal
export interface SubTopology {
  id: string;
  name: string;
  nodeCount: number;
  updatedAt: string;
}

export interface Connection {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  type: string;
  direction: '无方向' | '单向' | '双向';
  status: '正常' | '告警' | '中断';
  description?: string;
}
