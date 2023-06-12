import { createNewSchedule, toggleScheduleCompleted } from "../schedule";
import Schedule from "../../model/Schedule";

let schedules: Schedule[] = [];


test("create new schedule template", () => {
  const beforeSchedulesLength = schedules.length;
  const newSchedule = createNewSchedule(schedules);
  expect(newSchedule.title).toBe("");
  expect(newSchedule.notes).toBe("");
  expect(newSchedule.isCompleted).toBe(false);
  expect(schedules.length).toBe(beforeSchedulesLength + 1);
});

test("toggle schedule completed", () => {
  const schedule = new Schedule("", "", "", false);
  toggleScheduleCompleted(schedule)
  expect(schedule.isCompleted).toBe(true);
  toggleScheduleCompleted(schedule)
  expect(schedule.isCompleted).toBe(false);
})
