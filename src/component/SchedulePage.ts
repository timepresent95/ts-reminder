import ScheduleList from "./ScheduleList";
import { getScheduleList } from "../utility/firestoreManager";

export default class SchedulePage {
  private readonly headerEl = document.createElement("header");
  private readonly addButtonEl = document.createElement("button");
  private readonly titleEl = document.createElement("h1");
  private readonly currentEl = document.createElement("section");
  private scheduleList: ScheduleList;
  private enrolledEvent: EnrolledEvent = {};

  constructor(title: string);
  constructor(title: string, scheduleList: SimplifySchedule[]);
  constructor(title: string, scheduleList?: SimplifySchedule[]) {
    this.scheduleList = new ScheduleList(this.absorb, scheduleList?.sort((a) => a.isCompleted ? 1 : -1) ?? []);
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
    this.enrolledEvent["REFRESH_DATA"] = this.REFRESH_DATA;
  }

  private REFRESH_DATA = () => {
    getScheduleList("today").then(scheduleList => {
      this.scheduleList = new ScheduleList(this.absorb, scheduleList?.sort((a) => a.isCompleted ? 1 : -1) ?? []);
      this.create();
      this.render();
    });
  };

  render() {
    this.scheduleList.render();
  }

  create() {
    this.currentEl.innerHTML = '';
    this.currentEl.appendChild(this.headerEl);
    this.currentEl.appendChild(this.scheduleList.create());
    return this.currentEl;
  }

  private absorb: EventPipe = (action: string) => {
    if (this.enrolledEvent[action] === undefined) {
      throw new Error("This is an unregistered action");
    }
    this.enrolledEvent[action]();
  };
}
