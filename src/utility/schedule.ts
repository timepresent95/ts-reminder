import Schedule from "../model/Schedule";


export function createRandomKey(): string {
  return (Math.random() + 1).toString(36).substring(7) + Date.now();
}

export function createNewSchedule(schedules: Schedule[]): Schedule {
  const newSchedule = new Schedule("", "", createRandomKey());
  schedules.push(newSchedule);
  return newSchedule;
}

export function toggleScheduleCompleted(targetSchedule: Schedule) {
  targetSchedule.isCompleted = !targetSchedule.isCompleted;
}

export function filterSelectedSchedules(schedules: Schedule[], selectedScheduleKeys: string[]) {
  return schedules.filter(({ key }) => !selectedScheduleKeys.includes(key));
}
