/** Size of the visible editor stage (canvas element dimensions). */
export function getStageSize(stageEl, fallbackW = 900, fallbackH = 600) {
  const w = stageEl?.clientWidth || fallbackW;
  const h = stageEl?.clientHeight || fallbackH;
  return { width: Math.max(320, w), height: Math.max(320, h) };
}

/** Scale a fabric image to cover the stage (background template). */
export function fitImageToStage(img, stageW, stageH, padding = 0.92) {
  const size = typeof img.getOriginalSize === 'function'
    ? img.getOriginalSize()
    : { width: img.width || 1, height: img.height || 1 };
  const iw = size.width || 1;
  const ih = size.height || 1;
  const scale = Math.min(stageW / iw, stageH / ih) * padding;

  img.set({
    left: stageW / 2,
    top: stageH / 2,
    originX: 'center',
    originY: 'center',
    scaleX: scale,
    scaleY: scale,
    selectable: false,
    evented: false,
  });

  return { stageW, stageH, scale };
}
