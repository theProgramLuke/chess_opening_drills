import _ from "lodash";
import now from "lodash/now";
import { DateTime } from "luxon";

import {
  SuperMemo2,
  TrainingGrade,
  SuperMemo2HistoryEntry,
  SavedSuperMemo2
} from "@/store/repertoire/SuperMemo2";
import { TrainingMode } from "../trainingMode";

export interface TrainingEvent {
  elapsedMilliseconds: number;
  attemptedMoves: string[];
}

export interface TrainingHistoryEntry
  extends SuperMemo2HistoryEntry,
    TrainingEvent {}

export interface SavedRepetitionTraining
  extends Omit<SavedSuperMemo2, "history"> {
  history: TrainingHistoryEntry[];
}

export class RepetitionTraining {
  private historyInternal: TrainingEvent[];
  private training: SuperMemo2;

  constructor(
    easiness = 2.5,
    effectiveTrainingIndex = 0,
    previousIntervalDays?: number,
    history: TrainingHistoryEntry[] = [],
    scheduledRepetitionTimestamp?: number
  ) {
    this.training = new SuperMemo2(
      easiness,
      effectiveTrainingIndex,
      previousIntervalDays,
      _.map(history, entry => {
        return {
          easiness: entry.easiness,
          grade: entry.grade,
          timestamp: entry.timestamp
        } as SuperMemo2HistoryEntry;
      }),
      scheduledRepetitionTimestamp
    );
    this.historyInternal = history;
  }

  get scheduledRepetitionTimestamp(): number | undefined {
    return this.training.scheduledRepetitionTimestamp;
  }

  get easiness(): number {
    return this.training.easiness;
  }

  static fromSaved(saved: SavedRepetitionTraining) {
    return new RepetitionTraining(
      saved.easiness,
      saved.effectiveTrainingIndex,
      saved.previousIntervalDays,
      saved.history,
      saved.scheduledRepetitionTimestamp
    );
  }

  addTrainingEvent(event: TrainingEvent): void {
    const grade = this.calculateGrade(event);
    this.training.addTrainingEvent(grade);
    this.historyInternal.push(event);
  }

  get history(): TrainingHistoryEntry[] {
    return _.map(this.historyInternal, (event, index) => {
      return {
        ...this.training.history[index],
        ...event
      } as TrainingHistoryEntry;
    });
  }

  asSaved(): SavedRepetitionTraining {
    return {
      ...this.training.asSaved(),
      history: this.history
    };
  }

  includeForTrainingMode(mode: TrainingMode, difficultyLimit = 0): boolean {
    if (TrainingMode.New === mode) {
      return this.includeForNewMode();
    } else if (TrainingMode.Cram === mode) {
      return true;
    } else if (TrainingMode.Scheduled === mode) {
      return this.includeForScheduledMode();
    } else {
      // TrainingMode.Difficult
      return this.includeForDifficultMode(difficultyLimit);
    }
  }

  private includeForDifficultMode(difficultyLimit: number): boolean {
    return (
      this.training.easiness <= difficultyLimit && !this.includeForNewMode()
    );
  }

  private includeForNewMode(): boolean {
    return _.isEmpty(this.historyInternal);
  }

  private includeForScheduledMode(): boolean {
    if (this.training.scheduledRepetitionTimestamp) {
      const today = DateTime.fromMillis(now());
      const scheduled = DateTime.fromMillis(
        this.training.scheduledRepetitionTimestamp
      );

      today.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
      scheduled.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

      return today >= scheduled;
    } else {
      return false;
    }
  }

  private calculateGrade(event: TrainingEvent): TrainingGrade {
    switch (event.attemptedMoves.length) {
      case 1: {
        if (event.elapsedMilliseconds < 2000) {
          return 5;
        } else if (event.elapsedMilliseconds < 10000) {
          return 4;
        } else {
          return 3;
        }
      }
      case 2: {
        if (event.elapsedMilliseconds < 10000) {
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
