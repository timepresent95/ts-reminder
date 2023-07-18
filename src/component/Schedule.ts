import DraggableComponent from "./DraggableComponent";
import { appendScheduleList } from "../utility/firestoreManager";
import { createRandomKey } from "../utility/Random";

export default class Schedule extends DraggableComponent {
  get selected(): boolean {
    return this._selected;
  }

  set selected(value: boolean) {
    if (value) {
      this.currentEl.classList.add("selected");
    } else {
      this.currentEl.classList.remove("selected");
    }
    this._selected = value;
  }

  private focusEl: "input" | "textarea" | null = null;
  private editMode = false;
  private _selected = false;
  title: string;
  notes: string;
  isCompleted: boolean;

  constructor();
  constructor(title: string, notes: string);
  constructor(title: string, notes: string, isCompleted: boolean);
  constructor(title: string, notes: string, isCompleted: boolean, key: string);
  constructor(title?: string, notes?: string, isCompleted?: boolean, key?: string) {
    super(document.createElement("li"), key ?? createRandomKey());
    this.title = title ?? "";
    this.notes = notes ?? "";
    this.isCompleted = isCompleted ?? false;
    this.draggableQuery = [".schedule-content"];
    this.currentEl.addEventListener("click", this.click);
    this.currentEl.addEventListener("contextmenu", this.contextmenu);
    this.currentEl.classList.add("schedule-item");
  }

  private contextmenu = () => {
    if (this.emit === null) {
      throw new Error("Component is not linked");
    }

    this.emit("CONTEXT_MENU", this);
  };

  private click = (e: MouseEvent) => {
    if (e.button !== 0) {
      return;
    }
    const { target } = e;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (this.emit === null) {
      throw new Error("Component is not linked");
    }
    if (target.classList.contains("schedule-status")) {
      this.toggleIsCompleted();
    } else if (e.metaKey) {
      this.emit("MULTI_SELECT", this);
    } else if (e.shiftKey) {
      this.emit("RANGE_SELECT", this);
    } else if (target.classList.contains("schedule-title")) {
      this.startEditMode("input");
    } else if (target.classList.contains("schedule-notes")) {
      this.startEditMode("textarea");
    } else if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
      this.endEditMode();
      this.emit("SELECT", this);
    }
  };

  private keydownEvent = (e: KeyboardEvent) => {
    if (!this.editMode) {
      throw new Error("editable item is not exist");
    }

    const { target } = e;
    if (!(target instanceof HTMLInputElement) || e.code !== "Enter") {
      return;
    }

    if (this.emit === null) {
      throw new Error("Component is not linked");
    }

    this.endEditMode();
    if (this.title !== "") {
      this.emit("CREATE_NEW_SCHEDULE", this);
    }
  };

  private inputEvent = (e: Event) => {
    const { target } = e;
    if (target instanceof HTMLInputElement) {
      this.title = target.value;
    }
    if (target instanceof HTMLTextAreaElement) {
      const rowCount = target.value.split("\n").length;
      target.setAttribute("rows", rowCount.toString());
      this.notes = target.value.trim().replace(/\n/gi, "</br>");
    }
  };

  startEditMode(focusEl: "input" | "textarea") {
    if (this.emit === null) {
      throw new Error("Component is not linked");
    }
    this.focusEl = focusEl;
    this.editMode = true;
    this.emit("EDIT", this);
    this.currentEl.addEventListener("keydown", this.keydownEvent);
    this.currentEl.addEventListener("input", this.inputEvent);
    this.render();
  }

  endEditMode = () => {
    this.focusEl = null;
    this.editMode = false;
    this.currentEl.removeEventListener("keydown", this.keydownEvent);
    this.currentEl.removeEventListener("input", this.inputEvent);

    if (this.emit === null) {
      throw new Error("Component is not linked");
    }

    if (this.title === "") {
      this.emit("REMOVE", this);
      return;
    }
    appendScheduleList("today", this).then(() => {
      this.render();
    }).catch((e) => {
      console.error(e);
    });
  };

  private toggleIsCompleted() {
    this.isCompleted = !this.isCompleted;
    appendScheduleList("today", this).then(() => {
      this.render();
    }).catch((e) => {
      console.error(e);
    });
    this.render();
  }

  focus() {
    if (this.focusEl === null) {
      return;
    }

    const target = this.currentEl.querySelector(this.focusEl);
    if (target === null) {
      return;
    }
    target.focus();
    target.selectionStart = target.value.length;
  }

  render(): void {
    const { title, notes, isCompleted, editMode } = this;
    const notesValue = notes.trim().replace(/<\/br>/gi, "\n");
    if (isCompleted) {
      this.currentEl.classList.add("schedule-item-complete");
    } else {
      this.currentEl.classList.remove("schedule-item-complete");
    }
    if (editMode) {
      this.currentEl.innerHTML = `
        <button class="schedule-status editable"></button>
        <div class="schedule-content">
          <input class="text-body1" value="${title}"/>
          <textarea class="text-body1 text-g1" placeholder="Notes" rows="${notes.split("</br>").length}">${notesValue}</textarea>
        </div>`.trim();
    } else {
      this.currentEl.innerHTML = `
      <button class="schedule-status"></button>
      <div class="schedule-content">
        <p class="schedule-title text-body1">${title}</p>
        ${notes === "" ? "" : "<p class=\"schedule-notes text-body1 text-g1\">" + notes + "</p>"}
      </div>`.trim();
    }
    this.focus();
    this.focusEl = null;
  }

  create() {
    return this.currentEl;
  }
}
