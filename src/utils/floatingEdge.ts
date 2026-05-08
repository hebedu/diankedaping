import { Position } from 'reactflow';

// 根据节点的位置和大小，计算中心连线与边缘的交点
function getEdgeParams(source: any, target: any) {
  const sourceIntersectionPoint = getNodeIntersection(source, target);
  const targetIntersectionPoint = getNodeIntersection(target, source);

  return {
    sx: sourceIntersectionPoint.x,
    sy: sourceIntersectionPoint.y,
    tx: targetIntersectionPoint.x,
    ty: targetIntersectionPoint.y,
    sourcePos: sourceIntersectionPoint.position,
    targetPos: targetIntersectionPoint.position,
  };
}

// 获取矩形边框与中心连线的交点
function getNodeIntersection(character: any, target: any) {
  const { width, height, positionAbsolute: position } = character;
  const targetPosition = target.positionAbsolute;

  const w = width / 2;
  const h = height / 2;

  const x2 = position.x + w;
  const y2 = position.y + h;
  const x1 = targetPosition.x + target.width / 2;
  const y1 = targetPosition.y + target.height / 2;

  const dx = x2 - x1;
  const dy = y2 - y1;

  if (Math.abs(dx / w) > Math.abs(dy / h)) {
    if (dx > 0) {
      return { x: position.x, y: y2 - h * (dy / dx), position: Position.Left };
    }
    return { x: position.x + width, y: y2 + h * (dy / dx), position: Position.Right };
  } else {
    if (dy > 0) {
      return { x: x2 - w * (dx / dy), y: position.y, position: Position.Top };
    }
    return { x: x2 + w * (dx / dy), y: position.y + height, position: Position.Bottom };
  }
}

export { getEdgeParams };
