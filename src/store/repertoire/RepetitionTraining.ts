import _ from "lodash";

import {
  SuperMemo2,
  TrainingGrade,
  SuperMemo2HistoryEntry
} from "@/store/repertoire/SuperMemo2";

export interface TrainingEvent {
  elapsedMilliseconds: number;
  attempts: number;
}

export interface TrainingHistoryEntry
  extends SuperMemo2HistoryEntry,
    TrainingEvent {}

export class RepetitionTraining {
  private trainingHistory: TrainingEvent[];
  private training: SuperMemo2;

  constructor(
    easiness = 2.5,
    effectiveTrainingIndex = 0,
    previousIntervalDays?: number,
    trainingHistory: TrainingEvent[] = []
  ) {
    this.training = new SuperMemo2(
      easiness,
      effectiveTrainingIndex,
      previousIntervalDays
    );
    this.trainingHistory = trainingHistory;
  }

  addTrainingEvent(event: Readonly<TrainingEvent>): void {
    const grade = this.calculateGrade(event);
    this.training.addTrainingEvent(grade);
    this.trainingHistory.push(event);
  }

  get history(): Readonly<Readonly<TrainingHistoryEntry>[]> {
    return _.map(this.trainingHistory, (event, index) => {
      return {
        ...this.training.history[index],
        ...event
      } as TrainingHistoryEntry;
    });
  }

  private calculateGrade(event: Readonly<TrainingEvent>): TrainingGrade {
    switch (event.attempts) {
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
