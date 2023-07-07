import Position from "./Position";

export default class DraggableComponent {
  private readonly dragSensitivity: number;
  private isClicked: boolean = false;
  private clickedPosition: Position | null = null;
  private prevPosition: Position | null = null;
  private dragDistance: number = 0;
  protected draggableQuery: string[] = [];
  protected emit: null | EventPipe = null;
  readonly currentEl: HTMLElement;
  readonly key: string;

  protected constructor(currentEl: HTMLElement);
  protected constructor(currentEl: HTMLElement, dragSensitivity: number);
  protected constructor(currentEl: HTMLElement, dragSensitivity?: number) {
    this.currentEl = currentEl;
    this.dragSensitivity = dragSensitivity ?? 3;
    currentEl.classList.add("draggable-component");
    currentEl.addEventListener("mousedown", this.mousedown);
    this.key = this.createRandomKey();
    this.currentEl.dataset.key = this.key;
  }

  private createRandomKey(): string {
    return (Math.random() + 1).toString(36).substring(7) + Date.now();
  }

  reset = () => {
    this.isClicked = false;
    this.clickedPosition = null;
    this.prevPosition = null;
    this.dragDistance = 0;
    this.currentEl.removeEventListener("mousemove", this.move);
    window.removeEventListener("mouseup", this.mouseup);
  };

  private dragStartHandler(): void {
    if (this.emit === null) {
      throw new Error("Component is not linked");
    }
    this.emit("DRAG_START", this);
  }

  private mousedown = (e: MouseEvent) => {
    if (e.button !== 0 || e.metaKey || e.shiftKey) {
      return;
    }
    const { target } = e;
    if (!(target instanceof HTMLElement) || this.draggableQuery.length === 0 && !this.draggableQuery.some(q => target === this.currentEl.querySelector(q))) {
      return;
    }
    const curPosition = new Position(e.clientX, e.clientY);
    this.isClicked = true;
    this.clickedPosition = curPosition;
    this.prevPosition = curPosition;
    this.currentEl.addEventListener("mousemove", this.move);
    window.addEventListener("mouseup", this.mouseup);
  };

  private mouseup = () => {
    if (this.emit === null) {
      throw new Error("Component is not linked");
    }
    this.reset();
    this.emit("DRAG_END", this);
  };

  private move = (e: MouseEvent) => {
    if (this.prevPosition === null) {
      throw new Error("mouse prevPosition is null");
    }
    const curPosition = new Position(e.clientX, e.clientY);
    this.dragDistance += this.prevPosition.getDistance(curPosition);
    this.prevPosition = curPosition;
    if (this.dragDistance > this.dragSensitivity) {
      this.dragStartHandler();
    }
  };

  link(emit: EventPipe){
   this.emit = emit;
  }

  highlight = (position: "beforebegin" | "afterend") => {
    this.removeHighlight();
    switch (position) {
    case "beforebegin":
      this.currentEl.classList.add("border-begin");
      break;
    case "afterend":
      this.currentEl.classList.add("border-end");
      break;
    default:
    }
  };

  removeHighlight = () => {
    this.currentEl.classList.remove("border-begin", "border-end");
  };
}

