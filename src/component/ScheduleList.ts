import Schedule from "./Schedule";
import MouseButton from "../utility/MouseButton";
import Position from "../utility/Position";
import KeydownEventHandler from "../utility/KeydownEventHandler";

export default class ScheduleList {
  private readonly currentEl = document.getElementById("schedules");
  private readonly allCompletedEl = document.getElementById("all-completed");
  private readonly rightMouseButton: MouseButton = new MouseButton();
  private readonly keydownEventHandler: KeydownEventHandler = KeydownEventHandler.getInstance();
  private editableItem: Schedule | null = null;
  private editableItemKey: string | null = null;
  private focusTarget: "input" | "textarea" | null = null;
  schedules: Schedule[];
  selectedItemKeys: string[] = [];
  contextSelectedItemKeys: string[] = [];
  eventTargetScheduleKey: string | null = null;

  constructor();
  constructor(schedules: Schedule[]);
  constructor(schedules?: Schedule[]) {
    if (!(this.currentEl instanceof HTMLOListElement)) {
      throw new Error("schedules Element is not exist");
    }
    if (this.allCompletedEl === null) {
      throw new Error("allCompleted Element is not exist");
    }
    this.schedules = schedules ?? [];
    this.currentEl.classList.add("schedules");
    this.currentEl.addEventListener("mousedown", this.rightMousedownEvent());
    this.currentEl.addEventListener("mousemove", this.rightMousemoveEvent());
    this.currentEl.addEventListener("mouseup", this.rightMouseupEvent);
    this.currentEl.addEventListener("keydown", this.keydownEvent);
    this.currentEl.addEventListener("input", this.inputEvent);
  }

  reset() {
    this.editableItem = null;
    this.editableItemKey = null;
    this.focusTarget = null;
    this.selectedItemKeys = [];
    this.contextSelectedItemKeys = [];
    this.eventTargetScheduleKey = null;
    this.keydownEventHandler.removeEvent();
    this.render();
  }

  createNewSchedule(toggle: boolean = false) {
    const preEditableItem = this.editableItem;
    this.reset();
    if (!toggle || preEditableItem === null) {
      const newSchedule = new Schedule();
      this.schedules.push(newSchedule);
      this.setEditableItem(newSchedule);
      this.focusTarget = "input";
    }
    this.render();
  }

  private setEditableItemByKey(scheduleKey: string) {
    this.editableItem = this.schedules.find((v) => v.key === scheduleKey) ?? null;
    this.editableItemKey = scheduleKey;
    this.selectedItemKeys = [];
    this.contextSelectedItemKeys = [];
  }

  private setEditableItem(schedule: Schedule) {
    this.editableItem = schedule;
    this.editableItemKey = schedule.key;
  }

  resetEditableItemKey() {
    this.editableItemKey = null;
    this.editableItem = null;
  }

  resetSelectedItemKeys() {
    this.selectedItemKeys = [];
    this.contextSelectedItemKeys = [];
  }

  private inputEvent = (e: Event) => {
    if (this.editableItem === null) {
      throw new Error("editable item is not exist");
    }

    const { target } = e;
    if (target instanceof HTMLInputElement) {
      this.editableItem.title = target.value;
    }
    if (target instanceof HTMLTextAreaElement) {
      const rowCount = target.value.split("\n").length;
      target.setAttribute("rows", rowCount.toString());
      this.editableItem.notes = target.value.trim().replace(/\n/gi, "</br>");
    }
  };

  private keydownEvent = (e: KeyboardEvent) => {
    if (this.editableItem === null) {
      throw new Error("editable item is not exist");
    }

    const { target } = e;
    if (!(target instanceof HTMLInputElement) || e.code !== "Enter") {
      return;
    }
    if (this.editableItem.title.trim() === "") {
      this.focusTarget = null;
      this.resetEditableItemKey();
      this.render();
      return;
    }
    this.createNewSchedule();
    this.render();
  };

