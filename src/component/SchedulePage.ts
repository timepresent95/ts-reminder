import ScheduleList from "./ScheduleList";

export default class SchedulePage {
  private readonly headerTitleEl = document.querySelector("header")?.querySelector("h1") ?? null;
  private readonly currentEl = document.querySelector("main");
  private readonly addButtonEl = document.querySelector(".add-button");
  private readonly contextMenuEl = document.getElementById("context-menu");
  private scheduleList = new ScheduleList();

  constructor(title: string) {
    if(this.headerTitleEl === null) {
      throw new Error("headerTitle Element is not exist")
    }
    if(this.currentEl === null) {
      throw new Error("current Element is not exist")
    }
    if(this.addButtonEl === null) {
      throw new Error("addButton Element is not exist")
    }
    if(this.contextMenuEl === null) {
      throw new Error("contextMenu Element is not exist")
    }
    this.headerTitleEl.innerText = title;
    this.currentEl.addEventListener("mouseup", (e: MouseEvent) => {
      if (e.button !== 0) {
        return;
      }
      const { target } = e;
      if (!(target instanceof HTMLElement) || this.scheduleList.showCustomContextMenu) {
        return;
      }
      if (target.closest(".schedule-item")) {
        return;
      }
      this.scheduleList.createNewSchedule(true);
    });

    this.addButtonEl.addEventListener("mouseup", (e: MouseEvent) => {
      if (e.button !== 0) {
        return;
      }
      if (this.scheduleList.showCustomContextMenu) {
        return;
      }
      this.scheduleList.createNewSchedule();
    });

    window.addEventListener("keydown", this.scheduleList.extendSelectedSchedules);

    document.body.addEventListener("mouseup", (e: MouseEvent) => {
      if (e.button !== 0) {
        return;
      }
      this.scheduleList.eventTargetScheduleKey = null;
      const { target } = e;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      this.scheduleList.resetSelectedItemKeys();
      this.scheduleList.render();
      if(this.contextMenuEl === null) {
        throw new Error("contextMenu Element is not exist")
      }
      if (target.offsetParent !== this.contextMenuEl) {
        this.contextMenuEl.classList.remove("context-menu-visible");
        setTimeout(() => {
          this.scheduleList.showCustomContextMenu = false;
        });
      }
    });

    document.body.addEventListener("contextmenu", this.scheduleList.contextMenuEvent);

    this.scheduleList.render();
  }
}
