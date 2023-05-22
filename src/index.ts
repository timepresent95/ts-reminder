import './assets/style/style.scss';

import Schedule from './Schedule';
import { isListElement } from './elementTypeGuard';

const today = document.body.querySelector('main');
const allCompletedEl = document.querySelector('.all-completed');
const addButton = document.querySelector('.add-button');
const schedulesEl = document.querySelector('.schedules');

const schedules: Schedule[] = [{ title: '1', notes: '1', key: '1', isCompleted: true }];
let showScheduleTemplate = false;
const scheduleTemplateEl = document.createElement('li');
scheduleTemplateEl.classList.add('schedule-template', 'schedule-item');
scheduleTemplateEl.innerHTML = `
          <button class='schedule-status'>&nbsp;</button>
           <div class='schedule-content'>
               <input class='schedule-title text-body1'/>
               <textarea class='schedule-notes text-body1 text-g1' placeholder='Notes' rows='1'></textarea>
           </div>`;
const scheduleTemplateTitleEl = scheduleTemplateEl.querySelector('.schedule-title') as HTMLInputElement;
const scheduleTemplateNotesEl = scheduleTemplateEl.querySelector('.schedule-notes') as HTMLTextAreaElement;

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
    const { value, setAttribute } = e.target;
    const rowCount = value.split('\n').length;
    setAttribute('rows', Math.min(5, rowCount).toString());
  }
});

renderSchedules();

function createSchedule() {
  if (scheduleTemplateTitleEl.value.trim() !== '') {
    const schedule = new Schedule(
      scheduleTemplateTitleEl.value,
      scheduleTemplateNotesEl.value.trim().replace(/\n/gi, '</br>'),
      schedules.length.toString(),
    );
    schedules.push(schedule);
  }
  scheduleTemplateTitleEl.value = '';
  scheduleTemplateNotesEl.value = '';
}

// 완료된 항목이 뒤로
function compareByIsCompleted(first: Schedule, second: Schedule) {
  if (first.isCompleted === second.isCompleted) {
    return 0;
  } else if (first.isCompleted) {
    return 1;
  } else {
    return -1;
  }
}

function renderSchedules() {
  createSchedule();
  if (schedules.length === 0) {
    allCompletedEl.classList.remove('d-none');
    schedulesEl.innerHTML = '';
    return;
  }
  allCompletedEl.classList.add('d-none');
  schedulesEl.innerHTML = schedules.sort(compareByIsCompleted).map(({ title, notes, isCompleted, key }) => `
        <li data-key='${key}' class='schedule-item'>
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
  if (e.target !== today) {
    return;
  }
  showScheduleTemplate = !showScheduleTemplate;
  renderSchedules();
});

addButton.addEventListener('click', () => {
  showScheduleTemplate = true;
  renderSchedules();
});

schedulesEl.addEventListener('click', (e) => {
  const { target } = e;
  if (!(target instanceof Element)) {
    return;
  }

  const scheduleItemEl = target.closest('.schedule-item');
  if (!isListElement(scheduleItemEl)) {
    return;
  }

  const { key } = scheduleItemEl.dataset;

  if (target.classList.contains('schedule-status')) {
    clickScheduleStatus(target, key)
  }
});

function clickScheduleStatus(target: Element, key: string) {
  target.classList.toggle('schedule-status-complete');
  const targetSchedule = schedules.find((v) => v.key === key);
  targetSchedule.isCompleted = !targetSchedule.isCompleted;
  return;
}