  private rightMouseupEvent = (e: MouseEvent) => {
    if (e.button !== 0) {
      return;
    }
    const { target } = e;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const scheduleItemEl = target.closest(".schedule-item");
    if (!(scheduleItemEl instanceof HTMLElement) || scheduleItemEl.dataset.key === undefined) {
      return;
    }

    e.stopPropagation();

    if (target.classList.contains("schedule-status")) {
      this.changeScheduleStatus(scheduleItemEl.dataset.key);
      if (scheduleItemEl.dataset.key !== this.editableItemKey) {
        this.resetEditableItemKey();
      }
    } else if (target.classList.contains("schedule-title")) {
      this.setEditableItemByKey(scheduleItemEl.dataset.key);
      this.focusTarget = "input";
      e.stopPropagation();
    } else if (target.classList.contains("schedule-notes")) {
      this.setEditableItemByKey(scheduleItemEl.dataset.key);
      this.focusTarget = "textarea";
      e.stopPropagation();
    } else if (this.eventTargetScheduleKey !== null && this.rightMouseButton.isDragged) {
      const position = scheduleItemEl.classList.contains("dragenter-border-back") ? "back" : "front";
      this.insertItem(this.eventTargetScheduleKey, scheduleItemEl.dataset.key, position);
    } else {
      this.keydownEventHandler.setEvent(this.extendSelectedSchedules);
      this.selectItem(e, scheduleItemEl.dataset.key);
      this.resetEditableItemKey();
      e.stopPropagation();
    }
    this.eventTargetScheduleKey = null;
    this.rightMouseButton.release();
    this.removeDragBorderClass(scheduleItemEl);
    this.render();
  };

  private rightMousemoveEvent() {
    return (e: MouseEvent) => {
      if (e.button !== 0) {
        return;
      }
      if (this.eventTargetScheduleKey === null) {
        return;
      }
      const { target } = e;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const scheduleItemEl = target.closest(".schedule-item");
      if (!(scheduleItemEl instanceof HTMLElement)) {
        return;
      }
      if (this.rightMouseButton.isDragged) {
        scheduleItemEl.addEventListener("mousemove", this.eventScheduleItemMouseMove);
        scheduleItemEl.addEventListener("mouseleave", this.eventScheduleItemMouseLeave);
        return;
      }
      this.rightMouseButton.move(new Position(e.clientX, e.clientY));
    };
  }

  private rightMousedownEvent() {
    return (e: MouseEvent) => {
      if (e.button !== 0) {
        return;
      }
      const { target } = e;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const scheduleItemEl = target.closest(".schedule-item");
      if (!(scheduleItemEl instanceof HTMLElement)) {
        return;
      }
      this.eventTargetScheduleKey = scheduleItemEl.dataset.key ?? null;
      this.rightMouseButton.click(new Position(e.clientX, e.clientY));
    };
  }

  private removeDragBorderClass(target: HTMLElement) {
    target.classList.remove("dragenter-border-front");
    target.classList.remove("dragenter-border-back");
  }

  private eventScheduleItemMouseMove = (e: MouseEvent) => {
    if (e.button !== 0) {
      return;
    }
    const { currentTarget } = e;

    if (!(currentTarget instanceof HTMLElement)) {
      return;
    }
    this.removeDragBorderClass(currentTarget);
    if (currentTarget.offsetHeight / 2 > e.offsetY) {
      currentTarget.classList.add("dragenter-border-front");
    } else {
      currentTarget.classList.add("dragenter-border-back");
    }
  };

  private eventScheduleItemMouseLeave = (e: MouseEvent) => {
    if (e.button !== 0) {
      return;
    }
    const { currentTarget } = e;

    if (!(currentTarget instanceof HTMLElement)) {
      return;
    }
    currentTarget.removeEventListener("mousemove", this.eventScheduleItemMouseMove);
    currentTarget.removeEventListener("mouseleave", this.eventScheduleItemMouseLeave);
    this.removeDragBorderClass(currentTarget);
  };

  private changeScheduleStatus(key: string) {
    this.schedules.find((schedule) => schedule.key === key)?.toggleScheduleCompleted();
  }

  private toggleSelectItem(key: string) {
    const selectedKeyIdx = this.selectedItemKeys.findIndex((item) => item === key);
    if (selectedKeyIdx === -1) {
      this.selectedItemKeys.push(key);
    } else {
      this.selectedItemKeys.splice(selectedKeyIdx, 1);
    }
  }

  getSelectedAdjacentRange(key: string) {
    const currentKeyIdx = this.schedules.findIndex((v) => v.key === key);
    let head = currentKeyIdx, tail = currentKeyIdx;
    while (head > 0) {
      if (!this.selectedItemKeys.includes(this.schedules[head - 1].key)) {
        break;
      }
      head--;
    }
    while (tail < this.schedules.length - 1) {
      if (!this.selectedItemKeys.includes(this.schedules[tail + 1].key)) {
        break;
      }
      tail++;
    }
    return { head, tail };
  }

  private insertItem(sourceKey: string, targetKey: string, position: "front" | "back") {
    const sourceIdx = this.schedules.findIndex((item) => item.key === sourceKey);
    const source = this.schedules[sourceIdx];
    this.schedules.splice(sourceIdx, 1);
    let targetIdx = this.schedules.findIndex((item) => item.key === targetKey);
    if (position === "back") {
      targetIdx++;
    }
    this.schedules.splice(targetIdx, 0, source);
  }

