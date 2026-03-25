import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type TaskId = bigint;
export interface Task {
    id: TaskId;
    status: TaskStatus;
    completedAt?: bigint;
    title: string;
    proofText?: string;
    owner: Principal;
    createdAt: bigint;
    description: string;
    durationMinutes: bigint;
    proofImage?: ExternalBlob;
}
export enum TaskStatus {
    pending = "pending",
    completed = "completed",
    locked = "locked"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createTask(title: string, description: string, durationMinutes: bigint): Promise<TaskId>;
    deleteTask(taskId: TaskId): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getCompletedTaskIds(): Promise<Array<TaskId>>;
    getCompletedTasks(): Promise<Array<Task>>;
    getLockedTaskIds(): Promise<Array<TaskId>>;
    getMyTasks(): Promise<Array<Task>>;
    getPendingTasks(): Promise<Array<Task>>;
    getTask(taskId: TaskId): Promise<Task | null>;
    getTasksByTimeRange(startTime: bigint, endTime: bigint): Promise<Array<Task>>;
    isCallerAdmin(): Promise<boolean>;
    startFocusSession(taskId: TaskId): Promise<void>;
    submitProof(taskId: TaskId, proofText: string | null, proofImage: ExternalBlob | null): Promise<void>;
}
