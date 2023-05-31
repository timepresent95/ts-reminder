import './assets/style/style.scss';

import ScheduleType, { ContextSelectedBorder } from './types/Schedule';

import Schedule from './components/Schedule';

let schedules: ScheduleType[] = [];

interface Position {
  x: number,
  y: number
}

const DRAG_SENSITIVITY = 10;

let showCustomContextMenu = false;
let selectedItemKeys: string[] = [];
let contextSelectedItemKeys: string[] = [];
let editableItemKey: string | null = null;
let focusTarget: string | null = null;
let mousedownTargetKey: string | null = null;
let initMousePosition: Position | null = null;
let activeDrag = false;

const today = document.body.querySelector('main');
const allCompletedEl = document.querySelector('.all-completed');
const addButton = document.querySelector('.add-button');
const schedulesEl = document.querySelector('.schedules');
const customContextMenu = document.getElementById('context-menu');

function getDistance(pointA: Position, pointB: Position): number {
  return Math.pow(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2), 0.5);
}

//FIXME: 표시할 수 없는 상태가 되면 상하좌우를 유연하게 변경하도록 해야 함.
function normalizePosition(mouseX: number, mouseY: number) {
  const { left: scopeOffsetX, top: scopeOffsetY } = document.body.getBoundingClientRect();

  const scopeX = mouseX - scopeOffsetX;
  const scopeY = mouseY - scopeOffsetY;

  const outOfBoundsOnX = scopeX + customContextMenu.clientWidth > document.body.clientWidth;
  const outOfBoundsOnY = scopeY + customContextMenu.clientHeight > document.body.clientHeight;

  let normalizedX = mouseX;
  let normalizedY = mouseY;

  if (outOfBoundsOnX) {
    normalizedX = scopeOffsetX + document.body.clientWidth - customContextMenu.clientWidth;
  }

  if (outOfBoundsOnY) {
    normalizedY = scopeOffsetY + document.body.clientHeight - customContextMenu.clientHeight;
  }

  return { normalizedX, normalizedY };
}

function findScheduleByKey(key: string) {
  return schedules.find((schedule) => schedule.key === key) ?? null;
}

function createRandomKey(): string {
  return (Math.random() + 1).toString(36).substring(7);
}

