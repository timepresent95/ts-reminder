import KeydownEventHandler from "../utility/KeydownEventHandler";
import Position from "../utility/Position";

export default class ContextMenu {
  private static instance: ContextMenu;
  private keydownEventHandler: KeydownEventHandler = KeydownEventHandler.getInstance();
  private currentEl = document.createElement("ul");
  private menuEls: HTMLLIElement[] = [];
  private parentEl: HTMLElement = document.body;
  private list: Menu[] = [];
  private menuKeys: { [index: string]: Menu } = {};
  private hoverItemEl: HTMLLIElement | null = null;
  private mutationObserver: MutationObserver | null = null;
  private keydownCustom: KeydownCustom = {};

  private constructor() {
    this.currentEl.classList.add("context-menu", "text-body1");
  }

  static getInstance() {
    if (!ContextMenu.instance) {
      ContextMenu.instance = new ContextMenu();
    }
    return ContextMenu.instance;
  }

  show = (position: Position, list: Menu[], keydownCustom: KeydownCustom, parentEl?: HTMLElement) => {
    this.keydownCustom = keydownCustom;
    this.mutationObserver?.disconnect();
    this.mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.target === this.currentEl) {
          const normalizedPosition = this.normalizePosition(position);
          this.currentEl.style.left = normalizedPosition.x + "px";
          this.currentEl.style.top = normalizedPosition.y + "px";
        }
      }
    });
    this.mutationObserver.observe(this.currentEl, { childList: true });
    this.parentEl = parentEl ?? document.body;
    this.parentEl.appendChild(this.currentEl);
    this.list = list;
    this.menuEls = this.list.map(({ title, key, func, disable }, idx) => {
      const ret = document.createElement("li");
      ret.classList.add("context-menu-item", "p-4", "m-4");
      ret.textContent = title;
      ret.dataset.key = key;
      this.menuKeys[key] = this.list[idx];
      if (disable) {
        ret.classList.add("context-menu-item-disable");
      }
      return ret;
    });
    this.currentEl.innerHTML = "";
    this.currentEl.append(...this.menuEls);
    this.keydownEventHandler.setEvent(this.keydown);
    this.currentEl.addEventListener("click", this.click);
    this.currentEl.addEventListener("mousemove", this.mousemove);
    this.currentEl.addEventListener("mouseleave", this.mouseleave);
  };

  hide = () => {
    this.keydownCustom = {};
    this.mutationObserver?.disconnect();
    this.mutationObserver = null;
    this.parentEl.removeChild(this.currentEl);
    this.list = [];
    this.menuEls = [];
    this.currentEl.innerHTML = "";
    this.keydownEventHandler.removeEvent();
    this.currentEl.removeEventListener("click", this.click);
    this.currentEl.removeEventListener("mousemove", this.mousemove);
    this.currentEl.removeEventListener("mouseleave", this.mouseleave);
  };

  private normalizePosition(position: Position) {
    const width = this.currentEl.offsetWidth;
    const height = this.currentEl.offsetHeight;
    const outOfBoundsOnX = position.x + width > this.parentEl.offsetWidth;
    const outOfBoundsOnY = position.y + height > this.parentEl.offsetHeight;
    let normalizedX = position.x;
    let normalizedY = position.y;

    if (outOfBoundsOnX && outOfBoundsOnY) {
      normalizedX = position.x - width;
      normalizedY = position.y - height;
    } else if (outOfBoundsOnX) {
      normalizedX = position.x - width;
    } else if (outOfBoundsOnY) {
      normalizedY = position.y - height;
    }

    return new Position(normalizedX, normalizedY);
  }

  private keydown = (e: KeyboardEvent) => {
    if (this.keydownCustom[e.code]) {
      this.keydownCustom[e.code]();
      return;
    }
  };

  private click = (e: MouseEvent) => {
    const { target } = e;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const key = target.dataset.key;
    if (key === undefined || this.menuKeys[key].disable) {
      return;
    }

    this.menuKeys[key].func();
    this.hide();
  };

  private mousemove = (e: MouseEvent) => {
    const { target } = e;
    if (!(target instanceof HTMLLIElement)) {
      this.hoverItemEl?.classList.remove("context-menu-item-hover");
      this.hoverItemEl = null;
      return;
    }

    if (this.hoverItemEl !== target) {
      this.hoverItemEl?.classList.remove("context-menu-item-hover");
      this.hoverItemEl = target;
      target.classList.add("context-menu-item-hover");
    }
  };

  private mouseleave = () => {
    this.hoverItemEl?.classList.remove("context-menu-item-hover");
    this.hoverItemEl = null;
  };
}
