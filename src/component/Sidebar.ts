import Modal from "../utility/Modal";
import AddList from "./AddList";

export default class Sidebar {
  private currentEl = document.createElement("section");
  private windowControlEl = document.createElement("div");
  private searchBoxEl = document.createElement("input");
  private addListButton = document.createElement("button");
  private myListsEl = document.createElement("div");
  private modal: Modal = Modal.getInstance();
  private readonly addList;

  constructor(categories: ScheduleCategory[]) {
    this.currentEl.classList.add("side-bar");
    this.windowControlEl.classList.add("window-control");
    this.windowControlEl.innerHTML = `
    <button data-icon="&times;" class="close"></button>
    <button data-icon="&minus;" class="minimize"></button>
    <button data-icon="&plus;" class="maximize"></button>
    `;
    this.windowControlEl.addEventListener("click", this.windowControl);

    const labelEl = document.createElement("label");
    labelEl.classList.add("search-label");
    labelEl.appendChild(this.searchBoxEl);
    this.searchBoxEl.classList.add("search");
    this.searchBoxEl.setAttribute("placeholder", "Search");
    labelEl.appendChild(this.searchBoxEl);

    this.myListsEl.classList.add("my-lists");
    this.myListsEl.innerHTML =
      `<p class="text-body3b">My Lists</p>
       <ul class="text-body1b">${categories.map(v =>
        `<li><span class="${v.isEmoji ? "" : "material-icons"}">${v.icon}</span>${v.name}</li>`)}
       </ul>`;

    this.addListButton.classList.add("add-list-button");
    this.addListButton.textContent = "⊕ Add List";
    this.addListButton.addEventListener("click", () => this.modal.show());

    this.addList = new AddList(this.modal.hide);
    this.modal.setChild(this.addList.currentEl);

    this.currentEl.append(this.windowControlEl, labelEl, this.myListsEl, this.addListButton);
  }

  private windowControl = (e: MouseEvent) => {
    const { target } = e;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }
    switch (target.dataset.icon) {
    case "×":
      window.alert("창 닫기 옵션은 개발중입니다.");
      break;
    case "−":
      window.alert("창 최소화 옵션은 개발중입니다.");
      break;
    case "+":
      window.alert("창 최대화 옵션은 개발중입니다.");
      break;
    default:
      return;
    }
  };

  create() {
    return this.currentEl;
  }
}
