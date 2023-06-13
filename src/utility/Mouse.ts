import Position from "./Position";

export default class Mouse {
  private clickedPosition: Position | null;
  private readonly dragSensitivity: number;

  constructor(dragSensitivity: number) {
    this.dragSensitivity = dragSensitivity;
  }

  click(curPosition: Position) {
    this.clickedPosition = curPosition;
  }

  isDragged(curPosition: Position) {
    return this.clickedPosition.getDistance(curPosition) > this.dragSensitivity;
  }
}

