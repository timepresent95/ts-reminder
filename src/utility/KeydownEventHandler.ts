export default class KeydownEventHandler {

  private static instance: KeydownEventHandler;
  private eventHandler: (e: KeyboardEvent) => void = () => {};

  setEvent(value: (e: KeyboardEvent) => any) {
    if(value === this.eventHandler) {
      return;
    }
    this.removeEvent();
    this.eventHandler = value;
    window.addEventListener("keydown", this.eventHandler);
  }
  removeEvent() {
    this.eventHandler = () => {};
    window.removeEventListener("keydown", this.eventHandler);
  }
  static getInstance() {
    if(!KeydownEventHandler.instance) {
      KeydownEventHandler.instance = new KeydownEventHandler();
    }
    return KeydownEventHandler.instance;
  }
}
