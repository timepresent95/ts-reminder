import "./assets/style/style.scss";
import SchedulePage from "./component/SchedulePage";
import Sidebar from "./component/Sidebar";
import { getCategories, getScheduleList } from "./utility/firestoreManager";
import Modal from "./utility/Modal";

String.prototype.proper = function() {
  return this[0].toUpperCase() + this.slice(1);
};

async function init() {
  const category = await getCategories();
  const sidebar = new Sidebar(category);
  const sidebarEl = sidebar.create();
  // const title = category[0].name;
  // const schedules = await getScheduleList(title);
  const schedulePage = new SchedulePage('test', []);
  const schedulePageEl = schedulePage.create();
  const app = document.createElement("div");
  const modal = Modal.getInstance();
  modal.setParent(app);
  app.setAttribute("id", "app");
  document.body.appendChild(app);
  app.append(sidebarEl, schedulePageEl);
  schedulePage.render();
}

init();
