import { QueryDocumentSnapshot, SnapshotOptions } from "@firebase/firestore";

export default class ScheduleCategory {
  name: string;
  color: string;
  icon: string;
  isEmoji: boolean;

  constructor(name: string, color: string, icon: string, isEmoji: boolean) {
    this.name = name;
    this.color = color;
    this.icon = icon;
    this.isEmoji = isEmoji;
  }

  static converter = {
    toFirestore: (scheduleCategory: ScheduleCategory) => ({
      name: scheduleCategory.name,
      color: scheduleCategory.color,
      icon: scheduleCategory.icon,
      isEmoji: scheduleCategory.isEmoji
    }),
    fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
      const data = snapshot.data(options);
      return new ScheduleCategory(data.name, data.color, data.icon, data.isEmoji);
    }
  };
}
