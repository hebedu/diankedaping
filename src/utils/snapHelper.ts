import { type Node } from 'reactflow';

export interface HelperLine {
  type: 'vertical' | 'horizontal';
  position: number;
}

const SNAP_THRESHOLD = 10; // 缩放时稍微增加灵敏度

export const getSmartSnapPos = (
  node: Node,
  allNodes: Node[],
  mode: 'drag' | 'resize' = 'drag',
  direction?: number[] // [x, y] 其中 x,y 为 -1, 0, 1，表示拉动的方向
) => {
  const result = {
    x: node.position.x,
    y: node.position.y,
    width: node.width || node.style?.width || 0,
    height: node.height || node.style?.height || 0,
    helperLines: [] as HelperLine[],
  };

  // 确保宽度高度是数值
  const nodeWidth = typeof result.width === 'number' ? result.width : parseInt(String(result.width));
  const nodeHeight = typeof result.height === 'number' ? result.height : parseInt(String(result.height));
  
  const nodeBounds = {
    left: result.x,
    right: result.x + nodeWidth,
    hCenter: result.x + nodeWidth / 2,
    top: result.y,
    bottom: result.y + nodeHeight,
    vCenter: result.y + nodeHeight / 2,
  };

  const otherNodes = allNodes.filter(n => n.id !== node.id && n.type === 'region');

  let snappedX = false;
  let snappedY = false;

  for (const other of otherNodes) {
    const oX = other.position.x;
    const oY = other.position.y;
    const oW = (other.width || other.style?.width || 0) as number;
    const oH = (other.height || other.style?.height || 0) as number;

    const oBounds = {
      left: oX,
      right: oX + oW,
      hCenter: oX + oW / 2,
      top: oY,
      bottom: oY + oH,
      vCenter: oY + oH / 2,
    };

    // --- 水平方向 ---
    if (!snappedX) {
      const candidates = [
        { flow: oBounds.left, type: 'vertical' },
        { flow: oBounds.right, type: 'vertical' },
        { flow: oBounds.hCenter, type: 'vertical' }
      ];

      for (const cand of candidates) {
        if (mode === 'drag') {
          if (Math.abs(nodeBounds.left - cand.flow) < SNAP_THRESHOLD) {
            result.x = cand.flow;
            result.helperLines.push({ type: 'vertical', position: cand.flow });
            snappedX = true; break;
          }
          if (Math.abs(nodeBounds.right - cand.flow) < SNAP_THRESHOLD) {
            result.x = cand.flow - nodeWidth;
            result.helperLines.push({ type: 'vertical', position: cand.flow });
            snappedX = true; break;
          }
        } else if (direction) {
          // 缩放模式：仅对正在移动的边缘进行吸附
          // 拉动右侧 (direction[0] === 1)
          if (direction[0] === 1 && Math.abs(nodeBounds.right - cand.flow) < SNAP_THRESHOLD) {
            result.width = Math.max(100, cand.flow - nodeBounds.left);
            result.helperLines.push({ type: 'vertical', position: cand.flow });
            snappedX = true; break;
          }
          // 拉动左侧 (direction[0] === -1)
          if (direction[0] === -1 && Math.abs(nodeBounds.left - cand.flow) < SNAP_THRESHOLD) {
            result.x = cand.flow;
            result.width = Math.max(100, nodeBounds.right - cand.flow);
            result.helperLines.push({ type: 'vertical', position: cand.flow });
            snappedX = true; break;
          }
        }
      }
    }

    // --- 垂直方向 ---
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
            snappedY = true; break;
          }
          if (Math.abs(nodeBounds.bottom - cand.flow) < SNAP_THRESHOLD) {
            result.y = cand.flow - nodeHeight;
            result.helperLines.push({ type: 'horizontal', position: cand.flow });
            snappedY = true; break;
          }
        } else if (direction) {
          // 缩放模式：仅对正在移动的边缘进行吸附
          // 拉动底部 (direction[1] === 1)
          if (direction[1] === 1 && Math.abs(nodeBounds.bottom - cand.flow) < SNAP_THRESHOLD) {
            result.height = Math.max(100, cand.flow - nodeBounds.top);
            result.helperLines.push({ type: 'horizontal', position: cand.flow });
            snappedY = true; break;
          }
          // 拉动顶部 (direction[1] === -1)
          if (direction[1] === -1 && Math.abs(nodeBounds.top - cand.flow) < SNAP_THRESHOLD) {
            result.y = cand.flow;
            result.height = Math.max(100, nodeBounds.bottom - cand.flow);
            result.helperLines.push({ type: 'horizontal', position: cand.flow });
            snappedY = true; break;
          }
        }
      }
    }

    if (snappedX && snappedY) break;
  }

  return result;
};
