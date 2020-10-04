import _ from "lodash";
import now from "lodash/now"; // separate import for mock

// After each repetition assess the quality of repetition response in 0-5 grade scale:
// 5 - perfect response
// 4 - correct response after a hesitation
// 3 - correct response recalled with serious difficulty
// 2 - incorrect response; where the correct one seemed easy to recall
// 1 - incorrect response; the correct one remembered
// 0 - complete blackout.
export type TrainingGrade = 0 | 1 | 2 | 3 | 4 | 5;

export const MillisecondsPerDay = 86400000;

export interface SuperMemo2HistoryEntry {
  readonly easiness: number;
  readonly timestamp: number;
  readonly grade: TrainingGrade;
}

export class SuperMemo2 {
  private easinessInternal: number;
  private historyInternal: SuperMemo2HistoryEntry[];
  private scheduledRepetitionTimestampInternal?: number;
  private effectiveTrainingIndex: number;
  private previousIntervalDays?: number;

  constructor(
    easiness = 2.5,
    effectiveTrainingIndex = 0,
    previousIntervalDays?: number,
    easinessHistory: SuperMemo2HistoryEntry[] = []
  ) {
    this.easinessInternal = easiness;
    this.effectiveTrainingIndex = effectiveTrainingIndex;
    this.previousIntervalDays = previousIntervalDays;
    this.historyInternal = easinessHistory;
  }

  get easiness(): number {
    return this.easinessInternal;
  }

  get scheduledRepetitionTimestamp(): number | undefined {
    return this.scheduledRepetitionTimestampInternal;
  }

  get history(): SuperMemo2HistoryEntry[] {
    return this.historyInternal;
  }

  addTrainingEvent(grade: TrainingGrade): void {
    const previousEasiness = this.easinessInternal;

    this.easinessInternal =
      previousEasiness + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    this.easinessInternal = _.max([this.easinessInternal, 1.3]) || 1.3;

    this.historyInternal.push({
      easiness: this.easinessInternal,
      timestamp: now(),
      grade
    });

    if (grade < 3) {
      // If the quality response was lower than 3
      // then start repetitions for the item from the beginning without changing the E-Factor
      // (i.e. use intervals I(1), I(2) etc. as if the item was memorized anew).
      this.effectiveTrainingIndex = 1;
    } else {
      ++this.effectiveTrainingIndex;
    }

    this.updateSchedule();
  }

  private updateSchedule(): void {
    let days = 0;

    if (1 === this.effectiveTrainingIndex) {
      days = 1;
    } else if (2 === this.effectiveTrainingIndex) {
      days = 4;
    } else {
      days = _.ceil((this.previousIntervalDays || 0) * this.easinessInternal);
    }

    this.scheduledRepetitionTimestampInternal =
      now() + days * MillisecondsPerDay;
    this.previousIntervalDays = days;
  }
}