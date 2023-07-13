import Schedule from "./Schedule";
import DraggableList from "./DraggableList";
import DraggableComponent from "./DraggableComponent";
import KeydownEventHandler from "../utility/KeydownEventHandler";
import Position from "../utility/Position";
import { createRandomKey } from "../utility/Random";
import ContextMenu from "./ContextMenu";

export default class ScheduleList extends DraggableList {
  private readonly allCompletedEl = document.createElement("p");
  private readonly mainEl = document.createElement("main");
  private editItem: Schedule | null = null;
  private selectedItems: { [key: string]: Schedule } = {};
  private selectedItemQueue: Schedule[] = [];
  private contextSelectedItems: { [key: string]: Schedule } = {};
  private keydownEventHandler: KeydownEventHandler = KeydownEventHandler.getInstance();
  private contextMenu: ContextMenu = ContextMenu.getInstance();
  private renderingEl: HTMLElement;

  constructor(schedules?: Schedule[]) {
    super(document.createElement("ol"), schedules ?? []);
    this.currentEl.classList.add("schedules");
    this.list.forEach((item) => {
      if (!(item instanceof Schedule)) {
        throw new Error("this item is not Schedule");
      }
      this.currentEl.appendChild(item.create());
      item.render();
    });
    if (this.list.length === 0) {
      this.renderingEl = this.allCompletedEl;
      this.mainEl.appendChild(this.allCompletedEl);
    } else {
      this.renderingEl = this.currentEl;
      this.mainEl.appendChild(this.currentEl);
    }


    this.allCompletedEl.classList.add("all-completed", "my-auto", "text-h2", "text-g3");
    this.allCompletedEl.textContent = "All Items Completed";

    this.mainEl.classList.add("schedule-list");

    this.enrolledEvent["CREATE_NEW_SCHEDULE"] = this.CREATE_NEW_SCHEDULE;
    this.enrolledEvent["EDIT"] = this.EDIT;
    this.enrolledEvent["REMOVE"] = this.REMOVE;
    this.enrolledEvent["SELECT"] = this.SELECT;
    this.enrolledEvent["MULTI_SELECT"] = this.MULTI_SELECT;
    this.enrolledEvent["RANGE_SELECT"] = this.RANGE_SELECT;

    this.currentEl.addEventListener("click", this.clickOutSideHandler);
    this.allCompletedEl.addEventListener("click", this.clickOutSideHandler);

    this.currentEl.addEventListener("contextmenu", this.contextmenuHandler);
  }

  protected beforeDragStart = () => {
    this.reset();
    this.mainEl.removeEventListener("click", this.clickOutSideHandler);
    this.allCompletedEl.removeEventListener("click", this.clickOutSideHandler);
  };

  protected afterDragEnd = () => {
    this.mainEl.addEventListener("click", this.clickOutSideHandler);
    this.allCompletedEl.addEventListener("click", this.clickOutSideHandler);
  };

  private CREATE_NEW_SCHEDULE = () => {
    this.createNewSchedule();
  };

  private EDIT = (item: DraggableComponent) => {
    if (!(item instanceof Schedule)) {
      throw new Error("this item is not Schedule");
    }
    this.reset();
    this.editItem = item;
  };

  private REMOVE = (item: DraggableComponent) => {
    if (!(item instanceof Schedule)) {
      throw new Error("this item is not Schedule");
    }
    this.editItem = null;
    this.removeSchedules([item]);
  };

  private SELECT = (item: DraggableComponent) => {
    if (!(item instanceof Schedule)) {
      throw new Error("this item is not Schedule");
    }
    this.reset();
    this.doSelect(item);
  };

  private MULTI_SELECT = (item: DraggableComponent) => {
    if (!(item instanceof Schedule)) {
      throw new Error("this item is not Schedule");
    }
    if (item.selected) {
      this.cancelSelect(item);
    } else {
      this.editItem?.endEditMode();
      this.editItem = null;
      this.doSelect(item);
    }
  };

  //FIXME: type assertion 제거하기
  private RANGE_SELECT = (item: DraggableComponent) => {
    if (this.selectedItemQueue.length === 0) {
      const firstEl = this.currentEl.firstElementChild;
      if (!(firstEl instanceof HTMLElement)) {
        throw new Error("schedule list children must be HTMLElement");
      }
      const key = firstEl.dataset.key;
      if (key === undefined || !(this.componentKeys[key] instanceof DraggableComponent)) {
        throw new Error("schedule list children has wrong data-key value");
      }
      this.rangeSelect(this.componentKeys[key], item);
      return;
    }

    let prevCursor: DraggableComponent | null = item;
    let nextCursor: DraggableComponent | null = item;
    let endPoint = this.selectedItemQueue[this.selectedItemQueue.length - 1];
    while (true) {
      if (prevCursor === endPoint) {
        this.rangeSelect(endPoint, item);
        break;
      }
      if (nextCursor === endPoint) {
        this.rangeSelect(item, endPoint);
        break;
      }
      if (prevCursor !== null) {
        prevCursor = prevCursor.prev;
      }
      if (nextCursor !== null) {
        nextCursor = nextCursor.next;
      }
    }
  };

  private rangeSelect(begin: DraggableComponent, end: DraggableComponent) {
    let cursor: DraggableComponent | null = begin;
    while (true) {
      if (!(cursor instanceof Schedule)) {
        throw new Error("this item is not Schedule");
      }
      this.doSelect(cursor);
      if(cursor === end) {
        break;
      }
      cursor = cursor.next;
    }
  }

