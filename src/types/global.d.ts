import DraggableComponent from "../component/DraggableComponent";

declare global {
  type EventPipe = (action: string) => void;
  type EnrolledEvent = { [key: string]: () => void };
  type DragEventPipe = (action: string, component: DraggableComponent) => void
  type EnrolledDragEvent = { [key: string]: (component: DraggableComponent) => void };
  type Menu = { title: string, key: string, func: () => void, disable: boolean };
  type KeydownCustom = { [key: string]: () => void };
  type ScheduleData = { key: string, title: string, notes: string, isCompleted: boolean, category: ScheduleCategory };
  type ScheduleCategory = { name: string, color: string, icon: string, isEmoji: boolean };
}
