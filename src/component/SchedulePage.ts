import ScheduleList from "./ScheduleList";
import { normalizePosition } from "../utility/normalizePosition";
import Position from "../utility/Position";

export default class SchedulePage {
  private readonly headerTitle = document.querySelector("header").querySelector("h1");
  private readonly currentElement = document.querySelector("main");
  private readonly addButton = document.querySelector(".add-button");
  private readonly customContextMenu = document.getElementById("context-menu");
  private scheduleList = new ScheduleList();

  constructor(title: string) {
    this.headerTitle.innerText = title;
    this.currentElement.addEventListener("mouseup", (e: MouseEvent) => {
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

    this.addButton.addEventListener("mouseup", (e: MouseEvent) => {
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
      this.scheduleList.renderSchedules();
      if (target.offsetParent !== this.customContextMenu) {
        this.customContextMenu.classList.remove("context-menu-visible");
        setTimeout(() => {
          this.scheduleList.showCustomContextMenu = false;
        });
      }
    });

    document.body.addEventListener("contextmenu", this.scheduleList.contextMenuEvent);

    this.scheduleList.renderSchedules();
  }
}
