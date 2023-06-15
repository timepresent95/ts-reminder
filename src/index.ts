import "./assets/style/style.scss";
import ScheduleList from "./component/ScheduleList";

const today = document.body.querySelector("main");
const addButton = document.querySelector(".add-button");
const customContextMenu = document.getElementById("context-menu");
const scheduleList = new ScheduleList();

function normalizePosition(mouseX: number, mouseY: number) {
  const outOfBoundsOnX = mouseX + customContextMenu.clientWidth > document.body.clientWidth;
  const outOfBoundsOnY = mouseY + customContextMenu.clientHeight > document.body.clientHeight;

  let normalizedX = mouseX;
  let normalizedY = mouseY;

  if (outOfBoundsOnX && outOfBoundsOnY) {
    normalizedX = mouseX - customContextMenu.clientWidth;
    normalizedY = mouseY - customContextMenu.clientHeight;
  } else if (outOfBoundsOnX) {
    normalizedX = mouseX - customContextMenu.clientWidth;
  } else if (outOfBoundsOnY) {
    normalizedY = mouseY - customContextMenu.clientHeight;
  }

  return { normalizedX, normalizedY };
}

window.addEventListener("keydown", (e) => {
  if (scheduleList.selectedItemKeys.length === 0) {
    return;
  }
  const lastSelectedItemKey = scheduleList.selectedItemKeys[scheduleList.selectedItemKeys.length - 1];
  let currentCursor = scheduleList.schedules.findIndex(({ key }) => key === lastSelectedItemKey);
  let nextCursor: number;
  if (e.code === "Backspace") {
    scheduleList.schedules = scheduleList.filterSelectedSchedules();
    scheduleList.selectedItemKeys = [];
    scheduleList.contextSelectedItemKeys = [];
    scheduleList.showCustomContextMenu = false;
    scheduleList.renderSchedules();
    return;
  }
  const { head, tail } = scheduleList.getSelectedAdjacentRange(lastSelectedItemKey);
  if (!scheduleList.showCustomContextMenu && e.code === "ArrowDown") {
    nextCursor = Math.min(scheduleList.schedules.length - 1, tail + 1);
  } else if (!scheduleList.showCustomContextMenu && e.code === "ArrowUp") {
    nextCursor = Math.max(0, head - 1);
  } else {
    return;
  }
  if (e.shiftKey && currentCursor !== nextCursor) {
    if (scheduleList.selectedItemKeys.find((item) => item === scheduleList.schedules[nextCursor].key)) {
      return;
    }
    scheduleList.selectedItemKeys.push(scheduleList.schedules[nextCursor].key);
  }
  if (!e.shiftKey) {
    scheduleList.selectedItemKeys = [scheduleList.schedules[nextCursor].key];
  }
  scheduleList.renderSchedules();
});

today.addEventListener("mouseup", (e) => {
  if (e.button !== 0) {
    return;
  }
  const { target } = e;
  if (!(target instanceof HTMLElement) || scheduleList.showCustomContextMenu) {
    return;
  }
  if (target.closest(".schedule-item")) {
    return;
  }
  if (scheduleList.schedules.find(({ key }) => key === scheduleList.editableItemKey) !== undefined) {
    scheduleList.editableItemKey = null;
  } else {
    scheduleList.editableItemKey = scheduleList.createNewSchedule();
    scheduleList.focusTarget = "input";
  }

  scheduleList.renderSchedules();
});

addButton.addEventListener("mouseup", (e: MouseEvent) => {
  if (e.button !== 0) {
    return;
  }
  if (scheduleList.showCustomContextMenu) {
    return;
  }
  scheduleList.editableItemKey = scheduleList.createNewSchedule();
  scheduleList.renderSchedules();
});

document.body.addEventListener("mouseup", (e: MouseEvent) => {
  if (e.button !== 0) {
    return;
  }
  scheduleList.eventTargetScheduleKey = null;
  const { target } = e;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  scheduleList.selectedItemKeys = [];
  scheduleList.contextSelectedItemKeys = [];
  scheduleList.renderSchedules();
  if (target.offsetParent !== customContextMenu) {
    customContextMenu.classList.remove("context-menu-visible");
    setTimeout(() => {
      scheduleList.showCustomContextMenu = false;
    });
  }
});

customContextMenu.addEventListener("mouseup", (e) => {
  if (e.button !== 0) {
    return;
  }
  const { target } = e;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  if (target.dataset.function === "delete") {
    scheduleList.schedules = scheduleList.filterSelectedSchedules();
    scheduleList.renderSchedules();
  }
  customContextMenu.classList.remove("context-menu-visible");
  setTimeout(() => {
    scheduleList.showCustomContextMenu = false;
  });
});

document.body.addEventListener("contextmenu", (e: MouseEvent) => {
  e.preventDefault();
  const { target } = e;

  if (!(target instanceof HTMLElement)) {
    scheduleList.renderSchedules();
    return;
  }

  const scheduleItemEl = target.closest(".schedule-item");

  if (!(scheduleItemEl instanceof HTMLElement)) {
    customContextMenu.classList.remove("context-menu-visible");
    scheduleList.showCustomContextMenu = false;
    scheduleList.selectedItemKeys = [];
    scheduleList.contextSelectedItemKeys = [];
    scheduleList.renderSchedules();
    return;
  }
  const currentKey = scheduleItemEl.dataset.key;
  if (currentKey !== scheduleList.editableItemKey) {
    scheduleList.editableItemKey = null;
  }

  if (scheduleList.selectedItemKeys.includes(currentKey)) {
    scheduleList.contextSelectedItemKeys = scheduleList.selectedItemKeys;
  } else {
    scheduleList.selectedItemKeys = [];
    scheduleList.contextSelectedItemKeys = [scheduleItemEl.dataset.key];
  }
  scheduleList.renderSchedules();

  const { clientX, clientY } = e;
  customContextMenu.classList.add("context-menu-visible");
  const { normalizedX, normalizedY } = normalizePosition(clientX, clientY);
  customContextMenu.style.left = normalizedX + "px";
  customContextMenu.style.top = normalizedY + "px";
  scheduleList.showCustomContextMenu = true;
});

function init() {
  scheduleList.renderSchedules();
}

init();
