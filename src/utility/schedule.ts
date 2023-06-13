import Schedule from "../model/Schedule";

export function createNewSchedule(schedules: Schedule[]): Schedule {
  const newSchedule = new Schedule("", "");
  schedules.push(newSchedule);
  return newSchedule;
}

export function toggleScheduleCompleted(targetSchedule: Schedule) {
  targetSchedule.isCompleted = !targetSchedule.isCompleted;
}

export function filterSelectedSchedules(schedules: Schedule[], selectedScheduleKeys: string[]) {
  return schedules.filter(({ key }) => !selectedScheduleKeys.includes(key));
}
