import Schedule from "../Schedule";

describe("Schedule Component", () => {
  test("toggle schedule completed", () => {
    const schedule = new Schedule("", "", false);
    schedule.toggleScheduleCompleted();
    expect(schedule.isCompleted).toBe(true);
    schedule.toggleScheduleCompleted();
    expect(schedule.isCompleted).toBe(false);
  });
});
