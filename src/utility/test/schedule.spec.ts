import { createNewSchedule, filterSelectedSchedules } from "../schedule";
import Schedule from "../../model/Schedule";

describe("utility for schedule ", () => {
  let schedules: Schedule[];

  beforeEach(() => {
    schedules = [
      new Schedule("eat", "breakfast", false),
      new Schedule("wash body", "with lush body shower gel", true),
      new Schedule("package the bag", "for going school", false),
      new Schedule("go to school", "we must go to school", true),
      new Schedule("eat", "happy lunch", true),
      new Schedule("go back to home", "home sweet home", false),
      new Schedule("do homework", "i don't like homework", false)
    ];
  });

  test("create new schedule template", () => {
    const beforeSchedulesLength = schedules.length;
    const newSchedule = createNewSchedule(schedules);
    expect(newSchedule.title).toBe("");
    expect(newSchedule.notes).toBe("");
    expect(newSchedule.isCompleted).toBe(false);
    expect(schedules).toHaveLength(beforeSchedulesLength + 1);
  });

  test("filter selected schedules", () => {
    const numbers = [0, 2, 3, 4, 6];
    const selectedSchedules = schedules.filter((v, i) => numbers.includes(i));
    const selectedScheduleKeys = selectedSchedules.map((v) => v.key);
    const filteredSchedules = filterSelectedSchedules(schedules, selectedScheduleKeys);
    expect(filteredSchedules.length).toBe(schedules.length - numbers.length);
    expect(filteredSchedules).not.toContain(selectedSchedules);
  });
});
