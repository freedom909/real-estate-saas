// src/gateway/cognition/domain/planning/entities/task.ts
import { AIDomain, CapabilityType, TaskStatus } from "../types/enums";

export class Task {

  private _status =
    TaskStatus.PENDING;

  private _result?: unknown;

  private _error?: string;

  constructor(
    public readonly id: string,
    public readonly domain: AIDomain,
    public readonly capability:
      CapabilityType,
    public readonly payload:
      Record<string, unknown>,
    public readonly dependsOn:
      string[] = []
  ) {}

  get status(): TaskStatus {
    return this._status;
  }

  get result(): unknown {
    return this._result;
  }

  get error():
    string | undefined {
    return this._error;
  }

  public markRunning(): void {

    if (
      this._status !==
      TaskStatus.PENDING
    ) {
      throw new Error(
        `Task ${this.id}
         cannot transition
         to RUNNING`
      );
    }

    this._status =
      TaskStatus.RUNNING;
  }

  public markCompleted(
    result: unknown
  ): void {

    if (
      this._status !==
      TaskStatus.RUNNING
    ) {
      throw new Error(
        `Task ${this.id}
         cannot transition
         to COMPLETED`
      );
    }

    this._status =
      TaskStatus.COMPLETED;

    this._result = result;
  }

  public markFailed(
    error: string
  ): void {

    this._status =
      TaskStatus.FAILED;

    this._error = error;
  }

  public isReady(
    completedTaskIds:
      Set<string>
  ): boolean {

    return (
      this._status ===
      TaskStatus.PENDING
      &&
      this.dependsOn.every(
        id =>
          completedTaskIds
            .has(id)
      )
    );
  }
}