// 완료된 항목이 뒤로 가도록 정렬
function compareByIsCompleted(first: ScheduleType, second: ScheduleType) {
  if (first.title === '') {
    return 1;
  }
  if (second.title === '') {
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

function changeScheduleStatusByKey(key: string) {
  const targetSchedule = findScheduleByKey(key);
  targetSchedule.isCompleted = !targetSchedule.isCompleted;
  return;
}

function toggleSelectItem(key: string) {
  const selectedKeyIdx = selectedItemKeys.findIndex((item) => item === key);
  if (selectedKeyIdx === -1) {
    selectedItemKeys.push(key);
  } else {
    selectedItemKeys.splice(selectedKeyIdx, 1);
  }
}

function selectItem(e: PointerEvent, key: string) {
  if (e.metaKey) {
    toggleSelectItem(key);
  } else if (e.shiftKey) {
    const selectedKeyIdx = schedules.findIndex((item) => item.key === key);
    const lastSelectedKeyIdx = schedules.findIndex((item) => item.key === selectedItemKeys[selectedItemKeys.length - 1]);
    const s = Math.min(selectedKeyIdx, lastSelectedKeyIdx), e = Math.max(selectedKeyIdx, lastSelectedKeyIdx);
    const newSelectedKey = schedules.slice(s, e + 1).map(v => v.key);
    if (s === lastSelectedKeyIdx) {
      newSelectedKey.reverse();
    }
    selectedItemKeys.filter(v => !newSelectedKey.includes(v));
    selectedItemKeys.push(...newSelectedKey);
  } else {
    selectedItemKeys = [key];
  }
}

function getContextSelectedBorder(key: string, idx: number): ContextSelectedBorder | null {
  if (!contextSelectedItemKeys.includes(key)) {
    return null;
  }
  const ret: ContextSelectedBorder = { top: false, bottom: false };
  if (idx === 0 || !contextSelectedItemKeys.includes(schedules[idx - 1].key)) {
    ret.top = true;
  }
  if (idx === schedules.length - 1 || !contextSelectedItemKeys.includes(schedules[idx + 1].key)) {
    ret.bottom = true;
  }
  return ret;
}

function cancelItemSelect() {
  selectedItemKeys = [];
}

function getSelectedAdjacentRangeIdx(key: string): { head: number, tail: number } {
  const currentKeyIdx = schedules.findIndex((v) => v.key === key);
  let head = currentKeyIdx, tail = currentKeyIdx;
  while (head > 0) {
    if (!selectedItemKeys.includes(schedules[head - 1].key)) {
      break;
    }
    head--;
  }
  while (tail < schedules.length - 1) {
    if (!selectedItemKeys.includes(schedules[tail + 1].key)) {
      break;
    }
    tail++;
  }
  return { head, tail };
}

function removeDragBorderClass(target: HTMLElement) {
  target.classList.remove('dragenter-border-front');
  target.classList.remove('dragenter-border-back');
}

function eventScheduleItemMouseMove(e: PointerEvent) {
  const { currentTarget } = e;

  if (!(currentTarget instanceof HTMLElement)) {
    return;
  }
  removeDragBorderClass(currentTarget);
  if(currentTarget.offsetHeight / 2 > e.offsetY) {
    currentTarget.classList.add('dragenter-border-front');
  } else {
    currentTarget.classList.add('dragenter-border-back');
  }
}

function eventScheduleItemMouseLeave(e: PointerEvent) {
  const { currentTarget } = e;

  if (!(currentTarget instanceof HTMLElement)) {
    return;
  }
  currentTarget.removeEventListener('mousemove', eventScheduleItemMouseMove);
  currentTarget.removeEventListener('mouseleave', eventScheduleItemMouseLeave);
  removeDragBorderClass(currentTarget)
}

function insertItem(sourceKey: string, targetKey: string, position: 'front' | 'back') {
  const sourceIdx = schedules.findIndex((item) => item.key === sourceKey);
  const source = schedules[sourceIdx];
  schedules.splice(sourceIdx, 1);
  let targetIdx = schedules.findIndex((item) => item.key === targetKey);
  if (position === 'back') {
    targetIdx++;
  }
  schedules.splice(targetIdx, 0, source);
}

function renderSchedules() {
  schedules = schedules.filter(({
    title,
    key,
  }) => editableItemKey === key || title.trim() !== '').sort(compareByIsCompleted);
  if (schedules.length === 0) {
    allCompletedEl.classList.remove('d-none');
  } else {
    allCompletedEl.classList.add('d-none');
  }
  schedulesEl.innerHTML = schedules
    .map((item, idx) => Schedule(item, selectedItemKeys.includes(item.key), editableItemKey === item.key, getContextSelectedBorder(item.key, idx)))
    .join('');
  if (editableItemKey === null || focusTarget === null) {
    return;
  }

  const editableItemEl = Array
    .from(schedulesEl.children)
    .find(el => {
      if (!(el instanceof HTMLLIElement)) {
        return;
      }
      return el.dataset.key === editableItemKey;
    })
    .querySelector(focusTarget);
  if (editableItemEl instanceof HTMLInputElement || editableItemEl instanceof HTMLTextAreaElement) {
    editableItemEl.focus();
    editableItemEl.selectionStart = editableItemEl.value.length;
  }
}

window.addEventListener('keydown', (e) => {
  if (selectedItemKeys.length === 0) {
    return;
  }
  const lastSelectedItemKey = selectedItemKeys[selectedItemKeys.length - 1];
  let currentCursor = schedules.findIndex(({ key }) => key === lastSelectedItemKey);
  let nextCursor: number;
  if (e.code === 'Backspace') {
    schedules = schedules.filter(({ key }) => !selectedItemKeys.includes(key));
    cancelItemSelect();
    contextSelectedItemKeys = [];
    showCustomContextMenu = false;
    renderSchedules();
    return;
  }
  const { head, tail } = getSelectedAdjacentRangeIdx(lastSelectedItemKey);
  if (!showCustomContextMenu && e.code === 'ArrowDown') {
    nextCursor = Math.min(schedules.length - 1, tail + 1);
  } else if (!showCustomContextMenu && e.code === 'ArrowUp') {
    nextCursor = Math.max(0, head - 1);
  } else {
    return;
  }
  if (e.shiftKey && currentCursor !== nextCursor) {
    if (selectedItemKeys.find((item) => item === schedules[nextCursor].key)) {
      return;
    }
    selectedItemKeys.push(schedules[nextCursor].key);
  }
  if (!e.shiftKey) {
    selectedItemKeys = [schedules[nextCursor].key];
  }
  renderSchedules();
});

schedulesEl.addEventListener('keydown', (e: KeyboardEvent) => {
  const { target } = e;
  if (!(target instanceof HTMLInputElement) || e.code !== 'Enter') {
    return;
  }
  if (editableItemKey === null || findScheduleByKey(editableItemKey).title.trim() === '') {
    focusTarget = null;
    editableItemKey = null;
    renderSchedules();
    return;
  }
  const emptySchedule = new ScheduleType('', '', createRandomKey());
  schedules.push(emptySchedule);
  editableItemKey = emptySchedule.key;
  focusTarget = 'input';
  renderSchedules();
});

schedulesEl.addEventListener('input', (e) => {
  const { target } = e;
  if (target instanceof HTMLInputElement) {
    findScheduleByKey(editableItemKey).title = target.value;
  }
  if (target instanceof HTMLTextAreaElement) {
    const rowCount = target.value.split('\n').length;
    target.setAttribute('rows', rowCount.toString());
    findScheduleByKey(editableItemKey).notes = target.value.trim().replace(/\n/gi, '</br>');
  }
});

today.addEventListener('mouseup', (e) => {
  const { target } = e;
  if (!(target instanceof HTMLElement) || showCustomContextMenu) {
    return;
  }
  if (target.closest('.schedule-item')) {
    return;
  }
  if (findScheduleByKey(editableItemKey) !== null) {
    editableItemKey = null;
  } else {
    const emptySchedule = new ScheduleType('', '', createRandomKey());
    schedules.push(emptySchedule);
    editableItemKey = emptySchedule.key;
    focusTarget = 'input';
  }
  renderSchedules();
});

addButton.addEventListener('mouseup', () => {
  if (showCustomContextMenu) {
    return;
  }
  const emptySchedule = new ScheduleType('', '', createRandomKey());
  schedules.push(emptySchedule);
  editableItemKey = emptySchedule.key;
  renderSchedules();
});

schedulesEl.addEventListener('mousedown', (e: PointerEvent) => {
  const { target } = e;

  if (!(target instanceof HTMLElement) || showCustomContextMenu) {
    return;
  }

  const scheduleItemEl = target.closest('.schedule-item');
  if (!(scheduleItemEl instanceof HTMLElement)) {
    return;
  }
  mousedownTargetKey = scheduleItemEl.dataset.key;
  initMousePosition = { x: e.clientX, y: e.clientY };
});

schedulesEl.addEventListener('mousemove', (e: PointerEvent) => {
  if (mousedownTargetKey === null) {
    return;
  }
  const { target } = e;

  if (!(target instanceof HTMLElement)) {
    return;
  }

  const scheduleItemEl = target.closest('.schedule-item');
  if (!(scheduleItemEl instanceof HTMLElement)) {
    return;
  }
  if (activeDrag) {
    scheduleItemEl.addEventListener('mousemove', eventScheduleItemMouseMove);
    scheduleItemEl.addEventListener('mouseleave', eventScheduleItemMouseLeave);
    return;
  }
  const currentMousePosition: Position = { x: e.clientX, y: e.clientY };
  if (getDistance(initMousePosition, currentMousePosition) > DRAG_SENSITIVITY) {
    activeDrag = true;
  }
});

schedulesEl.addEventListener('mouseup', (e: PointerEvent) => {
  const { target } = e;

  if (!(target instanceof HTMLElement) || showCustomContextMenu) {
    return;
  }

  const scheduleItemEl = target.closest('.schedule-item');
  if (!(scheduleItemEl instanceof HTMLElement)) {
    return;
  }

  const { key } = scheduleItemEl.dataset;
  if (target.classList.contains('schedule-status')) {
    changeScheduleStatusByKey(key);
    if (key !== editableItemKey) {
      editableItemKey = null;
    }
  } else if (target.classList.contains('schedule-title')) {
    editableItemKey = key;
    cancelItemSelect();
    contextSelectedItemKeys = [];
    focusTarget = 'input';
    e.stopPropagation();
  } else if (target.classList.contains('schedule-notes')) {
    editableItemKey = key;
    cancelItemSelect();
    contextSelectedItemKeys = [];
    focusTarget = 'textarea';
    e.stopPropagation();
  } else if (activeDrag) {
    const position = scheduleItemEl.classList.contains('dragenter-border-back') ? 'back' : 'front';
    insertItem(mousedownTargetKey, key, position);
  } else {
    selectItem(e, key);
    editableItemKey = null;
    e.stopPropagation();
  }
  mousedownTargetKey = null;
  activeDrag = false;
  removeDragBorderClass(scheduleItemEl);
  renderSchedules();
});

document.body.addEventListener('mouseup', (e: MouseEvent) => {
  mousedownTargetKey = null;
  const { target } = e;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  cancelItemSelect();
  contextSelectedItemKeys = [];
  renderSchedules();
  if (target.offsetParent !== customContextMenu) {
    customContextMenu.classList.remove('context-menu-visible');
    setTimeout(() => {
      showCustomContextMenu = false;
    });
  }
});

customContextMenu.addEventListener('mousedown', (e) => {
  const { target } = e;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  if (target.dataset.function === 'delete') {
    schedules = schedules.filter(({ key }) => !selectedItemKeys.includes(key));
    renderSchedules();
  }
  customContextMenu.classList.remove('context-menu-visible');
  setTimeout(() => {
    showCustomContextMenu = false;
  });
});

document.body.addEventListener('contextmenu', (e: MouseEvent) => {
  e.preventDefault();
  const { target } = e;

  if (!(target instanceof HTMLElement)) {
    renderSchedules();
    return;
  }

  const scheduleItemEl = target.closest('.schedule-item');

  if (!(scheduleItemEl instanceof HTMLElement)) {
    customContextMenu.classList.remove('context-menu-visible');
    showCustomContextMenu = false;
    cancelItemSelect();
    contextSelectedItemKeys = [];
    renderSchedules();
    return;
  }
  const currentKey = scheduleItemEl.dataset.key;
  if (currentKey !== editableItemKey) {
    editableItemKey = null;
  }

  if (selectedItemKeys.includes(currentKey)) {
    contextSelectedItemKeys = selectedItemKeys;
  } else {
    cancelItemSelect();
    contextSelectedItemKeys = [scheduleItemEl.dataset.key];
  }
  renderSchedules();

  const { clientX, clientY } = e;
  const { normalizedX, normalizedY } = normalizePosition(clientX, clientY);
  customContextMenu.style.left = normalizedX + 'px';
  customContextMenu.style.top = normalizedY + 'px';
  customContextMenu.classList.add('context-menu-visible');
  showCustomContextMenu = true;
});

function init() {
  renderSchedules();
}

init();
