export default class Position {
  x: number;
  y: number;

  constructor(x:number, y:number) {
    this.x = x;
    this.y = y;
  }

  getDistance(targetPosition: Position): number {
    return Math.pow(Math.pow(this.x - targetPosition.x, 2) + Math.pow(this.y - targetPosition.y, 2), 0.5);
  }

  normalizePosition(currentEl: HTMLElement) {
    const width = currentEl.offsetWidth;
    const height = currentEl.offsetHeight;
    const outOfBoundsOnX = this.x + width > document.body.offsetWidth;
    const outOfBoundsOnY = this.y + height > document.body.offsetHeight;
    let normalizedX = this.x;
    let normalizedY = this.y;

    if (outOfBoundsOnX && outOfBoundsOnY) {
      normalizedX = this.x - width;
      normalizedY = this.y - height;
    } else if (outOfBoundsOnX) {
      normalizedX = this.x - width;
    } else if (outOfBoundsOnY) {
      normalizedY = this.y - height;
    }

    return new Position(normalizedX, normalizedY);
  }
}
