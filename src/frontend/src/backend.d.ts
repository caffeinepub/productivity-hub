import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Task {
    id: bigint;
    title: string;
    completed: boolean;
    dueDate?: bigint;
    priority: Priority;
}
export interface PomodoroStats {
    today: bigint;
    allTime: bigint;
}
export interface QuickLink {
    id: bigint;
    url: string;
    title: string;
    emoji: string;
}
export interface HabitView {
    id: bigint;
    streak: bigint;
    completionDates: Array<bigint>;
    name: string;
    createdAt: bigint;
    color: string;
}
export interface UserDataView {
    pomodoros: Array<Pomodoro>;
    tasks: Array<Task>;
    nextQuickLinkId: bigint;
    nextHabitId: bigint;
    nextTaskId: bigint;
    notes: Array<Note>;
    quickLinks: Array<QuickLink>;
    habits: Array<HabitView>;
    nextNoteId: bigint;
}
export interface Pomodoro {
    duration: bigint;
    timestamp: bigint;
}
export interface Note {
    id: bigint;
    title: string;
    content: string;
}
export enum Priority {
    low = "low",
    high = "high",
    medium = "medium"
}
export interface backendInterface {
    addQuickLink(title: string, url: string, emoji: string): Promise<QuickLink>;
    createHabit(name: string, color: string): Promise<HabitView>;
    createNote(title: string, content: string): Promise<Note>;
    createTask(title: string, priority: Priority, dueDate: bigint | null): Promise<Task>;
    deleteHabit(id: bigint): Promise<void>;
    deleteNote(id: bigint): Promise<void>;
    deleteQuickLink(id: bigint): Promise<void>;
    deleteTask(id: bigint): Promise<void>;
    getHabits(): Promise<Array<HabitView>>;
    getNotes(): Promise<Array<Note>>;
    getPomodoroStats(): Promise<PomodoroStats>;
    getQuickLinks(): Promise<Array<QuickLink>>;
    getTasks(): Promise<Array<Task>>;
    getUserData(): Promise<UserDataView>;
    logPomodoro(duration: bigint): Promise<void>;
    toggleHabitCompletion(habitId: bigint): Promise<void>;
    toggleTaskCompletion(id: bigint): Promise<void>;
}
