import DraggableComponent from "../component/DraggableComponent";

declare global {
  type EventPipe = (action: string, component: DraggableComponent) => void
  type EnrolledEvent = { [key: string]: (component: DraggableComponent) => void };
  type Menu = { title: string, key: string, func: () => void, disable: boolean };
  type KeydownCustom = { [key: string]: () => void };
  type SimplifySchedule = { key: string, title: string, notes: string, isCompleted: boolean };
}
