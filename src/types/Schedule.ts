export default class Schedule {
    title: string;
    notes: string;
    isCompleted: boolean;
    key: string;

    constructor(title: string, notes: string, key: string) {
        this.title = title;
        this.notes = notes;
        this.key = key;
        this.isCompleted = false;
    }
}
