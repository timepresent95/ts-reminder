import DraggableComponent from "../utility/DraggableComponent";

declare global {
  type EventPipe = (action: string, component: DraggableComponent) => void
  type EnrolledEvent = { [key: string]: (component: DraggableComponent) => void };
}
