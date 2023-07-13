import ScheduleList from "./ScheduleList";

export default class SchedulePage {
  private readonly headerEl = document.createElement("header");
  private readonly addButtonEl = document.createElement("button");
  private readonly titleEl = document.createElement("h1");
  private readonly currentEl = document.createElement("section");
  private readonly scheduleList: ScheduleList;

  constructor(title: string) {
    this.scheduleList = new ScheduleList();
    this.addButtonEl.classList.add("add-button", "ml-auto", "mb-40", "text-g3");
    this.addButtonEl.innerHTML = "&plus;";
    this.titleEl.classList.add(`text-${title}`, "text-h1b");
    this.titleEl.textContent = title.proper() ?? "";
    this.headerEl.classList.add("p-20");
    this.headerEl.appendChild(this.addButtonEl);
    this.headerEl.appendChild(this.titleEl);
    this.currentEl.classList.add("schedule-page");

    this.addButtonEl.addEventListener("click", (e: MouseEvent) => {
      if (e.button !== 0) {
        return;
      }
      this.scheduleList.createNewSchedule();
    });
  }

  render() {
    this.scheduleList.render();
  }

  create() {
    this.currentEl.appendChild(this.headerEl);
    this.currentEl.appendChild(this.scheduleList.create());
    return this.currentEl;
  }
}
