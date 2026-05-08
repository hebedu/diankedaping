import React, { useState } from 'react';
import { useNodes, getBezierPath } from 'reactflow';
import { getEdgeParams } from '../../utils/floatingEdge';

export const FloatingEdge = ({ id, source, target, markerEnd, style, selected, data }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const nodes = useNodes();
  const sourceNode = nodes.find((n) => n.id === source);
  const targetNode = nodes.find((n) => n.id === target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);

  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetX: tx,
    targetY: ty,
    targetPosition: targetPos,
  });

  return (
    <g 
      className="react-flow__edge"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 交互热区：不可见但很宽，负责捕获点击和悬停事件 */}
      <path
        id={`${id}-interaction`}
        className="react-flow__edge-interaction"
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: 'pointer' }}
      />
      
      {/* 视觉层：用户看到的精细线条 */}
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: (selected || isHovered) ? '#1677FF' : (style?.stroke || '#94A3B8'),
          strokeWidth: (selected || isHovered) ? 4 : (style?.strokeWidth || 2.5),
          strokeOpacity: isHovered && !selected ? 0.7 : 1,
          transition: 'all 0.2s ease',
        }}
      />
    </g>
  );
};
