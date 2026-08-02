export function getRelativePos(el, canvasEl) {
  let x = el.offsetLeft;
  let y = el.offsetTop;
  let parent = el.offsetParent;
  while (parent && parent !== canvasEl) {
    x += parent.offsetLeft;
    y += parent.offsetTop;
    parent = parent.offsetParent;
  }
  return { x, y };
}

export function calculateLines({ nodes, stages, nodesByStage, nodeRefs, canvasRef }) {
  if (!canvasRef.current) return [];

  const newLines = [];

  nodes.forEach((source) => {
    const sourceEl = nodeRefs.current[source.id];
    if (!sourceEl) return;

    const sourcePos = getRelativePos(sourceEl, canvasRef.current);
    const sourceWidth = sourceEl.offsetWidth;
    const sourceHeight = sourceEl.offsetHeight;

    const startX = sourcePos.x + sourceWidth / 2;
    const startY = sourcePos.y + sourceHeight;

    const sourceStageIndex = stages.indexOf(source.stage);

    source.targets.forEach((targetId) => {
      const targetEl = nodeRefs.current[targetId];
      const targetNode = nodes.find((n) => n.id === targetId);
      if (!targetEl || !targetNode) return;

      const targetPos = getRelativePos(targetEl, canvasRef.current);
      const targetWidth = targetEl.offsetWidth;

      const endX = targetPos.x + targetWidth / 2;
      const endY = targetPos.y;

      const targetStageIndex = stages.indexOf(targetNode.stage);

      let d = '';

      // Orthogonal routing for skipped stages
      if (targetStageIndex - sourceStageIndex > 1) {
        let minX = Infinity;
        let maxX = -Infinity;

        for (let t = sourceStageIndex + 1; t < targetStageIndex; t++) {
          const intermediateStageName = stages[t];
          nodesByStage[intermediateStageName].forEach((n) => {
            const el = nodeRefs.current[n.id];
            if (el) {
              const pos = getRelativePos(el, canvasRef.current);
              minX = Math.min(minX, pos.x);
              maxX = Math.max(maxX, pos.x + el.offsetWidth);
            }
          });
        }

        if (minX !== Infinity) {
          const goLeft = (startX + endX) / 2 < (minX + maxX) / 2;
          // randomUUID strings might have non-numeric characters, so we hash the id minimally for jitter
          const sourceJitter = source.id.charCodeAt(0) || 0;
          const targetJitter = targetId.charCodeAt(0) || 0;
          const jitter = (sourceJitter + targetJitter) % 25;
          const channelX = goLeft ? minX - 30 - jitter : maxX + 30 + jitter;

          const y1 = startY + 25;
          const y2 = endY - 25;

          const dir1 = channelX > startX ? 1 : -1;
          const R1 = Math.min(12, Math.abs(channelX - startX) / 2);

          const dir2 = endX > channelX ? 1 : -1;
          const R2 = Math.min(12, Math.abs(endX - channelX) / 2);

          d = `M ${startX},${startY} 
               L ${startX},${y1 - R1} 
               Q ${startX},${y1} ${startX + R1 * dir1},${y1} 
               L ${channelX - R1 * dir1},${y1} 
               Q ${channelX},${y1} ${channelX},${y1 + R1} 
               L ${channelX},${y2 - R2} 
               Q ${channelX},${y2} ${channelX + R2 * dir2},${y2} 
               L ${endX - R2 * dir2},${y2} 
               Q ${endX},${y2} ${endX},${y2 + R2} 
               L ${endX},${endY}`;
        }
      }

      if (!d) {
        // Standard direct bezier
        const yMid = (startY + endY) / 2;
        d = `M ${startX},${startY} C ${startX},${yMid} ${endX},${yMid} ${endX},${endY}`;
      }

      newLines.push({
        id: `${source.id}-${targetId}`,
        d,
        color: '#10B981' // Emerald-500
      });
    });
  });

  return newLines;
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
