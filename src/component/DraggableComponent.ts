import Position from "../utility/Position";

export default class DraggableComponent {
  private readonly dragSensitivity: number;
  private isClicked: boolean = false;
  private clickedPosition: Position | null = null;
  private prevPosition: Position | null = null;
  private dragDistance: number = 0;
  prev: DraggableComponent | null = null;
  next: DraggableComponent | null = null;
  protected draggableQuery: string[] = [];
  protected emit: null | DragEventPipe = null;
  readonly currentEl: HTMLElement;
  readonly key: string;

  protected constructor(currentEl: HTMLElement, key: string) {
    this.currentEl = currentEl;
    this.dragSensitivity = 3;
    currentEl.classList.add("draggable-component");
    currentEl.addEventListener("mousedown", this.mousedown);
    this.key = key;
    this.currentEl.dataset.key = this.key;
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

  link(emit: DragEventPipe){
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

