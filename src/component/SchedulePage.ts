import ScheduleList from "./ScheduleList";
import ContextMenu from "./ContextMenu";

export default class SchedulePage {
  private readonly headerEl = document.createElement("header");
  private readonly addButtonEl = document.createElement("button");
  private readonly titleEl = document.createElement("h1");
  // private readonly contextMenu: ContextMenu;
  private readonly scheduleList: ScheduleList;

  constructor(title: string) {
    this.scheduleList = new ScheduleList();
    this.addButtonEl.classList.add("add-button", "ml-auto", "mb-40", "text-g3");
    this.addButtonEl.innerHTML = "&plus;";
    this.titleEl.classList.add(`text-${title}`, "text-h1b");
    this.titleEl.textContent = title.proper() ?? "";
    this.headerEl.classList.add("p-20");

    // this.contextMenu = new ContextMenu(this.eventBus);

    this.addButtonEl.addEventListener("click", (e: MouseEvent) => {
      if (e.button !== 0) {
        return;
      }
      this.scheduleList.createNewSchedule();
    });

    // this.mainEl.addEventListener("contextmenu", this.contextMenuEvent);
  }

  render() {
    this.scheduleList.render();
  }

  create() {
    this.headerEl.appendChild(this.addButtonEl);
    this.headerEl.appendChild(this.titleEl);
    const mainEl = this.scheduleList.create();
    return [this.headerEl, mainEl];
  }

  // private eventBus = (action: string) => {
  //   switch (action) {
  //   case "DELETE_CONTEXT_MENU":
  //     this.scheduleList.deleteSelectedSchedule();
  //     break;
  //   default:
  //     throw new Error("The action is not enrolled");
  //   }
  // };

  // private contextMenuEvent = (e: MouseEvent) => {
  //   e.preventDefault();
  //   const { target } = e;
  //
  //   if (!(target instanceof HTMLElement)) {
  //     return;
  //   }
  //
  //   const scheduleItemEl = target.closest(".schedule-item");
  //
  //   if (!(scheduleItemEl instanceof HTMLElement)) {
  //     this.scheduleList.reset();
  //     return;
  //   }
  //   const currentKey = scheduleItemEl.dataset.key;
  //   if (currentKey === undefined) {
  //     return;
  //   }
  //
  //   if (this.scheduleList.selectedItemKeys.includes(currentKey)) {
  //     this.scheduleList.contextSelectedItemKeys = this.scheduleList.selectedItemKeys;
  //   } else {
  //     this.scheduleList.contextSelectedItemKeys = [currentKey];
  //   }
  //   this.scheduleList.render();
  //   this.contextMenu.show(new Position(e.clientX, e.clientY));
  // };
}
