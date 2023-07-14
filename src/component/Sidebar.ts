export default class Sidebar {
  private currentEl = document.createElement("section");
  private windowControlEl = document.createElement("div");
  private searchBoxEl = document.createElement("input");

  constructor() {
    this.currentEl.classList.add("side-bar");
    this.windowControlEl.classList.add("window-control");
    this.windowControlEl.innerHTML = `
    <button data-icon="&times;" class="close"></button>
    <button data-icon="&minus;" class="minimize"></button>
    <button data-icon="&plus;" class="maximize"></button>
    `;
    this.windowControlEl.addEventListener("click", this.windowControl);
    const labelEl = document.createElement("label");
    labelEl.classList.add('search-label')
    labelEl.appendChild(this.searchBoxEl);
    this.searchBoxEl.classList.add("search");
    this.searchBoxEl.setAttribute('placeholder', 'Search')
    labelEl.appendChild(this.searchBoxEl);

    this.currentEl.appendChild(this.windowControlEl);
    this.currentEl.appendChild(labelEl);
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
