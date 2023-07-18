export default class Modal {
  private readonly currentEl = document.createElement("section");
  private static instance: Modal;
  private parent: HTMLElement | null = null;
  private child: HTMLElement | null = null;

  constructor() {
    this.currentEl.classList.add("modal", "d-none");
  }

  setParent(parent: HTMLElement) {
    if (this.parent) {
      this.parent.removeChild(this.currentEl);
    }
    this.parent = parent;
    this.parent.appendChild(this.currentEl);
  }

  setChild(child: HTMLElement) {
    if (this.child) {
      this.currentEl.removeChild(child);
    }
    this.child = child;
    this.currentEl.appendChild(child);
  }

  show() {
    if (!this.parent || !this.child) {
      throw new Error("modal must have parent element and child element");
    }
    this.currentEl.classList.remove("d-none");
  }

  hide() {
    if (!this.parent || !this.child) {
      throw new Error("modal must have parent element and child element");
    }
    this.currentEl.classList.add("d-none");
  }

  static getInstance() {
    if (!Modal.instance) {
      Modal.instance = new Modal();
    }
    return Modal.instance;
  }
}
