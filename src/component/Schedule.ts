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
    this.currentEl.addEventListener("mouseup", this.mouseupEvent);
  }

  private createRandomKey(): string {
    return (Math.random() + 1).toString(36).substring(7) + Date.now();
  }

  toggleScheduleCompleted() {
    this.isCompleted = !this.isCompleted;
  }

  // TODO: ScheduleList 내 마우스 이벤트 가져오기
  private mouseupEvent(e: MouseEvent) {
    if (e.button !== 0) {
      return;
    }
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

  render(props: { editable: boolean, className: string[] }) {
    const { title, notes, isCompleted, key } = this;
    const notesValue = notes.trim().replace(/<\/br>/gi, "\n");
    this.currentEl.dataset.key = key;
    if (props.editable) {
      this.currentEl.classList.add(...props.className.filter(v => v.trim() !== ""));
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
