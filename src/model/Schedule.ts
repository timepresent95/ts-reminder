export interface ContextSelectedBorder {
    top: boolean;
    bottom: boolean;
}

export default class Schedule {
    title: string;
    notes: string;
    isCompleted: boolean;
    key: string;

    constructor(title: string, notes: string);
    constructor(title: string, notes: string, isCompleted: boolean);
    constructor(title: string, notes: string, isCompleted?: boolean) {
        this.title = title;
        this.notes = notes;
        this.key = this.createRandomKey()
        this.isCompleted = isCompleted ?? false;
    }

    private createRandomKey(): string {
        return (Math.random() + 1).toString(36).substring(7) + Date.now();
    }

    private getContextSelectedBorderClass(contextSelectedBorder: ContextSelectedBorder | null) {
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

    render(selected: boolean, editable: boolean, contextSelectedBorder: ContextSelectedBorder | null) {
        const { title, notes, isCompleted, key } = this;
        const notesValue = notes.trim().replace(/<\/br>/gi, '\n');
        if (editable) {
            return `<li data-key='${key}' class='schedule-item editable ${selected ? 'selected' : ''} ${this.getContextSelectedBorderClass(contextSelectedBorder)}'>
      <button class='schedule-status ${isCompleted ? 'schedule-status-complete' : ''}'></button>
      <div class='schedule-content'>
        <input class='schedule-title text-body1' value='${title}'/>
        <textarea class='schedule-notes text-body1 text-g1' placeholder='Notes' rows='${notes.split('</br>').length}'>${notesValue}</textarea>
      </div>
    </li>`;
        }
        return `
        <li data-key='${key}' class='schedule-item ${selected ? 'selected' : ''} ${this.getContextSelectedBorderClass(contextSelectedBorder)}'>
          <button class='schedule-status ${isCompleted ? 'schedule-status-complete' : ''}'></button>
          <div class='schedule-content'>
            <p class='schedule-title text-body1'>${title}</p>
            ${notes === '' ? '' : '<p class="schedule-notes text-body1 text-g1">' + notes + '</p>'}
          </div>
        </li>`;
    }
}
