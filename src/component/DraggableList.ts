import DraggableComponent from "./DraggableComponent";

export default abstract class DraggableList {
  private readonly componentKeys: { [index: string]: DraggableComponent } = {};
  private sourceComponent: DraggableComponent | null = null;
  private targetComponent: DraggableComponent | null = null;
  private targetPosition: "beforebegin" | "afterend" | null = null;
  protected readonly list: DraggableComponent[] = [];
  protected readonly currentEl: HTMLElement;
  protected enrolledEvent: EnrolledEvent = {};

  protected constructor(currentEl: HTMLElement, list: DraggableComponent[]) {
    this.currentEl = currentEl;
    list.forEach((v) => v.link(this.absorb));
    this.list = list;
    this.enrolledEvent["DRAG_START"] = this.DRAG_START;
    this.enrolledEvent["DRAG_END"] = this.DRAG_END;
  }

  append(draggableComponent: DraggableComponent) {
    draggableComponent.link(this.absorb);
    this.list.push(draggableComponent);
    this.componentKeys[draggableComponent.key] = draggableComponent;
  }

  remove(draggableComponent: DraggableComponent) {
    const targetIdx = this.list.findIndex(v => v === draggableComponent);
    this.list.splice(targetIdx, 1);
    delete this.componentKeys[draggableComponent.key];
  }

  private mousemove = (e: MouseEvent) => {
    const { target } = e;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const currentComponentEl = target.closest(".draggable-component");
    if (!(currentComponentEl instanceof HTMLElement) || !currentComponentEl.dataset.key) {
      return;
    }
    const currentComponent = this.componentKeys[currentComponentEl.dataset.key];
    this.highlightTargetPosition(currentComponent, e);
  };

  private highlightTargetPosition = (currentComponent: DraggableComponent, e: MouseEvent) => {
    if (this.targetComponent !== currentComponent) {
      this.targetComponent?.removeHighlight();
      this.targetComponent = currentComponent;
    }
    if (this.targetComponent === null) {
      throw new Error("target component is null");
    }
    if (this.targetComponent.currentEl.offsetHeight / 2 > e.offsetY) {
      this.targetPosition = "beforebegin";
      this.targetComponent.highlight("beforebegin");
    } else {
      this.targetPosition = "afterend";
      this.targetComponent.highlight("afterend");
    }
  };

  private mouseleave = () => {
    this.targetComponent?.removeHighlight();
    this.targetComponent = null;
    this.targetPosition = null;
  };

  private moveComponent() {
    if (this.sourceComponent === null || this.targetComponent === null || this.targetPosition === null) {
      return;
    }

    const sourceIndex = this.list.findIndex(v => v === this.sourceComponent);
    const targetIndex = this.list.findIndex(v => v === this.targetComponent);
    this.list.splice(sourceIndex, 1);
    this.list.splice(targetIndex, 0, this.targetComponent);
    this.targetComponent.currentEl.insertAdjacentElement(this.targetPosition, this.sourceComponent.currentEl);
  }

  protected absorb: EventPipe = (action: string, component: DraggableComponent) => {
    if (!this.enrolledEvent[action]) {
      throw new Error("This is an unregistered action");
    }
    this.enrolledEvent[action](component);
  };

  private DRAG_START = (component: DraggableComponent) => {
    this.beforeDragStart();
    this.sourceComponent = component;
    this.currentEl.addEventListener("mousemove", this.mousemove);
    this.currentEl.addEventListener("mouseleave", this.mouseleave);
  };

  private DRAG_END = (_: DraggableComponent) => {
    this.targetComponent?.removeHighlight();
    this.moveComponent();
    this.sourceComponent = null;
    this.targetComponent = null;
    this.targetPosition = null;
    this.currentEl.removeEventListener("mousemove", this.mousemove);
    this.currentEl.removeEventListener("mouseleave", this.mouseleave);
    this.afterDragEnd();
  };

  protected abstract beforeDragStart(): void;

  protected abstract afterDragEnd(): void;
}
