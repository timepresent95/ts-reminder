import ScheduleType, {ContextSelectedBorder} from '../types/Schedule';

function getContextSelectedBorderClass(contextSelectedBorder: ContextSelectedBorder | null) {
  let ret = 'context-selected';
  if (contextSelectedBorder === null) {
    return '';
  }
  if (contextSelectedBorder.top) {
    ret = ret.concat(' ', 'context-selected-border-top');
  }
  if (contextSelectedBorder.bottom) {
    ret = ret.concat(' ', 'context-selected-border-bottom');
  }
  return ret;
}

export default function Schedule(props: ScheduleType, selected: boolean, editable: boolean, contextSelectedBorder: ContextSelectedBorder | null) {
  const { title, notes, isCompleted, key } = props;
  const notesValue = notes.trim().replace(/<\/br>/gi, '\n');
  if (editable) {
    return `<li data-key='${key}' class='schedule-item editable ${selected ? 'selected' : ''} ${getContextSelectedBorderClass(contextSelectedBorder)}'>
      <button class='schedule-status ${isCompleted ? 'schedule-status-complete' : ''}'></button>
      <div class='schedule-content'>
        <input class='schedule-title text-body1' value='${title}'/>
        <textarea class='schedule-notes text-body1 text-g1' placeholder='Notes' rows='${notes.split('</br>').length}'>${notesValue}</textarea>
      </div>
    </li>`;
  }
  return `
        <li data-key='${key}' class='schedule-item ${selected ? 'selected' : ''} ${getContextSelectedBorderClass(contextSelectedBorder)}'>
          <button class='schedule-status ${isCompleted ? 'schedule-status-complete' : ''}'></button>
          <div class='schedule-content'>
            <p class='schedule-title text-body1'>${title}</p>
            ${notes === '' ? '' : '<p class="schedule-notes text-body1 text-g1">' + notes + '</p>'}
          </div>
        </li>`;
}
