import ScheduleList from "./ScheduleList";
import ContextMenu from "./ContextMenu";
import Position from "../utility/Position";

export default class SchedulePage {
  private readonly headerTitleEl = document.getElementById("title");
  private readonly currentEl = document.querySelector("main");
  private readonly addButtonEl =document.getElementById("add-button");
  private readonly contextMenu: ContextMenu;
  private scheduleList = new ScheduleList();

  constructor(title?: string) {
    if (this.headerTitleEl === null) {
      throw new Error("headerTitle Element is not exist");
    }
    if (this.currentEl === null) {
      throw new Error("current Element is not exist");
    }
    if (this.addButtonEl === null) {
      throw new Error("addButton Element is not exist");
    }
    this.contextMenu = new ContextMenu(this.eventBus);
    this.headerTitleEl.innerText = title ?? "";
    this.currentEl.addEventListener("mouseup", (e: MouseEvent) => {
      if (e.button !== 0) {
        return;
      }
      e.stopPropagation();
      this.scheduleList.createNewSchedule(true);
    });
    this.addButtonEl.addEventListener("mouseup", (e: MouseEvent) => {
        if (e.button !== 0) {
          return;
        }
        e.stopPropagation();
        this.scheduleList.createNewSchedule();
    });

    this.currentEl.addEventListener("contextmenu", this.contextMenuEvent);
    this.scheduleList.render();
  }

  private eventBus = (action: string) => {
    switch (action) {
    case "DELETE_CONTEXT_MENU":
      this.scheduleList.deleteSelectedSchedule();
      break;
    default:
      throw new Error("The action is not enrolled");
    }
  }

  private contextMenuEvent = (e: MouseEvent) => {
    e.preventDefault();
    const { target } = e;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const scheduleItemEl = target.closest(".schedule-item");

    if (!(scheduleItemEl instanceof HTMLElement)) {
      this.scheduleList.reset();
      return;
    }
    const currentKey = scheduleItemEl.dataset.key;
    if (currentKey === undefined) {
      return;
    }

    if (this.scheduleList.selectedItemKeys.includes(currentKey)) {
      this.scheduleList.contextSelectedItemKeys = this.scheduleList.selectedItemKeys;
    } else {
      this.scheduleList.contextSelectedItemKeys = [currentKey];
    }
    this.scheduleList.render();
    this.contextMenu.show(new Position(e.clientX, e.clientY));
  };
}
