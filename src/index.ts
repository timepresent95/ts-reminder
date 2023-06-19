import "./assets/style/style.scss";
import SchedulePage from "./component/SchedulePage";
window.addEventListener("contextmenu", (e) => e.preventDefault());
const TodaySchedulePage = new SchedulePage('Today');