  private resetSelect() {
    this.selectedItemQueue.forEach(v => v.selected = false);
    this.selectedItemQueue = [];
    this.selectedItems = {};
    this.keydownEventHandler.removeEvent();
  }

  private doSelect(item: Schedule) {
    this.selectedItems[item.key] = item;
    this.selectedItemQueue = this.selectedItemQueue.filter(v => v !== item);
    this.selectedItemQueue.push(item);
    item.selected = true;
    this.keydownEventHandler.setEvent(this.keydown);
  }

  private contextmenuHandler = (e: MouseEvent) => {
    this.contextMenu.show(new Position(e.clientX, e.clientY), [{
      title: "Delete",
      key: createRandomKey(),
      disable: false,
      func: this.removeSelectedSchedule
    }], { Backspace: this.removeSelectedSchedule }, this.renderingEl);
    // TODO: 선택 값들 border 표시 변경
  };

  private keydown = (e: KeyboardEvent) => {
    if (this.selectedItemQueue.length === 0) {
      throw new Error("keydown event can not occur when nothing is selected");
    }
    const lastSelectedItem = this.selectedItemQueue[this.selectedItemQueue.length - 1];
    const { head, tail } = this.getSelectedAdjacentRange(lastSelectedItem);
    if (e.code === "Backspace") {
      return this.removeSelectedSchedule();
    }


    //FIXME: type assertion 제거하기
    switch (e.code) {
    case "ArrowDown":
      if (!e.shiftKey) {
        this.resetSelect();
      }
      this.doSelect(<Schedule>(tail.next === null ? tail : tail.next));
      break;
    case "ArrowUp":
      if (!e.shiftKey) {
        this.resetSelect();
      }
      this.doSelect(<Schedule>(head.prev === null ? head : head.prev));
      break;
    default:
      return;
    }
  };

  private cancelSelect(item: Schedule) {
    delete this.selectedItems[item.key];
    this.selectedItemQueue = this.selectedItemQueue.filter(v => v !== item);
    item.selected = false;
    if (this.selectedItemQueue.length === 0) {
      this.keydownEventHandler.removeEvent();
    }
  }

  private clickOutSideHandler = (e: MouseEvent) => {
    if (e.button !== 0 || e.target !== e.currentTarget) {
      return;
    }
    if (this.editItem === null) {
      this.reset();
      this.createNewSchedule();
    } else {
      this.reset();
    }
  };

  reset() {
    this.editItem?.endEditMode();
    this.editItem = null;
    this.resetSelect();
  }

  createNewSchedule() {
    this.reset();
    const newSchedule = new Schedule();
    this.append(newSchedule);
    this.toggleEmptyText();
    newSchedule.startEditMode("input");
    this.editItem = newSchedule;
  }

  private removeSelectedSchedule = () => {
    this.removeSchedules(this.selectedItemQueue);
    this.resetSelect();
  };

  private removeSchedules = (targetList: Schedule[]) => {
    targetList.forEach(v => {
      this.currentEl.removeChild(v.currentEl);
      this.remove(v);
    });
    this.toggleEmptyText();
  };

  // private compareFn = (first: DraggableComponent, second: DraggableComponent) => {
  //   if (!(first instanceof Schedule) || !(second instanceof Schedule)) {
  //     throw new Error("this item is not Schedule");
  //   }
  //   if (first === this.editItem) {
  //     return 1;
  //   }
  //   if (second === this.editItem) {
  //     return -1;
  //   }
  //   if (first.isCompleted === second.isCompleted) {
  //     return 0;
  //   } else {
  //     return first.isCompleted ? 1 : -1;
  //   }
  // };


  //FIXME: type assertion 제거하기
  private getSelectedAdjacentRange(source: Schedule) {
    let head: Schedule = source, tail: Schedule = source;
    while (true) {
      if (head.prev === null || !this.selectedItemQueue.includes(<Schedule>head.prev)) {
        break;
      }
      head = <Schedule>head.prev;
    }
    while (true) {
      if (tail.next === null || !this.selectedItemQueue.includes(<Schedule>tail.next)) {
        break;
      }
      tail = <Schedule>tail.next;
    }
    return { head, tail };
  }

  // private getContextSelectedBorderClass = (key: string, idx: number): string[] => {
  //   const ret: string[] = [];
  //   if (!this.contextSelectedItemKeys.includes(key)) {
  //     return ret;
  //   }
  //   ret.push("context-selected");
  //   if (idx === 0 || !this.contextSelectedItemKeys.includes(this.schedules[idx - 1].key)) {
  //     ret.push("context-selected-border-top");
  //   }
  //   if (idx === this.schedules.length - 1 || !this.contextSelectedItemKeys.includes(this.schedules[idx + 1].key)) {
  //     ret.push("context-selected-border-bottom");
  //   }
  //   return ret;
  // };

  private toggleEmptyText() {
    if (this.list.length === 0 && this.renderingEl === this.currentEl) {
      this.mainEl.replaceChild(this.allCompletedEl, this.currentEl);
      this.renderingEl = this.allCompletedEl;
    }
    if (this.list.length > 0 && this.renderingEl === this.allCompletedEl) {
      this.mainEl.replaceChild(this.currentEl, this.allCompletedEl);
      this.renderingEl = this.currentEl;
    }
  }

  render() {
    this.toggleEmptyText();
  }

  create() {
    return this.mainEl;
  }
}
