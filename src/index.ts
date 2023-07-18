import "./assets/style/style.scss";
import SchedulePage from "./component/SchedulePage";
import Sidebar from "./component/Sidebar";
import { getCategories, getScheduleList } from "./utility/firestoreManager";

String.prototype.proper = function() {
  return this[0].toUpperCase() + this.slice(1);
};

async function init() {
  const sidebar = new Sidebar();
  const sidebarEl = sidebar.create();
  const category = await getCategories()
  const title = category[0]
  const schedules = await getScheduleList(title)
  const schedulePage = new SchedulePage(title, schedules);
  const schedulePageEl = schedulePage.create();
  const app = document.createElement("div");
  app.setAttribute("id", "app");
  document.body.appendChild(app);
  app.append(sidebarEl, schedulePageEl);
  schedulePage.render();
}

init();
