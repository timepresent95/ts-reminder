export default class Schedule {
    title: string;
    notes: string;
    isCompleted: boolean;
    key: string;

    constructor(title: string, notes: string, key: string);
    constructor(title: string, notes: string, key: string, isCompleted?: boolean) {
        this.title = title;
        this.notes = notes;
        this.key = key;
        this.isCompleted = isCompleted ?? false;
    }
}

export interface ContextSelectedBorder {
    top: boolean;
    bottom: boolean;
}
