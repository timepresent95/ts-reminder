export default class KeydownEventHandler {

  private static instance: KeydownEventHandler;
  private eventHandler: (e: KeyboardEvent) => void = () => {
  };

  private constructor() {
  }

  setEvent(value: (e: KeyboardEvent) => any) {
    if (value === this.eventHandler) {
      return;
    }
    this.removeEvent();
    this.eventHandler = value;
    window.addEventListener("keydown", this.eventHandler);
  }

  removeEvent() {
    window.removeEventListener("keydown", this.eventHandler);
    this.eventHandler = () => {
    };
  }

  static getInstance() {
    if (!KeydownEventHandler.instance) {
      KeydownEventHandler.instance = new KeydownEventHandler();
    }
    return KeydownEventHandler.instance;
  }
}
