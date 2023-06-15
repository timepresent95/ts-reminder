import Schedule, { ContextSelectedBorder } from "./Schedule";
import MouseButton from "../utility/MouseButton";
import Position from "../utility/Position";

export default class ScheduleList {
  selectedItemKeys: string[] = [];
  schedules: Schedule[];
  contextSelectedItemKeys: string[] = [];
  showCustomContextMenu = false; // FIXME: 별도로 ContextMenu 관리해야 함
  editableItemKey: string | null = null;
  eventTargetScheduleKey: string | null = null;
  private focusTarget: string | null = null;
  private currentElement = document.querySelector(".schedules");
  private allCompletedEl = document.querySelector(".all-completed");
  private rightMouseButton: MouseButton = new MouseButton();

  constructor();
  constructor(schedules: Schedule[]);
  constructor(schedules?: Schedule[]) {
    this.schedules = schedules ?? [];
    this.currentElement.classList.add("schedules");
    this.currentElement.addEventListener("mousedown", this.rightMousedownEvent());
    this.currentElement.addEventListener("mousemove", this.rightMousemoveEvent());
    this.currentElement.addEventListener("mouseup", this.rightMouseupEvent());
    this.currentElement.addEventListener("keydown", this.keydownEvent());
    this.currentElement.addEventListener("input", this.inputEvent());
  }

  createNewSchedule() {
    const newSchedule = new Schedule();
    this.schedules.push(newSchedule);
    this.editableItemKey = newSchedule.key;
    this.focusTarget = "input";
  }

  private inputEvent() {
    return (e: InputEvent) => {
      const { target } = e;
      if (target instanceof HTMLInputElement) {
        this.schedules.find(({ key }) => key === this.editableItemKey).title = target.value;
      }
      if (target instanceof HTMLTextAreaElement) {
        const rowCount = target.value.split("\n").length;
        target.setAttribute("rows", rowCount.toString());
        this.schedules.find(({ key }) => key === this.editableItemKey).notes = target.value.trim().replace(/\n/gi, "</br>");
      }
    };
  }

  private keydownEvent() {
    return (e: KeyboardEvent) => {
      const { target } = e;
      if (!(target instanceof HTMLInputElement) || e.code !== "Enter") {
        return;
      }
      if (this.editableItemKey === null || this.schedules.find(({ key }) => key === this.editableItemKey).title.trim() === "") {
        this.focusTarget = null;
        this.editableItemKey = null;
        this.renderSchedules();
        return;
      }
      this.createNewSchedule();
      this.renderSchedules();
    };
  }

  private rightMouseupEvent() {
    return (e: PointerEvent) => {
      if (e.button !== 0) {
        return;
      }
      const { target } = e;

      if (!(target instanceof HTMLElement) || this.showCustomContextMenu) {
        return;
      }

      const scheduleItemEl = target.closest(".schedule-item");
      if (!(scheduleItemEl instanceof HTMLElement)) {
        return;
      }

      const { key } = scheduleItemEl.dataset;
      if (target.classList.contains("schedule-status")) {
        this.changeScheduleStatus(key);
        if (key !== this.editableItemKey) {
          this.editableItemKey = null;
        }
      } else if (target.classList.contains("schedule-title")) {
        this.editableItemKey = key;
        this.selectedItemKeys = [];
        this.contextSelectedItemKeys = [];
        this.focusTarget = "input";
        e.stopPropagation();
      } else if (target.classList.contains("schedule-notes")) {
        this.editableItemKey = key;
        this.selectedItemKeys = [];
        this.contextSelectedItemKeys = [];
        this.focusTarget = "textarea";
        e.stopPropagation();
      } else if (this.rightMouseButton.isDragged) {
        const position = scheduleItemEl.classList.contains("dragenter-border-back") ? "back" : "front";
        this.insertItem(this.eventTargetScheduleKey, key, position);
      } else {
        this.selectItem(e, key);
        this.editableItemKey = null;
        e.stopPropagation();
      }
      this.eventTargetScheduleKey = null;
      this.rightMouseButton.release();
      this.removeDragBorderClass(scheduleItemEl);
      this.renderSchedules();
    };
  }

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
        scheduleItemEl.addEventListener("mousemove", this.eventScheduleItemMouseMove.bind(this));
        scheduleItemEl.addEventListener("mouseleave", this.eventScheduleItemMouseLeave.bind(this));
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

      if (!(target instanceof HTMLElement) || this.showCustomContextMenu) {
        return;
      }

      const scheduleItemEl = target.closest(".schedule-item");
      if (!(scheduleItemEl instanceof HTMLElement)) {
        return;
      }
      this.eventTargetScheduleKey = scheduleItemEl.dataset.key;
      this.rightMouseButton.click(new Position(e.clientX, e.clientY));
    };
  }

  private removeDragBorderClass(target: HTMLElement) {
    target.classList.remove("dragenter-border-front");
    target.classList.remove("dragenter-border-back");
  }

  private eventScheduleItemMouseMove(e: PointerEvent) {
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
  }

  private eventScheduleItemMouseLeave(e: PointerEvent) {
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
  }

  private changeScheduleStatus(key: string) {
    this.schedules.find((schedule) => schedule.key === key).toggleScheduleCompleted();
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

  private selectItem(e: PointerEvent, key: string) {
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

  renderSchedules() {
    this.schedules = this.schedules.filter(({
      title,
      key
    }) => this.editableItemKey === key || title.trim() !== "").sort(this.compareByIsCompleted);
    if (this.schedules.length === 0) {
      this.allCompletedEl.classList.remove("d-none");
    } else {
      this.allCompletedEl.classList.add("d-none");
    }
    this.currentElement.innerHTML = this.schedules
      .map((item, idx) => item.render(this.selectedItemKeys.includes(item.key), this.editableItemKey === item.key, this.getContextSelectedBorder(item.key, idx)))
      .join("");
    if (this.editableItemKey === null || this.focusTarget === null) {
      return;
    }

    const editableItemEl = Array
      .from(this.currentElement.children)
      .find(el => {
        if (!(el instanceof HTMLLIElement)) {
          return;
        }
        return el.dataset.key === this.editableItemKey;
      })
      .querySelector(this.focusTarget);
    if (editableItemEl instanceof HTMLInputElement || editableItemEl instanceof HTMLTextAreaElement) {
      editableItemEl.focus();
      editableItemEl.selectionStart = editableItemEl.value.length;
    }
  }

  private compareByIsCompleted(first: Schedule, second: Schedule) {
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
  }

  private getContextSelectedBorder(key: string, idx: number): ContextSelectedBorder | null {
    if (!this.contextSelectedItemKeys.includes(key)) {
      return null;
    }
    const ret: ContextSelectedBorder = { top: false, bottom: false };
    if (idx === 0 || !this.contextSelectedItemKeys.includes(this.schedules[idx - 1].key)) {
      ret.top = true;
    }
    if (idx === this.schedules.length - 1 || !this.contextSelectedItemKeys.includes(this.schedules[idx + 1].key)) {
      ret.bottom = true;
    }
    return ret;
  }

  filterSelectedSchedules() {
    return this.schedules.filter(({ key }) => !this.selectedItemKeys.includes(key));
  }
}