  private selectItem(e: MouseEvent, key: string) {
    if (e.metaKey) {
      this.toggleSelectItem(key);
    } else if (e.shiftKey) {
      const selectedKeyIdx = this.schedules.findIndex((item) => item.key === key);
      const lastSelectedKeyIdx = this.schedules.findIndex((item) => item.key === this.selectedItemKeys[this.selectedItemKeys.length - 1]);
      const s = Math.min(selectedKeyIdx, lastSelectedKeyIdx), e = Math.max(selectedKeyIdx, lastSelectedKeyIdx);
      const newSelectedKey = this.schedules.slice(s, e + 1).map(v => v.key);
      if (s === lastSelectedKeyIdx) {
        newSelectedKey.reverse();
      }
      this.selectedItemKeys.filter(v => !newSelectedKey.includes(v));
      this.selectedItemKeys.push(...newSelectedKey);
    } else {
      this.selectedItemKeys = [key];
    }
  }

  render() {
    if (this.allCompletedEl === null) {
      throw new Error("allCompleted Element is not exist");
    }
    this.schedules = this.schedules.filter(({
      title,
      key
    }) => this.editableItemKey === key || title.trim() !== "");
    this.sort();
    if (this.schedules.length === 0) {
      this.allCompletedEl.classList.remove("d-none");
    } else {
      this.allCompletedEl.classList.add("d-none");
    }
    if (!(this.currentEl instanceof HTMLOListElement)) {
      throw new Error("schedules Element is not exist");
    }
    this.currentEl.innerHTML = "";
    this.schedules
      .forEach((item, idx) => {
        if (!(this.currentEl instanceof HTMLOListElement)) {
          throw new Error("schedules Element is not exist");
        }
        this.currentEl.appendChild(item.render({
          editable: this.editableItemKey === item.key,
          className: [
            "schedule-item",
            this.editableItemKey === item.key ? "editable" : "",
            this.selectedItemKeys.includes(item.key) ? "selected" : "",
            ...this.getContextSelectedBorderClass(item.key, idx)
          ]
        }));
      });
    this.schedules
      .find((v) => v.key === this.editableItemKey)
      ?.focus(this.focusTarget);
  }

  private sort() {
    this.schedules.sort((first: Schedule, second: Schedule) => {
      if (first.title === "") {
        return 1;
      }
      if (second.title === "") {
        return -1;
      }
      if (first.isCompleted === second.isCompleted) {
        return 0;
      } else if (first.isCompleted) {
        return 1;
      } else {
        return -1;
      }
    });
  }

  private getContextSelectedBorderClass = (key: string, idx: number): string[] => {
    const ret: string[] = [];
    if (!this.contextSelectedItemKeys.includes(key)) {
      return ret;
    }
    ret.push("context-selected");
    if (idx === 0 || !this.contextSelectedItemKeys.includes(this.schedules[idx - 1].key)) {
      ret.push("context-selected-border-top");
    }
    if (idx === this.schedules.length - 1 || !this.contextSelectedItemKeys.includes(this.schedules[idx + 1].key)) {
      ret.push("context-selected-border-bottom");
    }
    return ret;
  };

  deleteSelectedSchedule() {
    this.schedules = this.schedules.filter(({ key }) => !this.selectedItemKeys.includes(key));
    this.resetSelectedItemKeys();
    this.render();
  }

  private extendSelectedSchedules = (e: KeyboardEvent) => {
    if (this.selectedItemKeys.length === 0) {
      return;
    }
    const lastSelectedItemKey = this.selectedItemKeys[this.selectedItemKeys.length - 1];
    let currentCursor = this.schedules.findIndex(({ key }) => key === lastSelectedItemKey);
    let nextCursor: number;
    if (e.code === "Backspace") {
      return this.deleteSelectedSchedule();
    }
    const { head, tail } = this.getSelectedAdjacentRange(lastSelectedItemKey);
    if (e.code === "ArrowDown") {
      nextCursor = Math.min(this.schedules.length - 1, tail + 1);
    } else if (e.code === "ArrowUp") {
      nextCursor = Math.max(0, head - 1);
    } else {
      return;
    }
    if (e.shiftKey && currentCursor !== nextCursor) {
      if (this.selectedItemKeys.find((item) => item === this.schedules[nextCursor].key)) {
        return;
      }
      this.selectedItemKeys.push(this.schedules[nextCursor].key);
    }
    if (!e.shiftKey) {
      this.selectedItemKeys = [this.schedules[nextCursor].key];
    }
    this.render();
  };
}
