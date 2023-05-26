import ScheduleType from '../types/Schedule';

export default function Schedule(props: ScheduleType, selected: boolean, editable: boolean) {
  const { title, notes, isCompleted, key } = props;
  const notesValue = notes.trim().replace(/<\/br>/gi, '\n');
  if (editable) {
    return `<li data-key='${key}' class='schedule-item editable ${selected ? 'selected' : ''}'>
      <button class='schedule-status ${isCompleted ? 'schedule-status-complete' : ''}'></button>
      <div class='schedule-content'>
        <input class='schedule-title text-body1' value='${title}'/>
        <textarea class='schedule-notes text-body1 text-g1' placeholder='Notes' rows='${notes.split('</br>').length}'>${notesValue}</textarea>
      </div>
    </li>`;
  }
  return `
        <li data-key='${key}' class='schedule-item ${selected ? 'selected' : ''}'>
          <button class='schedule-status ${isCompleted ? 'schedule-status-complete' : ''}'></button>
          <div class='schedule-content'>
            <p class='schedule-title text-body1'>${title}</p>
            ${notes === '' ? '' : '<p class="schedule-notes text-body1 text-g1">' + notes + '</p>'}
          </div>
        </li>`;
}
