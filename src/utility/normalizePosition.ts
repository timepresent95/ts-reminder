import Position from "./Position";

export function normalizePosition(mouse: Position, width: number, height: number) {
  const outOfBoundsOnX = mouse.x + width > document.body.clientWidth;
  const outOfBoundsOnY = mouse.y + height > document.body.clientHeight;

  let normalizedX = mouse.x;
  let normalizedY = mouse.y;

  if (outOfBoundsOnX && outOfBoundsOnY) {
    normalizedX = mouse.x - width;
    normalizedY = mouse.y - height;
  } else if (outOfBoundsOnX) {
    normalizedX = mouse.x - width;
  } else if (outOfBoundsOnY) {
    normalizedY = mouse.y - height;
  }

  return { normalizedX, normalizedY };
}
