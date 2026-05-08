import React, { useCallback, useMemo, useEffect, useRef } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  BackgroundVariant,
  type Node, 
  type Edge, 
  type Connection as FlowConnection,
  type NodeChange,
  Panel,
  applyNodeChanges
} from 'reactflow';
import { useStore } from '../../store/useStore';
import { RegionNode, UnifiedNode } from './CustomNodes';
import { FloatingEdge } from './FloatingEdge';
import { MousePointer2, Boxes, Plus } from 'lucide-react';
import { getSmartSnapPos } from '../../utils/snapHelper';

const nodeTypes = {
  region: RegionNode,
  node: UnifiedNode,
};

const edgeTypes = {
  floating: FloatingEdge,
};

export const TopologyCanvas = () => {
  const mode = useStore(s => s.mode);
  const activeSubTopologyId = useStore(s => s.activeSubTopologyId);
  const regions = useStore(s => s.regions);
  const mainNodes = useStore(s => s.nodes);
  const mainConnections = useStore(s => s.connections);
  const subTopologyData = useStore(s => s.subTopologyData);

  const selectElement = useStore(s => s.selectElement);
  const clearSelection = useStore(s => s.clearSelection);
  const setViewMode = useStore(s => s.setViewMode);
  const isPreview = useStore(s => s.isPreview);
  const setConnectionModalOpen = useStore(s => s.setConnectionModalOpen);
  const updateNode = useStore(s => s.updateNode);
  const removeNode = useStore(s => s.removeNode);
  const removeRegion = useStore(s => s.removeRegion);
  const removeConnection = useStore(s => s.removeConnection);
  const setRegionModalOpen = useStore(s => s.setRegionModalOpen);
  const setNodeModalOpen = useStore(s => s.setNodeModalOpen);
  const selectedElementId = useStore(s => s.selectedElementId);
  const isConnectingLine = useStore(s => s.isConnectingLine);
  const setConnectingLine = useStore(s => s.setConnectingLine);
  const updateRegion = useStore(s => s.updateRegion);
  const reactFlowInstance = useStore(s => s.reactFlowInstance);
  const setReactFlowInstance = useStore(s => s.setReactFlowInstance);
  const helperLines = useStore(s => s.helperLines);
  const setHelperLines = useStore(s => s.setHelperLines);
  const hoveredNodeId = useStore(s => s.hoveredNodeId);
  const setHoveredNodeId = useStore(s => s.setHoveredNodeId);
  
  const isPreviewMode = useStore(s => s.isPreviewMode);
  const previewData = useStore(s => s.previewData);

  const { currentNodes, currentConnections, currentRegions } = useMemo(() => {
    if (isPreviewMode && previewData) {
      return {
        currentNodes: previewData.nodes,
        currentConnections: previewData.connections,
        currentRegions: previewData.regions
      };
    }
    if (mode === 'sub' && activeSubTopologyId && subTopologyData[activeSubTopologyId]) {
      return {
        currentNodes: subTopologyData[activeSubTopologyId].nodes,
        currentConnections: subTopologyData[activeSubTopologyId].connections,
        currentRegions: []
      };
    }
    return {
      currentNodes: mainNodes,
      currentConnections: mainConnections,
      currentRegions: regions
    };
  }, [isPreviewMode, previewData, mode, activeSubTopologyId, mainNodes, mainConnections, regions, subTopologyData]);

  const isEmpty = useMemo(() => {
    return currentRegions.length === 0 && currentNodes.length === 0;
  }, [currentRegions.length, currentNodes.length]);

  const initialNodes = useMemo(() => {
    const rfNodes: Node[] = [];
    currentRegions.forEach(r => {
      rfNodes.push({
        id: r.id,
        type: 'region',
        position: r.position,
        style: { width: r.width, height: r.height },
        data: r,
        zIndex: 0, 
        draggable: !isPreview && !isPreviewMode,
      });
    });
    currentNodes.forEach(n => {
      rfNodes.push({
        id: n.id,
        type: 'node',
        position: n.position,
        data: n,
        ...(n.regionId && n.regionId !== '' && n.regionId !== 'root' ? { parentNode: n.regionId } : {}),
        zIndex: 10,
        draggable: !isPreview && !isPreviewMode,
      });
    });
    return rfNodes;
  }, [currentRegions, currentNodes, isPreview, isPreviewMode]);

  const initialEdges = useMemo(() => {
    return currentConnections.map(c => {
      const isConnectionSelected = selectedElementId === c.id;

      return {
        id: c.id,
        source: c.source,
        target: c.target,
        type: 'floating',
        style: {
          stroke: '#94A3B8',
          strokeWidth: isConnectionSelected ? 3 : 2.5,
          opacity: isConnectionSelected ? 1 : 0.8,
          filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.1))'
        },
        data: { selected: isConnectionSelected }
      };
    });
  }, [currentConnections, selectedElementId]);

  const [rfNodes, setNodes, onNodesChangeOriginal] = useNodesState(initialNodes);
  const [rfEdges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes((nds) => 
      initialNodes.map(inNode => {
        const currNode = nds.find(n => n.id === inNode.id);
        return currNode ? { ...inNode, selected: currNode.selected } : inNode;
      })
    );
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges((eds) => 
      initialEdges.map(inEdge => {
        const currEdge = eds.find(e => e.id === inEdge.id);
        return currEdge ? { ...inEdge, selected: currEdge.selected } : inEdge;
      })
    );
  }, [initialEdges, setEdges]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    const updatedChanges = changes.map(change => {
      if (change.type === 'position' && change.position && reactFlowInstance) {
        const node = reactFlowInstance.getNode(change.id);
        if (node && node.type === 'region') {
          const allRfNodes = reactFlowInstance.getNodes();
          const mockNode = { ...node, position: change.position };
          const snapResult = getSmartSnapPos(mockNode, allRfNodes, 'drag');
          setHelperLines(snapResult.helperLines);
          if (snapResult.helperLines.length > 0) {
            return {
              ...change,
              position: { x: snapResult.x, y: snapResult.y }
            };
          }
        }
      }
      return change;
    });
    onNodesChangeOriginal(updatedChanges);
  }, [reactFlowInstance, onNodesChangeOriginal, setHelperLines]);

  const addConnection = useStore(s => s.addConnection);

  const onConnect = useCallback((params: FlowConnection) => {
    if (isPreview || isPreviewMode) return;
    const newConn = {
      id: `c-${Date.now()}`,
      source: params.source || '',
      target: params.target || '',
      type: 'default',
      direction: '无方向'
    };
    addConnection(newConn);
  }, [isPreview, isPreviewMode, addConnection]);

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    event.stopPropagation();
    if (isConnectingLine || isPreview || isPreviewMode) return; 
    selectElement(node.id, node.type as 'node' | 'region');
  };

  const onEdgeClick = (event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    if (isPreview || isPreviewMode) return;
    const conn = currentConnections.find(c => c.id === edge.id);
    if (conn) {
      selectElement(conn.id, 'connection');
      setConnectionModalOpen(true, conn);
    }
  };

  const onNodeDragStop = (_: React.MouseEvent, node: Node) => {
    setHelperLines([]);
    
    // 获取最新的节点状态（包含吸附后的位置）
    const latestNode = reactFlowInstance?.getNode(node.id);
    if (!latestNode) return;

    // 像素级取整，确保数据层完美对齐
    const finalPos = {
      x: Math.round(latestNode.position.x),
      y: Math.round(latestNode.position.y)
    };

    if (node.type === 'region') {
      updateRegion(node.id, { position: finalPos });
      return;
    }

    if (node.type === 'node') {
      const w = 80;
      const h = 64;
      let absoluteCenter = { x: finalPos.x + w / 2, y: finalPos.y + h / 2 };

      if (node.parentNode) {
        const parent = currentRegions.find(r => r.id === node.parentNode);
        if (parent) {
          absoluteCenter = { x: absoluteCenter.x + parent.position.x, y: absoluteCenter.y + parent.position.y };
        }
      }

      let targetRegionId = 'root';
      let finalAbsolutePos = { x: absoluteCenter.x - w / 2, y: absoluteCenter.y - h / 2 };
      let relativePos = finalAbsolutePos;

      for (const r of currentRegions) {
        const { x, y } = r.position;
        const width = r.width || 400;
        const height = r.height || 300;
        if (absoluteCenter.x >= x && absoluteCenter.x <= x + width && absoluteCenter.y >= y && absoluteCenter.y <= y + height) {
          targetRegionId = r.id;
          relativePos = { x: finalAbsolutePos.x - x, y: finalAbsolutePos.y - y };
          break;
        }
      }
      
      updateNode(node.id, { 
        position: { x: Math.round(relativePos.x), y: Math.round(relativePos.y) }, 
        regionId: targetRegionId 
      });
    }
  };

  return (
    <div className={`w-full h-full ${isConnectingLine ? 'is-connecting-line' : ''}`}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={() => setConnectingLine(true)}
        onConnectEnd={() => setConnectingLine(false)}
        isValidConnection={() => true}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        onNodesDelete={useCallback((deletedNodes: Node[]) => {
          if (isPreview || isPreviewMode) return;
          deletedNodes.forEach(node => {
            if (node.type === 'node') removeNode(node.id);
            if (node.type === 'region') removeRegion(node.id);
          });
        }, [isPreview, isPreviewMode, removeNode, removeRegion])}
        onEdgesDelete={useCallback((deletedEdges: Edge[]) => {
          if (isPreview || isPreviewMode) return;
          deletedEdges.forEach(edge => removeConnection(edge.id));
        }, [isPreview, isPreviewMode, removeConnection])}
        onEdgeClick={onEdgeClick}
        onPaneClick={clearSelection}
        onNodeMouseEnter={(_, node) => {
          if (!isConnectingLine) setHoveredNodeId(node.id);
        }}
        onNodeMouseLeave={() => setHoveredNodeId(null)}
        onNodeDoubleClick={(event, node) => {
          // 已移除双击下钻子拓扑交互
        }}
        nodesDraggable={mode === 'main' && !isPreview && !isPreviewMode}
        nodesConnectable={mode === 'main' && !isPreview && !isPreviewMode}
        elementsSelectable={!isPreview && !isPreviewMode}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ 
          type: 'floating',
          style: { 
            strokeWidth: 2.5, 
            stroke: '#94A3B8', 
            opacity: 0.9,
            filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.1))'
          },
          zIndex: 5,
          interactionWidth: 20
        }}
        fitView
        proOptions={{ hideAttribution: true }} 
        className="bg-bg"
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#E2E8F0" />
        
        {helperLines.length > 0 && helperLines.map((line, i) => {
          const viewport = reactFlowInstance?.getViewport();
          if (!viewport) return null;
          const screenPos = line.type === 'vertical' 
            ? line.position * viewport.zoom + viewport.x 
            : line.position * viewport.zoom + viewport.y;

          return (
            <div
              key={i}
              className="absolute pointer-events-none z-[1000]"
              style={{
                left: line.type === 'vertical' ? screenPos : 0,
                top: line.type === 'horizontal' ? screenPos : 0,
                width: line.type === 'vertical' ? '1px' : '100%',
                height: line.type === 'horizontal' ? '1px' : '100%',
                backgroundColor: '#3B82F6',
                boxShadow: '0 0 4px rgba(59, 130, 246, 0.4)',
                opacity: 0.8,
              }}
            />
          );
        })}

        <Controls className="!bg-panel !border-border !text-text shadow-xl" />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={25} 
          size={1} 
          color="#E2E8F0" 
        />
        <MiniMap 
          style={{ width: 180, height: 120 }}
          nodeColor={(node) => {
            if (node.type === 'region') {
              const type = node.data?.type;
              const colors: Record<string, string> = {
                'security': '#dbeafe', 'compute': '#d1fae5', 'data': '#fef3c7', 'ops': '#f3e8ff', 'external': '#dcfce7', 
              };
              return colors[type] || '#f1f5f9';
            }
            return '#3B82F6'; 
          }}
          nodeStrokeColor={(node) => node.type === 'region' ? '#E2E8F0' : 'transparent'}
          nodeBorderRadius={2}
          maskColor="rgba(59, 130, 246, 0.05)"
          maskStrokeColor="#3B82F6"
          maskStrokeWidth={2}
          pannable={true}
          zoomable={true}
          className="!bg-white/80 !backdrop-blur-md !border-[#E5EAF3] !shadow-md !rounded-xl !overflow-hidden !m-4"
        />

        {isEmpty && mode === 'main' && !isPreview && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="flex flex-col items-center justify-center p-12 text-center max-w-md animate-in fade-in duration-700">
              <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-8 animate-pulse">
                <MousePointer2 className="w-10 h-10 text-primary/40" />
              </div>
              <h3 className="text-2xl font-black text-slate-400 mb-3 tracking-tight">暂无拓扑内容</h3>
              <p className="text-sm text-slate-400/60 mb-10 leading-relaxed font-medium">
                你可以通过点击左侧面板的“新增节点”开始构建，<br />
                也可以点击下方工具栏快速新增。
              </p>
              <div className="flex items-center space-x-4 pointer-events-auto">
                <button onClick={() => setRegionModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm"><Boxes className="w-4 h-4 text-emerald-500" /><span>新增区域</span></button>
                <button onClick={() => setNodeModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-hover shadow-md shadow-primary/20"><Plus className="w-4 h-4" /><span>新增节点</span></button>
              </div>
            </div>
          </div>
        )}
      </ReactFlow>
    </div>
  );
};
