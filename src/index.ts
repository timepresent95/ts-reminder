import "./assets/style/style.scss";
import SchedulePage from "./component/SchedulePage";

String.prototype.proper = function() {
  return this[0].toUpperCase() + this.slice(1)
};

function init() {
  window.addEventListener("contextmenu", (e) => e.preventDefault());
  const schedulePage = new SchedulePage('today');
  const schedulePageEl = schedulePage.create();
  document.body.appendChild(schedulePageEl)
  schedulePage.render()
}

init();
