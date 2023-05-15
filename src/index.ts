import "./assets/style/style.scss";

import {Schedule} from './Schedule'
import {isListElement} from "./elementTypeGuard";

const today = document.body.querySelector('main');
const allCompletedEl = document.querySelector('.all-completed');
const addButton = document.querySelector('.add-button');
const schedulesEl = document.querySelector('.schedules');
const scheduleTemplateEl = today.querySelector('.schedule-template')
const scheduleTemplateTitleEl = scheduleTemplateEl.querySelector('.schedule-title') as HTMLInputElement
const scheduleTemplateNotesEl = scheduleTemplateEl.querySelector('.schedule-notes') as HTMLTextAreaElement

const schedules: Schedule[] = [];
let showScheduleTemplate = false;

render();

scheduleTemplateNotesEl.addEventListener('input', () => {
    const rowCount = scheduleTemplateNotesEl.value.split('\n').length;
    scheduleTemplateNotesEl.setAttribute('rows', Math.min(5, rowCount).toString());
})

function createSchedule() {
    const schedule = new Schedule(scheduleTemplateTitleEl.value,
        scheduleTemplateNotesEl.value.trim().replace(/\n/gi, '</br>'),
        schedules.length.toString()
    );
    scheduleTemplateTitleEl.value = ''
    scheduleTemplateNotesEl.value = ''
    schedules.push(schedule);
    render();
}

function render() {
    if (!showScheduleTemplate && schedules.length === 0) {
        allCompletedEl.classList.remove('d-none');
    } else {
        allCompletedEl.classList.add('d-none');
    }
    schedulesEl.innerHTML = schedules.sort((a, b) => {
        if (a.isCompleted && !b.isCompleted) {
            return 1;
        } else if (!a.isCompleted && b.isCompleted) {
            return -1;
        } else {
            return 0;
        }
    }).map(({title, notes, isCompleted, key}) => `
        <li data-key="${key}" class="schedule-item">
            <button class="schedule-status ${isCompleted ? 'schedule-status-complete' : ''}"></button>
            <div class="schedule-content">
                <p class="text-body1">${title}</p>
                ${notes === '' ? '' : '<p class="text-body1 text-g1">' + notes + '</p>'}
            </div>
        </li>`).join('');
}

today.addEventListener('click', (e) => {
    allCompletedEl.classList.add('d-none');
    if (e.target !== scheduleTemplateNotesEl && scheduleTemplateTitleEl.value !== "") {
        createSchedule();
    }
    if (e.target !== today) {
        return;
    }
    showScheduleTemplate = !showScheduleTemplate;
    if (showScheduleTemplate) {
        scheduleTemplateEl.classList.add('schedule-template-active')
    } else {
        scheduleTemplateEl.classList.remove('schedule-template-active')
    }
    scheduleTemplateTitleEl.value = ''
    scheduleTemplateNotesEl.setAttribute('rows', '1');
    scheduleTemplateNotesEl.value = ''
    scheduleTemplateTitleEl.focus()
    render();
})

addButton.addEventListener('click', () => {
    showScheduleTemplate = true;
    scheduleTemplateEl.classList.add('schedule-template-active')
    scheduleTemplateNotesEl.setAttribute('rows', '1');
    scheduleTemplateTitleEl.focus();
    render();
})

scheduleTemplateTitleEl.addEventListener('keyup', (e) => {
    if (e.code !== 'Enter') {
        return;
    }
    if (scheduleTemplateTitleEl.value !== "") {
        createSchedule()
        scheduleTemplateEl.classList.add('schedule-template-active')
        scheduleTemplateTitleEl.focus()
    } else {
        showScheduleTemplate = false;
        scheduleTemplateEl.classList.remove('schedule-template-active')
    }
})

schedulesEl.addEventListener('click', (e) => {
    if (e.target instanceof Element && e.target.classList.contains('schedule-status')) {
        e.target.classList.toggle('schedule-status-complete')
        const scheduleItemEl = e.target.closest('.schedule-item');
        if (isListElement(scheduleItemEl)) {
            const {key} = scheduleItemEl.dataset;
            const targetSchedule = schedules.find((v) => v.key === key);
            targetSchedule.isCompleted = !targetSchedule.isCompleted;
        }
    }
})
