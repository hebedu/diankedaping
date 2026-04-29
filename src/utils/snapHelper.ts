import { type Node } from 'reactflow';

export interface HelperLine {
  type: 'vertical' | 'horizontal';
  position: number;
}

const SNAP_THRESHOLD = 8;

export const getSmartSnapPos = (
  node: Node,
  allNodes: Node[],
  mode: 'drag' | 'resize' = 'drag'
) => {
  const result = {
    x: node.position.x,
    y: node.position.y,
    width: node.width || 0,
    height: node.height || 0,
    helperLines: [] as HelperLine[],
  };

  const nodeWidth = node.width || 0;
  const nodeHeight = node.height || 0;
  
  const nodeBounds = {
    left: node.position.x,
    right: node.position.x + nodeWidth,
    hCenter: node.position.x + nodeWidth / 2,
    top: node.position.y,
    bottom: node.position.y + nodeHeight,
    vCenter: node.position.y + nodeHeight / 2,
  };

  const otherNodes = allNodes.filter(n => n.id !== node.id && n.type === 'region');

  let snappedX = false;
  let snappedY = false;

  for (const other of otherNodes) {
    const oX = other.position.x;
    const oY = other.position.y;
    const oW = other.width || 0;
    const oH = other.height || 0;

    const oBounds = {
      left: oX,
      right: oX + oW,
      hCenter: oX + oW / 2,
      top: oY,
      bottom: oY + oH,
      vCenter: oY + oH / 2,
    };

    // --- 水平方向 (X 轴 / Width) ---
    if (!snappedX) {
      const candidates = [
        { flow: oBounds.left, type: 'vertical' },
        { flow: oBounds.right, type: 'vertical' },
        { flow: oBounds.hCenter, type: 'vertical' }
      ];

      for (const cand of candidates) {
        // 拖拽模式：吸附整个节点
        if (mode === 'drag') {
          if (Math.abs(nodeBounds.left - cand.flow) < SNAP_THRESHOLD) {
            result.x = cand.flow;
            result.helperLines.push({ type: 'vertical', position: cand.flow });
            snappedX = true;
            break;
          }
          if (Math.abs(nodeBounds.right - cand.flow) < SNAP_THRESHOLD) {
            result.x = cand.flow - nodeWidth;
            result.helperLines.push({ type: 'vertical', position: cand.flow });
            snappedX = true;
            break;
          }
        } 
        // 缩放模式：吸附边缘
        else {
          if (Math.abs(nodeBounds.right - cand.flow) < SNAP_THRESHOLD) {
            result.width = cand.flow - nodeBounds.left;
            result.helperLines.push({ type: 'vertical', position: cand.flow });
            snappedX = true;
            break;
          }
          if (Math.abs(nodeBounds.left - cand.flow) < SNAP_THRESHOLD) {
            result.x = cand.flow;
            result.width = nodeBounds.right - cand.flow;
            result.helperLines.push({ type: 'vertical', position: cand.flow });
            snappedX = true;
            break;
          }
        }
      }
    }

    // --- 垂直方向 (Y 轴 / Height) ---
    if (!snappedY) {
      const candidates = [
        { flow: oBounds.top, type: 'horizontal' },
        { flow: oBounds.bottom, type: 'horizontal' },
        { flow: oBounds.vCenter, type: 'horizontal' }
      ];

      for (const cand of candidates) {
        if (mode === 'drag') {
          if (Math.abs(nodeBounds.top - cand.flow) < SNAP_THRESHOLD) {
            result.y = cand.flow;
            result.helperLines.push({ type: 'horizontal', position: cand.flow });
            snappedY = true;
            break;
          }
          if (Math.abs(nodeBounds.bottom - cand.flow) < SNAP_THRESHOLD) {
            result.y = cand.flow - nodeHeight;
            result.helperLines.push({ type: 'horizontal', position: cand.flow });
            snappedY = true;
            break;
          }
        } else {
          if (Math.abs(nodeBounds.bottom - cand.flow) < SNAP_THRESHOLD) {
            result.height = cand.flow - nodeBounds.top;
            result.helperLines.push({ type: 'horizontal', position: cand.flow });
            snappedY = true;
            break;
          }
          if (Math.abs(nodeBounds.top - cand.flow) < SNAP_THRESHOLD) {
            result.y = cand.flow;
            result.height = nodeBounds.bottom - cand.flow;
            result.helperLines.push({ type: 'horizontal', position: cand.flow });
            snappedY = true;
            break;
          }
        }
      }
    }

    if (snappedX && snappedY) break;
  }

  return result;
};
