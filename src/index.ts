import './assets/style/style.scss';

import ScheduleType from './types/Schedule';

import Schedule from './components/Schedule';

let schedules: ScheduleType[] = [];

let showCustomContextMenu = false;
let selectedItemKeys: string[] = [];
let editableItemKey: string | null = null;
let focusTarget: string | null = null;

const today = document.body.querySelector('main');
const allCompletedEl = document.querySelector('.all-completed');
const addButton = document.querySelector('.add-button');
const schedulesEl = document.querySelector('.schedules');
const customContextMenu = document.getElementById('context-menu');

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
  if(first.title === '') {
    return 1;
  }
  if(second.title === '') {
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
  } else {
    selectedItemKeys = [key];
  }
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
    .map((item) => Schedule(item, selectedItemKeys.includes(item.key), editableItemKey === item.key))
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
    selectedItemKeys = [];
    renderSchedules();
    return;
  } else if (e.code === 'ArrowDown') {
    nextCursor = Math.min(schedules.length - 1, currentCursor + 1);
  } else if (e.code === 'ArrowUp') {
    nextCursor = Math.max(0, currentCursor - 1);
  } else {
    return;
  }
  if (e.shiftKey && currentCursor !== nextCursor) {
    const duplicatedItemIdx = selectedItemKeys.findIndex((item) => item === schedules[nextCursor].key);
    duplicatedItemIdx !== -1 && selectedItemKeys.splice(duplicatedItemIdx, 1);
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

today.addEventListener('click', (e) => {
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

addButton.addEventListener('click', () => {
  if (showCustomContextMenu) {
    return;
  }
  const emptySchedule = new ScheduleType('', '', createRandomKey());
  schedules.push(emptySchedule);
  editableItemKey = emptySchedule.key;
  renderSchedules();
});

schedulesEl.addEventListener('click', (e: PointerEvent) => {
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
    if(key !== editableItemKey) {
      editableItemKey = null;
    }
  } else if (target.classList.contains('schedule-title')) {
    editableItemKey = key;
    selectedItemKeys = [];
    focusTarget = 'input';
    e.stopPropagation();
  } else if (target.classList.contains('schedule-notes')) {
    editableItemKey = key;
    selectedItemKeys = [];
    focusTarget = 'textarea';
    e.stopPropagation();
  } else {
    selectItem(e, key);
    editableItemKey = null;
    e.stopPropagation();
  }
  renderSchedules();
});

document.body.addEventListener('click', (e: MouseEvent) => {
  const { target } = e;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  selectedItemKeys = [];
  renderSchedules();
  if (target.offsetParent !== customContextMenu) {
    customContextMenu.classList.remove('context-menu-visible');
    setTimeout(() => {
      showCustomContextMenu = false;
    });
  }
});

customContextMenu.addEventListener('click', (e) => {
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
    selectedItemKeys = [];
    renderSchedules();
    return;
  }
  if (scheduleItemEl.dataset.key !== editableItemKey) {
    editableItemKey = null;
  }
  selectedItemKeys = [scheduleItemEl.dataset.key];
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
