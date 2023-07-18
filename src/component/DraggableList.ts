import DraggableComponent from "./DraggableComponent";

export default abstract class DraggableList {
  protected readonly componentKeys: { [index: string]: DraggableComponent } = {};
  private sourceComponent: DraggableComponent | null = null;
  private targetComponent: DraggableComponent | null = null;
  private targetPosition: "beforebegin" | "afterend" | null = null;
  protected readonly list: DraggableComponent[] = [];
  protected readonly currentEl: HTMLElement;
  protected enrolledEvent: EnrolledDragEvent = {};

  protected constructor(currentEl: HTMLElement, list: DraggableComponent[]) {
    this.currentEl = currentEl;
    list.forEach((v, i) => {
      v.link(this.absorb);
      v.prev = i === 0 ? null : list[i - 1];
      v.next = i === list.length - 1 ? null : list[i + 1];
      this.componentKeys[v.key] = v;
    });
    this.list = list;
    this.enrolledEvent["DRAG_START"] = this.DRAG_START;
    this.enrolledEvent["DRAG_END"] = this.DRAG_END;
  }

  append(draggableComponent: DraggableComponent) {
    draggableComponent.link(this.absorb);
    this.list.push(draggableComponent);
    this.componentKeys[draggableComponent.key] = draggableComponent;
    const lastEl = this.currentEl.lastElementChild;
    if (lastEl === null) {
      this.currentEl.append(draggableComponent.currentEl);
    } else {
      if (!(lastEl instanceof HTMLElement)) {
        throw new Error("draggable list children must be HTMLElement");
      }
      const key = lastEl.dataset.key;
      if (key === undefined || !(this.componentKeys[key] instanceof DraggableComponent)) {
        throw new Error("draggable list children has wrong data-key value");
      }
      this.componentKeys[key].next = draggableComponent;
      draggableComponent.prev = this.componentKeys[key];
      lastEl?.insertAdjacentElement("afterend", draggableComponent.currentEl);
    }
  }

  remove(draggableComponent: DraggableComponent) {
    const targetIdx = this.list.findIndex(v => v === draggableComponent);
    const prev = draggableComponent.prev;
    const next = draggableComponent.next;
    if (prev !== null) {
      prev.next = next;
    }
    if (next !== null) {
      next.prev = prev;
    }
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
    const sourcePrev = this.sourceComponent.prev;
    const sourceNext = this.sourceComponent.next;
    if (sourcePrev !== null) {
      sourcePrev.next = sourceNext;
    }
    if (sourceNext !== null) {
      sourceNext.prev = sourcePrev;
    }

    let targetPrev: DraggableComponent | null;
    let targetNext: DraggableComponent | null;
    if (this.targetPosition === "beforebegin") {
      targetPrev = this.targetComponent.prev;
      targetNext = this.targetComponent;
    } else {
      targetPrev = this.targetComponent;
      targetNext = this.targetComponent.next;
    }

    this.sourceComponent.prev = targetPrev;
    this.sourceComponent.next = targetNext;
    if (targetPrev !== null) {
      targetPrev.next = this.sourceComponent;
    }
    if (targetNext !== null) {
      targetNext.prev = this.sourceComponent;
    }

    this.targetComponent.currentEl.insertAdjacentElement(this.targetPosition, this.sourceComponent.currentEl);
  }

  protected absorb: DragEventPipe = (action: string, component: DraggableComponent) => {
    if (this.enrolledEvent[action] === undefined) {
      throw new Error("This is an unregistered action");
    }
    this.enrolledEvent[action](component);
  };

  private DRAG_START = (component: DraggableComponent) => {
    this.beforeDragStart(component);
    this.sourceComponent = component;
    this.currentEl.addEventListener("mousemove", this.mousemove);
    this.currentEl.addEventListener("mouseleave", this.mouseleave);
  };

  private DRAG_END = (component: DraggableComponent) => {
    this.targetComponent?.removeHighlight();
    this.moveComponent();
    this.sourceComponent = null;
    this.targetComponent = null;
    this.targetPosition = null;
    this.currentEl.removeEventListener("mousemove", this.mousemove);
    this.currentEl.removeEventListener("mouseleave", this.mouseleave);
    this.afterDragEnd(component);
  };

  protected abstract beforeDragStart(component: DraggableComponent): void;

  protected abstract afterDragEnd(component: DraggableComponent): void;
}
