import { createNewSchedule } from "../schedule";
import ScheduleType from "../../model/Schedule";

let schedules: ScheduleType[] = [];

test("create new schedule template", () => {
  const beforeSchedulesLength = schedules.length;
  const newSchedule = createNewSchedule(schedules);
  expect(newSchedule.title).toBe("");
  expect(newSchedule.notes).toBe("");
  expect(newSchedule.isCompleted).toBe(false);
  expect(schedules.length).toBe(beforeSchedulesLength + 1);

});
