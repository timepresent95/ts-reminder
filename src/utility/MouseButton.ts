import Position from "./Position";

export default class MouseButton {

  get isDragged(): boolean {
    return this._isDragged;
  }

  private isClicked: boolean = false;
  private _isDragged: boolean = false;
  private dragDistance: number;
  private clickedPosition: Position | null = null;
  private prevPosition: Position | null = null;
  private readonly dragSensitivity: number;

  constructor();
  constructor(dragSensitivity: number);
  constructor(dragSensitivity?: number) {
    this.dragSensitivity = dragSensitivity ?? 10;
    this.dragDistance = 0;
  }


  click(curPosition: Position) {
    if (this.isClicked) {
      throw new Error("duplicated mouse click");
    }
    this.isClicked = true;
    this.clickedPosition = curPosition;
    this.prevPosition = curPosition;
  }

  release() {
    if (!this.isClicked) {
      throw new Error("duplicated mouse release");
    }
    this.isClicked = false;
    this._isDragged = false;
    this.dragDistance = 0;
  }

  move(curPosition: Position) {
    if (!this.isClicked || this.isDragged || this.prevPosition === null) {
      return;
    }
    this.dragDistance += this.prevPosition.getDistance(curPosition);
    this.prevPosition = curPosition;
    this._isDragged = this.dragDistance > this.dragSensitivity;
  }
}

