import data from "@emoji-mart/data";
import { Picker } from "emoji-mart";
import { COLORS, ICONS } from "../constant";
import Position from "../utility/Position";

export default class AddList {
  readonly currentEl = document.createElement("div");
  private readonly titleEl = document.createElement("h4");
  private readonly labelEl = document.createElement("label");
  private readonly inputEl = document.createElement("input");
  private readonly colorPickerEl = document.createElement("div");
  private colorPicked: string = AddList.colors[0];
  private readonly emojiButtonEl = document.createElement("button");
  private readonly emojiPicker = new Picker({
    parent: document.body,
    data,
    categories: ["nature", "foods", "activity", "places", "objects", "symbols", "flags"],
    onEmojiSelect: (emoji: { native: string }) => {
      this.emojiButtonEl.innerHTML = `<span>${emoji.native}</span>`;
      if (!(this.emojiPicker instanceof HTMLElement)) {
        return;
      }
      this.emojiPicker.style.display = "none";
    }
  });
  private readonly iconButtonEl = document.createElement("button");
  private readonly iconPickerEl = document.createElement("ul");
  private readonly okButton = document.createElement("button");
  private readonly cancelButton = document.createElement("button");
  private static readonly icons: string[] = ICONS;
  private static readonly colors: string[] = COLORS;

  constructor(hide: () => void) {
    if (!(this.emojiPicker instanceof HTMLElement)) {
      return;
    }
    this.emojiPicker.style.display = "none";
    this.titleEl.classList.add("text-body1b", "mb-12");
    this.titleEl.textContent = "New List";
    this.labelEl.textContent = "Name:";
    this.labelEl.appendChild(this.inputEl);
    this.colorPickerEl.classList.add("color-picker");
    this.colorPickerEl.innerHTML = `<p>Color:</p>
      <fieldset>
        ${AddList.colors.map((v) =>
      `<input 
            ${v === this.colorPicked ? "checked" : ""} 
            type="radio" 
            name="color" 
            style="background-color: ${v}" 
            value="${v}" 
          />`)
      .join("")}
      </fieldset>`;
    this.colorPickerEl.addEventListener("change", this.pickColor);
    this.emojiButtonEl.innerHTML = `<span>🍏</span>`;
    this.iconButtonEl.innerHTML = `<span class="material-icons">${AddList.icons[0]}</span>`;
    const decorationWrapper = document.createElement("div");
    decorationWrapper.classList.add("decoration-wrapper", "py-12");
    const iconWrapper = document.createElement("div");
    this.emojiButtonEl.setAttribute("style", `background-color: ${this.colorPicked}`);
    this.iconButtonEl.setAttribute("style", `background-color: ${this.colorPicked}`);
    this.emojiButtonEl.addEventListener("click", this.showEmojiPicker);
    iconWrapper.classList.add("icon-wrapper");
    iconWrapper.append(this.emojiButtonEl, this.iconButtonEl);
    decorationWrapper.append(this.colorPickerEl, iconWrapper);
    this.okButton.textContent = "OK";
    this.okButton.addEventListener("click", hide);
    this.cancelButton.textContent = "Cancel";
    this.cancelButton.addEventListener("click", hide);
    const buttonWrapper = document.createElement("div");
    buttonWrapper.classList.add("button-wrapper");
    buttonWrapper.append(this.cancelButton, this.okButton);
    this.currentEl.classList.add("add-list", "p-16", "text-body1");
    this.currentEl.append(this.titleEl, this.labelEl, decorationWrapper, buttonWrapper);
  }

  private pickColor = (e: Event) => {
    const { target } = e;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    this.colorPicked = target.value;
    this.emojiButtonEl.setAttribute("style", `background-color: ${this.colorPicked}`);
    this.iconButtonEl.setAttribute("style", `background-color: ${this.colorPicked}`);
  };

  private showEmojiPicker = (e: MouseEvent) => {
    const { clientX, clientY } = e;
    if (!(this.emojiPicker instanceof HTMLElement)) {
      return;
    }
    const normalizedPosition = new Position(clientX, clientY).normalizePosition(this.emojiPicker);
    this.emojiPicker.style.position = "fixed";
    this.emojiPicker.style.left = normalizedPosition.x + "px";
    this.emojiPicker.style.top = clientY / 2 + "px";
    this.emojiPicker.style.zIndex = "2000";
    this.emojiPicker.style.display = "flex";
    this.emojiPicker.attributeChangedCallback("onClickOutside", null, () => {
      if (!(this.emojiPicker instanceof HTMLElement)) {
        return;
      }
      this.emojiPicker.style.display = "none";
      this.emojiPicker.attributeChangedCallback("onClickOutside", null, () => {
      });
    });
  };
}
