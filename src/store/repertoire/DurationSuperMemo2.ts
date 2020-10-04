import _ from "lodash";

import {
  SuperMemo2,
  TrainingGrade,
  HistoryEntry
} from "@/store/repertoire/SuperMemo2";

export interface TrainingEvent {
  elapsedMilliseconds: number;
}

export interface DurationHistoryEntry extends HistoryEntry, TrainingEvent {}

export class DurationSuperMemo2 {
  private elapsedMillisecondsHistory: number[];
  private training: SuperMemo2;

  constructor(
    easiness = 2.5,
    effectiveTrainingIndex = 0,
    previousIntervalDays?: number,
    elapsedMillisecondsHistory: number[] = []
  ) {
    this.training = new SuperMemo2(
      easiness,
      effectiveTrainingIndex,
      previousIntervalDays
    );
    this.elapsedMillisecondsHistory = elapsedMillisecondsHistory;
  }

  addTrainingEvent(attempts: number, elapsedMilliseconds: number): void {
    const grade = this.calculateGrade(attempts, elapsedMilliseconds);
    this.training.addTrainingEvent(grade);
    this.elapsedMillisecondsHistory.push(elapsedMilliseconds);
  }

  get history(): DurationHistoryEntry[] {
    return _.map(
      this.elapsedMillisecondsHistory,
      (elapsedMilliseconds, index) => {
        return {
          ...this.training.history[index],
          elapsedMilliseconds
        } as DurationHistoryEntry;
      }
    );
  }

  private calculateGrade(
    attempts: number,
    elapsedMilliseconds: number
  ): TrainingGrade {
    switch (attempts) {
      case 1: {
        if (elapsedMilliseconds < 2000) {
          return 5;
        } else if (elapsedMilliseconds < 10000) {
          return 4;
        } else {
          return 3;
        }
      }
      case 2: {
        if (elapsedMilliseconds < 10000) {
          return 2;
        } else {
          return 1;
        }
      }
      case 3:
      default: {
        return 0;
      }
    }
  }
}
