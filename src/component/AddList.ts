import data from "@emoji-mart/data";
import { Picker } from "emoji-mart";
import { COLORS, EMOJI_CATEGORIES, ICONS } from "../constant";
import Position from "../utility/Position";

export default class AddList {
  private parentEl: HTMLElement | null = null;
  readonly currentEl = document.createElement("div");
  private readonly labelEl = document.createElement("label");
  private readonly inputEl = document.createElement("input");
  private readonly colorPickerEl = document.createElement("div");
  private readonly emojiButtonEl = document.createElement("button");
  private readonly iconButtonEl = document.createElement("button");
  private readonly okButton = document.createElement("button");
  private readonly cancelButton = document.createElement("button");
  private readonly emojiPicker: Picker;
  private readonly iconPickerEl = document.createElement("ul");
  private static readonly icons: string[] = ICONS;
  private static readonly colors: string[] = COLORS;
  private selectedColor: string = AddList.colors[0];
  private selectedIcon = AddList.icons[0];
  private selectedEmoji = "🍏";

  constructor(hide: () => void) {
    this.emojiPicker = new Picker({
      parent: document.body,
      data,
      categories: EMOJI_CATEGORIES,
      onEmojiSelect: this.onEmojiSelect
    });
    if (!(this.emojiPicker instanceof HTMLElement)) {
      return;
    }
    this.emojiPicker.style.display = "none";
    this.iconPickerEl.classList.add("icon-picker");

    this.labelEl.textContent = "Name:";
    this.inputEl.addEventListener("input", this.onInputEvent);
    this.labelEl.appendChild(this.inputEl);

    this.colorPickerEl.classList.add("color-picker");
    this.colorPickerEl.addEventListener("change", this.pickColor);
    this.colorPickerEl.innerHTML = `<p>Color:</p>
      <fieldset>
        ${AddList.colors.map((v) =>
      `<input 
            ${v === this.selectedColor ? "checked" : ""} 
            type="radio" 
            name="color" 
            style="background-color: ${v}" 
            value="${v}" 
          />`)
      .join("")}
      </fieldset>`;
    this.emojiButtonEl.innerHTML = `<span>${this.selectedEmoji}</span>`;
    this.emojiButtonEl.setAttribute("style", `background-color: ${this.selectedColor}`);
    this.emojiButtonEl.classList.add("selected");
    this.emojiButtonEl.addEventListener("click", this.showEmojiPicker);
    this.iconButtonEl.innerHTML = `<span class="material-icons">${this.selectedIcon}</span>`;
    this.iconButtonEl.addEventListener("click", this.showIconPicker);
    this.iconButtonEl.setAttribute("style", `background-color: ${this.selectedColor}`);
    const iconWrapper = document.createElement("div");
    iconWrapper.classList.add("icon-wrapper");
    iconWrapper.append(this.emojiButtonEl, this.iconButtonEl);
    const decorationWrapper = document.createElement("div");
    decorationWrapper.classList.add("decoration-wrapper", "py-12");
    decorationWrapper.append(this.colorPickerEl, iconWrapper);

    this.okButton.textContent = "OK";
    this.okButton.addEventListener("click", () => {
      this.resetInput();
      hide();
    });
    this.okButton.setAttribute("disabled", "");
    this.cancelButton.textContent = "Cancel";
    this.cancelButton.addEventListener("click", () => {
      this.resetInput();
      hide();
    });
    const buttonWrapper = document.createElement("div");
    buttonWrapper.classList.add("button-wrapper");
    buttonWrapper.append(this.cancelButton, this.okButton);

    this.currentEl.innerHTML = `
    <h4 class="text-body1 mb-12">New List</h4>
    `;
    this.currentEl.classList.add("add-list", "p-16", "text-body1");
    this.currentEl.append(this.labelEl, decorationWrapper, buttonWrapper);
  }

  private onEmojiSelect = (emoji: { native: string }) => {
    this.emojiButtonEl.innerHTML = `<span>${emoji.native}</span>`;
    if (!(this.emojiPicker instanceof HTMLElement)) {
      return;
    }
    this.selectedEmoji = emoji.native;
    this.emojiButtonEl.classList.add("selected");
    this.iconButtonEl.classList.remove("selected");
    this.emojiPicker.style.display = "none";
  }

  private onInputEvent = (e: Event) => {
    if (e.currentTarget instanceof HTMLInputElement && e.currentTarget.value.trim() === "") {
      this.okButton.setAttribute("disabled", "");
    } else {
      this.okButton.removeAttribute("disabled");
    }
  };

  private resetInput() {
    this.inputEl.value = "";
  }

  private pickColor = (e: Event) => {
    const { target } = e;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    this.selectedColor = target.value;
    this.emojiButtonEl.setAttribute("style", `background-color: ${this.selectedColor}`);
    this.iconButtonEl.setAttribute("style", `background-color: ${this.selectedColor}`);
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

  private showIconPicker = (e: MouseEvent) => {
    const { clientX, clientY } = e;
    const normalizedPosition = new Position(clientX, clientY).normalizePosition(this.iconPickerEl);
    this.iconPickerEl.innerHTML = AddList.icons.map(v =>
      `<li class="${v === this.selectedIcon ? "selected" : ""}" data-icon="${v}">
        <span class="material-icons">${v}</span>
      </li>`).join("");
    this.iconPickerEl.style.position = "fixed";
    this.iconPickerEl.style.left = normalizedPosition.x + "px";
    this.iconPickerEl.style.top = clientY / 2 + "px";
    this.iconPickerEl.style.zIndex = "2000";
    const onClickIcon = (e: MouseEvent) => {
      const { target } = e;
      if (!(target instanceof HTMLElement) || !target.closest("li")) {
        return;
      }
      const iconListEl = target.closest("li");
      if (!(iconListEl instanceof HTMLLIElement) || !(typeof iconListEl.dataset.icon === "string")) {
        return;
      }
      this.selectedIcon = iconListEl.dataset.icon;
      this.iconButtonEl.innerHTML = `<span class="material-icons">${this.selectedIcon}</span>`;
      this.iconButtonEl.classList.add("selected");
      this.emojiButtonEl.classList.remove("selected");
      this.iconPickerEl.removeEventListener("click", onClickIcon);
      document.body.removeEventListener("mousedown", onClickOutside);
      document.body.removeChild(this.iconPickerEl);
    };
    const onClickOutside = (e: MouseEvent) => {
      const { target } = e;

      if (!(target instanceof HTMLElement) || target.closest(".icon-picker")) {
        return;
      }
      this.iconPickerEl.removeEventListener("click", onClickIcon);
      document.body.removeEventListener("mousedown", onClickOutside);
      document.body.removeChild(this.iconPickerEl);
    };
    this.iconPickerEl.addEventListener("click", onClickIcon);
    document.body.append(this.iconPickerEl);
    document.body.addEventListener("mousedown", onClickOutside);
  };

  mount(parentEl: HTMLElement) {
    this.parentEl = parentEl;
    this.parentEl.appendChild(this.currentEl);
  }
}
