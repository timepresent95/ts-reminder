import "./assets/style/style.scss";
import SchedulePage from "./component/SchedulePage";
import Sidebar from "./component/Sidebar";

String.prototype.proper = function() {
  return this[0].toUpperCase() + this.slice(1)
};

function init() {
  const sidebar = new Sidebar();
  const sidebarEl = sidebar.create();
  const schedulePage = new SchedulePage('today');
  const schedulePageEl = schedulePage.create();
  const app = document.createElement('div');
  app.setAttribute('id', 'app');
  document.body.appendChild(app);
  app.append(sidebarEl, schedulePageEl)
  schedulePage.render()
}

init();
