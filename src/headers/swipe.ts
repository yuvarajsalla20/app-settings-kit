/** Swipe from the left edge to go back: where the finger must start (pt from the edge), how far across to let go (share of the width), or how fast a flick (pt per ms), and the slide-away time. */
export const SWIPE_BACK = { edge: 28, distance: 0.35, speed: 0.5, slideMs: 180 } as const;

/** True when a drag is a swipe back: it started at the left edge and is moving right more than up or down. */
export const isEdgeSwipe = (startX: number, dx: number, dy: number): boolean => startX <= SWIPE_BACK.edge && dx > 8 && Math.abs(dx) > Math.abs(dy) * 1.5;

/** True when letting go should finish going back: dragged far enough across, or flicked to the right. */
export const finishesSwipe = (dx: number, vx: number, width: number): boolean => dx > width * SWIPE_BACK.distance || (dx > 0 && vx > SWIPE_BACK.speed);
