import './assets/style/style.scss';

import Schedule from './Schedule';

const today = document.body.querySelector('main');
const allCompletedEl = document.querySelector('.all-completed');
const addButton = document.querySelector('.add-button');
const schedulesEl = document.querySelector('.schedules');

let schedules: Schedule[] = [];
let showScheduleTemplate = false;
let showCustomContextMenu = false;
let selectedItemKeys: string[] = [];
let selectedContextItemKeys: string[] = [];
const scheduleTemplateEl = document.createElement('li');
scheduleTemplateEl.classList.add('schedule-template', 'schedule-item');
scheduleTemplateEl.dataset.key = 'template';
scheduleTemplateEl.innerHTML = `
          <button class='schedule-status'>&nbsp;</button>
           <div class='schedule-content'>
               <input class='schedule-title text-body1'/>
               <textarea class='schedule-notes text-body1 text-g1' placeholder='Notes' rows='1'></textarea>
           </div>`;
const scheduleTemplateTitleEl = scheduleTemplateEl.querySelector('.schedule-title') as HTMLInputElement;
const scheduleTemplateNotesEl = scheduleTemplateEl.querySelector('.schedule-notes') as HTMLTextAreaElement;

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

scheduleTemplateTitleEl.addEventListener('keyup', (e) => {
  if (e.code !== 'Enter') {
    return;
  }
  if (scheduleTemplateTitleEl.value.trim() === '') {
    showScheduleTemplate = false;
  }
  renderSchedules();
});

scheduleTemplateNotesEl.addEventListener('input', (e) => {
  if (e.target instanceof HTMLTextAreaElement) {
    const rowCount = e.target.value.split('\n').length;
    e.target.setAttribute('rows', Math.min(5, rowCount).toString());
  }
});

// 완료된 항목이 뒤로 가도록 정렬
function compareByIsCompleted(first: Schedule, second: Schedule) {
  if (first.isCompleted === second.isCompleted) {
    return 0;
  } else if (first.isCompleted) {
    return 1;
  } else {
    return -1;
  }
}

function createRandomKey(): string {
  return (Math.random() + 1).toString(36).substring(7);
}

function renderSchedules() {
  if (scheduleTemplateTitleEl.value.trim() !== '') {
    const schedule = new Schedule(
      scheduleTemplateTitleEl.value,
      scheduleTemplateNotesEl.value.trim().replace(/\n/gi, '</br>'),
      createRandomKey(),
    );
    schedules.push(schedule);
  }
  scheduleTemplateNotesEl.setAttribute('rows', '1');
  scheduleTemplateTitleEl.value = '';
  scheduleTemplateNotesEl.value = '';
  if (schedules.length === 0 && !showScheduleTemplate) {
    allCompletedEl.classList.remove('d-none');
    schedulesEl.innerHTML = '';
    return;
  }
  allCompletedEl.classList.add('d-none');
  schedules = schedules.filter(({ title }) => title.trim() !== '').sort(compareByIsCompleted);
  schedulesEl.innerHTML = schedules.map(({ title, notes, isCompleted, key }) => `
        <li data-key='${key}' class='schedule-item ${selectedItemKeys.includes(key) ? 'selected' : ''}'>
            <button class='schedule-status ${isCompleted ? 'schedule-status-complete' : ''}'></button>
            <div class='schedule-content'>
                <p class='schedule-title text-body1'>${title}</p>
                ${notes === '' ? '' : '<p class="schedule-notes text-body1 text-g1">' + notes + '</p>'}
            </div>
        </li>`).join('');
  schedulesEl.appendChild(scheduleTemplateEl);
  if (showScheduleTemplate) {
    scheduleTemplateEl.classList.add('schedule-template-active');
    scheduleTemplateTitleEl.focus();
  } else {
    scheduleTemplateEl.classList.remove('schedule-template-active');
  }
}


today.addEventListener('click', (e) => {
  const { target } = e;
  if (!(target instanceof HTMLElement) || showCustomContextMenu) {
    return;
  }
  if (target.closest('.schedule-item')) {
    return;
  }
  showScheduleTemplate = !showScheduleTemplate;
  renderSchedules();
});

addButton.addEventListener('click', () => {
  if(showCustomContextMenu) {
    return;
  }
  showScheduleTemplate = true;
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
  if (key === 'template') {
    return;
  } else if (target.classList.contains('schedule-status')) {
    clickScheduleStatus(target, key);
  } else if (target.classList.contains('schedule-title')) {
    makeEditable(target, key, 'title');
  } else if (target.classList.contains('schedule-notes')) {
    makeEditable(target, key, 'notes');
  } else {
    selectItem(e, key);
  }
});

function clickScheduleStatus(target: HTMLElement, key: string) {
  target.classList.toggle('schedule-status-complete');
  const targetSchedule = schedules.find((v) => v.key === key);
  targetSchedule.isCompleted = !targetSchedule.isCompleted;
  return;
}

function makeEditable(targetEl: HTMLElement, key: string, type: 'title' | 'notes') {
  targetEl.setAttribute('contenteditable', 'true');
  targetEl.focus();

  function keyupEventListener(e: KeyboardEvent) {
    if (e.code !== 'Enter') {
      return;
    }
    targetEl.blur();
    targetEl.removeEventListener('keyup', blurEventListener);
  }

  if (type === 'title') {
    targetEl.addEventListener('keyup', keyupEventListener);
  }

  function blurEventListener() {
    targetEl.setAttribute('contenteditable', 'false');
    const targetSchedule = schedules.find((v) => v.key === key);
    targetSchedule[type] = targetEl.innerText.trim().replace(/\n/gi, '</br>');
    renderSchedules();
    targetEl.removeEventListener('blur', blurEventListener);
  }

  targetEl.addEventListener('blur', blurEventListener);
}

function selectItem(e: PointerEvent, key: string) {
  if (e.metaKey) {
    const selectedKeyIdx = selectedItemKeys.findIndex((item) => item === key);
    if (selectedKeyIdx === -1) {
      selectedItemKeys.push(key);
    } else {
      selectedItemKeys.splice(selectedKeyIdx, 1);
    }
  } else if (e.shiftKey) {
  } else {
    selectedItemKeys = [key];
  }
  renderSchedules();
}

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

customContextMenu.addEventListener('click', (e) => {
  const { target } = e;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  if(target.dataset.function === 'delete') {
    schedules = schedules.filter(({key}) => !selectedItemKeys.includes(key));
    renderSchedules();
  }
  customContextMenu.classList.remove('context-menu-visible');
  setTimeout(() => {
    showCustomContextMenu = false;
  });
})

document.body.addEventListener('contextmenu', (e: MouseEvent) => {
  e.preventDefault();
  showScheduleTemplate = false;
  const { target } = e;

  if (!(target instanceof HTMLElement)) {
    renderSchedules();
    return;
  }

  const scheduleItemEl = target.closest('.schedule-item')

  if(!(scheduleItemEl instanceof HTMLElement) || scheduleItemEl.dataset.key === 'template') {
    customContextMenu.classList.remove('context-menu-visible');
    showCustomContextMenu = false;
    renderSchedules();
    return;
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

document.body.addEventListener('click', (e: MouseEvent) => {
  const { target } = e;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  if (target.offsetParent !== customContextMenu) {
    customContextMenu.classList.remove('context-menu-visible');
    setTimeout(() => {
      showCustomContextMenu = false;
    });
  }
});

function init() {
  renderSchedules();
}

init();
