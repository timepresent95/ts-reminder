import Position from "../utility/Position";

export default class ContextMenu {
  private readonly currentEl: HTMLElement;
  private readonly contextMenuListEl: HTMLUListElement;
  private readonly eventBus: (action: string) => void;

  constructor(eventBus: (action: string) => void) {
    const currentElement = document.getElementById("context-menu");
    const contextMenuListElement = document.querySelector("ul");
    if (currentElement === null || contextMenuListElement === null) {
      throw new Error("contextMenu is not exist");
    }
    this.currentEl = currentElement;
    this.contextMenuListEl = contextMenuListElement;
    this.eventBus = eventBus;
    this.currentEl.addEventListener("mouseup", (e) => {
      if (e.button !== 0) {
        return;
      }
      e.stopPropagation();

      const { target } = e;
      if (target instanceof HTMLElement && target.dataset.function !== undefined) {
        this.eventBus(target.dataset.function);
      }
      this.hide();
    });
  }

  show(position: Position) {
    const normalizedPosition = this.normalizePosition(position);
    this.contextMenuListEl.style.left = normalizedPosition.x + "px";
    this.contextMenuListEl.style.top = normalizedPosition.y + "px";
    this.currentEl.classList.remove("d-none");
  }

  private hide() {
    this.currentEl.classList.add("d-none");
  }

  private normalizePosition(position: Position) {
    const width = this.currentEl.clientWidth;
    const height = this.currentEl.clientHeight;
    const outOfBoundsOnX = position.x + width > document.body.clientWidth;
    const outOfBoundsOnY = position.y + height > document.body.clientHeight;
    let normalizedX = position.x;
    let normalizedY = position.y;

    if (outOfBoundsOnX && outOfBoundsOnY) {
      normalizedX = position.x - width;
      normalizedY = position.y - height;
    } else if (outOfBoundsOnX) {
      normalizedX = position.x - width;
    } else if (outOfBoundsOnY) {
      normalizedY = position.y - height;
    }

    return new Position(normalizedX, normalizedY);
  }
}
