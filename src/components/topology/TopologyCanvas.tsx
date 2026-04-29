import React, { useCallback, useMemo, useEffect } from 'react';
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
  Panel
} from 'reactflow';
import { useStore } from '../../store/useStore';
import { RegionNode, UnifiedNode } from './CustomNodes';
import { MousePointer2, Boxes, Plus } from 'lucide-react';
import { getSmartSnapPos } from '../../utils/snapHelper';

const nodeTypes = {
  region: RegionNode,
  node: UnifiedNode,
};

export const TopologyCanvas = () => {
  const { 
    mode, 
    activeSubTopologyId, 
    regions, 
    nodes: allTopologyNodes, 
    connections,
    selectElement,
    clearSelection,
    setViewMode,
    isPreview,
    setConnectionModalOpen,
    updateNode,
    removeNode,
    removeRegion,
    removeConnection,
    setRegionModalOpen,
    setNodeModalOpen,
    selectedElementId,
    isConnectingLine,
    setConnectingLine,
    updateRegion,
    reactFlowInstance,
    setReactFlowInstance,
    helperLines,
    setHelperLines,
    hoveredNodeId,
    setHoveredNodeId
  } = useStore();

  const isEmpty = useMemo(() => {
    return regions.length === 0 && allTopologyNodes.length === 0;
  }, [regions, allTopologyNodes]);

  // 根据当前模式计算要显示的节点和连线
  const initialNodes = useMemo(() => {
    const rfNodes: Node[] = [];

    // 1. 添加区域节点
    regions.forEach(r => {
      rfNodes.push({
        id: r.id,
        type: 'region',
        position: r.position,
        style: { width: r.width, height: r.height },
        data: r,
        zIndex: 0, 
        draggable: !isPreview,
      });
    });

    // 2. 添加拓扑节点
    allTopologyNodes.forEach(n => {
      rfNodes.push({
        id: n.id,
        type: 'node',
        position: n.position,
        data: n,
        ...(n.regionId && n.regionId !== '' && n.regionId !== 'root' ? { parentNode: n.regionId } : {}),
        zIndex: 10,
        draggable: !isPreview,
      });
    });

    return rfNodes;
  }, [regions, allTopologyNodes, isPreview]);

  const initialEdges = useMemo(() => {
    const rfEdges: Edge[] = [];
    
    connections.forEach(c => {
      const isRelatedToHovered = hoveredNodeId && (c.source === hoveredNodeId || c.target === hoveredNodeId);
      const isRelatedToSelected = selectedElementId && (c.source === selectedElementId || c.target === selectedElementId);
      const isConnectionSelected = selectedElementId === c.id;

      let strokeColor = '#8FB7F8'; 
      let strokeWidth = 1.5;
      let opacity = 0.6;

      if (hoveredNodeId || selectedElementId) {
        if (isRelatedToHovered || isRelatedToSelected || isConnectionSelected) {
          strokeColor = '#3B82F6'; 
          strokeWidth = 2;
          opacity = 1;
        } else {
          opacity = 0.1; 
        }
      }

      if (c.status === '中断' && !isRelatedToHovered && !isRelatedToSelected && !isConnectionSelected) {
        strokeColor = '#EF4444';
        opacity = 0.7;
      } else if (c.status === '告警' && !isRelatedToHovered && !isRelatedToSelected && !isConnectionSelected) {
        strokeColor = '#F59E0B';
        opacity = 0.7;
      }

      rfEdges.push({
        id: c.id,
        source: c.source,
        target: c.target,
        type: 'smoothstep', 
        pathOptions: { borderRadius: 8, offset: 20 },
        animated: c.status === '中断',
        style: {
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          opacity: opacity,
          strokeDasharray: c.status === '中断' ? '5 5' : 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        data: { selected: isConnectionSelected }
      });
    });

    return rfEdges;
  }, [connections, selectedElementId, hoveredNodeId]);

  const [rfNodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [rfEdges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes((nds) => 
      initialNodes.map(inNode => {
        const currNode = nds.find(n => n.id === inNode.id);
        return currNode ? { ...inNode, selected: currNode.selected } : inNode;
      })
    );
    setEdges((eds) => 
      initialEdges.map(inEdge => {
        const currEdge = eds.find(e => e.id === inEdge.id);
        return currEdge ? { ...inEdge, selected: currEdge.selected } : inEdge;
      })
    );
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect = useCallback((params: FlowConnection) => {
    if (isPreview) return;
    setConnectionModalOpen(true, {
      source: params.source || '',
      target: params.target || '',
      type: 'default',
      direction: '单向',
      status: '正常'
    });
  }, [isPreview, setConnectionModalOpen]);

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    event.stopPropagation();
    if (isConnectingLine) return; 
    selectElement(node.id, node.type as 'node' | 'region');
  };

  const onEdgeClick = (event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    if (isPreview) return;
    const conn = connections.find(c => c.id === edge.id);
    if (conn) {
      selectElement(conn.id, 'connection' as any);
      setConnectionModalOpen(true, conn);
    }
  };

  const onPaneClick = () => {
    clearSelection();
  };

  const onNodeDoubleClick = (event: React.MouseEvent, node: Node) => {
    if (node.type === 'node') {
      const topoNode = allTopologyNodes.find(n => n.id === node.id);
      if (topoNode?.relationType === 'subTopology' && topoNode.relatedTopologyId) {
        setViewMode('sub', topoNode.relatedTopologyId);
      }
    }
  };

  const onNodeDrag = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === 'region') {
      const allRfNodes = reactFlowInstance.getNodes();
      const snapResult = getSmartSnapPos(node, allRfNodes, 'drag');
      setHelperLines(snapResult.helperLines);
      if (snapResult.helperLines.length > 0) {
        reactFlowInstance.setNodes((nodes: Node[]) =>
          nodes.map((n: Node) => {
            if (n.id === node.id) {
              return { ...n, position: { x: snapResult.x, y: snapResult.y } };
            }
            return n;
          })
        );
      }
    }
  }, [reactFlowInstance, setHelperLines]);

  const onNodeDragStop = (_: React.MouseEvent, node: Node) => {
    setHelperLines([]);
    if (node.type === 'region') {
      updateRegion(node.id, { position: node.position });
      return;
    }

    if (node.type === 'node') {
      const w = 128;
      const h = 100;
      
      let absoluteCenter = {
        x: node.position.x + w / 2,
        y: node.position.y + h / 2
      };

      if (node.parentNode) {
        const parent = regions.find(r => r.id === node.parentNode);
        if (parent) {
          absoluteCenter = {
            x: absoluteCenter.x + parent.position.x,
            y: absoluteCenter.y + parent.position.y
          };
        }
      }

      let targetRegionId = 'root';
      let finalAbsolutePos = {
        x: absoluteCenter.x - w / 2,
        y: absoluteCenter.y - h / 2
      };
      let relativePos = finalAbsolutePos;

      for (const r of regions) {
        const { x, y } = r.position;
        const width = r.width || 400;
        const height = r.height || 300;
        
        if (absoluteCenter.x >= x && absoluteCenter.x <= x + width && absoluteCenter.y >= y && absoluteCenter.y <= y + height) {
          targetRegionId = r.id;
          relativePos = {
            x: finalAbsolutePos.x - x,
            y: finalAbsolutePos.y - y
          };
          break;
        }
      }

      updateNode(node.id, { position: relativePos, regionId: targetRegionId });
    }
  };

  const onNodesDelete = useCallback((deletedNodes: Node[]) => {
    if (isPreview) return;
    deletedNodes.forEach(node => {
      if (node.type === 'node') removeNode(node.id);
      if (node.type === 'region') removeRegion(node.id);
    });
  }, [isPreview, removeNode, removeRegion]);

  const onEdgesDelete = useCallback((deletedEdges: Edge[]) => {
    if (isPreview) return;
    deletedEdges.forEach(edge => {
      removeConnection(edge.id);
    });
  }, [isPreview, removeConnection]);

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
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onNodeMouseEnter={(_, node) => {
          if (!isConnectingLine) setHoveredNodeId(node.id);
        }}
        onNodeMouseLeave={() => setHoveredNodeId(null)}
        onNodeDoubleClick={onNodeDoubleClick}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{ 
          type: 'smoothstep',
          style: { strokeWidth: 1.5, stroke: '#8FB7F8', opacity: 0.6 },
          zIndex: 5,
          interactionWidth: 20
        }}
        fitView
        proOptions={{ hideAttribution: true }} 
        className="bg-bg"
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#E2E8F0" />
        
        {helperLines.map((line, i) => {
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
                transition: 'none'
              }}
            />
          );
        })}

        <Controls className="!bg-panel !border-border !text-text shadow-xl" />
        <MiniMap 
          style={{ width: 180, height: 120 }}
          nodeColor={(node) => {
            if (node.type === 'region') {
              const type = node.data?.type;
              const colors: Record<string, string> = {
                'security': '#dbeafe', 
                'compute': '#d1fae5',  
                'data': '#fef3c7',     
                'ops': '#f3e8ff',      
                'external': '#dcfce7', 
              };
              return colors[type] || '#f1f5f9';
            }
            return '#3B82F6'; 
          }}
          nodeStrokeColor={(node) => {
            if (node.type === 'region') return '#E2E8F0';
            return 'transparent';
          }}
          nodeBorderRadius={2}
          maskColor="rgba(59, 130, 246, 0.05)"
          maskStrokeColor="#3B82F6"
          maskStrokeWidth={2}
          pannable={true}
          zoomable={true}
          className="!bg-white/80 !backdrop-blur-md !border-[#E5EAF3] !shadow-md !rounded-xl !overflow-hidden !m-4"
        />

        {isEmpty && !isPreview && (
          <Panel position="top-center" className="pointer-events-none">
            <div className="flex flex-col items-center justify-center p-12 bg-white/50 backdrop-blur-sm border-2 border-dashed border-slate-200 rounded-3xl text-center max-w-md">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 animate-bounce duration-[3000ms]">
                <MousePointer2 className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">暂无拓扑内容</h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                你可以通过点击左侧面板的<span className="text-primary font-bold">新增节点</span>开始构建，<br />
                也可以点击下方工具栏快速新增。
              </p>
              <div className="flex items-center space-x-4 pointer-events-auto">
                <button 
                  onClick={() => setRegionModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                >
                  <Boxes className="w-4 h-4 text-emerald-500" />
                  <span>新增区域</span>
                </button>
                <button 
                  onClick={() => setNodeModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-hover transition-all shadow-md shadow-primary/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>新增节点</span>
                </button>
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};
