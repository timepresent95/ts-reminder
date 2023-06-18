export default class Schedule {
  private readonly currentEl = document.createElement("li");
  title: string;
  notes: string;
  isCompleted: boolean;
  key: string;

  constructor();
  constructor(title: string, notes: string);
  constructor(title: string, notes: string, isCompleted: boolean);
  constructor(title?: string, notes?: string, isCompleted?: boolean) {
    this.title = title ?? "";
    this.notes = notes ?? "";
    this.key = this.createRandomKey();
    this.isCompleted = isCompleted ?? false;
  }

  private createRandomKey(): string {
    return (Math.random() + 1).toString(36).substring(7) + Date.now();
  }

  toggleScheduleCompleted() {
    this.isCompleted = !this.isCompleted;
  }

  focus(focusTarget: "input" | "textarea" | null) {
    if (focusTarget === null) {
      return;
    }
    const target = this.currentEl.querySelector(focusTarget);
    if(target === null) {
      return;
    }
    target.focus();
    target.selectionStart = target.value.length;
  }

  private setClassName(className: string[]) {
    this.currentEl.classList.add(...className.filter(v => v.trim() !== ""));
    this.currentEl.classList.remove(...Array.from(this.currentEl.classList).filter(v => !className.includes(v)))
  }

  render(props: { editable: boolean, className: string[] }) {
    const { title, notes, isCompleted, key } = this;
    const notesValue = notes.trim().replace(/<\/br>/gi, "\n");
    this.currentEl.dataset.key = key;
    this.setClassName(props.className)
    if (props.editable) {
      this.currentEl.innerHTML = `
        <button class="schedule-status ${isCompleted ? "schedule-status-complete" : ""}"></button>
        <div class="schedule-content">
          <input class="schedule-title text-body1" value="${title}"/>
          <textarea class="schedule-notes text-body1 text-g1" placeholder="Notes" rows="${notes.split("</br>").length}">${notesValue}</textarea>
        </div>`.trim();
    } else {
      this.currentEl.innerHTML = `
      <button class="schedule-status ${isCompleted ? "schedule-status-complete" : ""}"></button>
      <div class="schedule-content">
        <p class="schedule-title text-body1">${title}</p>
        ${notes === "" ? "" : "<p class=\"schedule-notes text-body1 text-g1\">" + notes + "</p>"}
      </div>`.trim();
    }
    return this.currentEl;
  }
}
