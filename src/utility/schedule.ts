import ScheduleType from "../model/Schedule";


function createRandomKey(): string {
  return (Math.random() + 1).toString(36).substring(7) + Date.now();
}

export function createNewSchedule(schedules: ScheduleType[]): ScheduleType {
  const newSchedule = new ScheduleType('', '', createRandomKey());
  schedules.push(newSchedule);
  return newSchedule;
}
