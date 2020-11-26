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

const MillisecondsPerHour = 1000 * 60 * 60;
export const MillisecondsPerDay = 24 * MillisecondsPerHour;

export interface SuperMemo2HistoryEntry {
  readonly easiness: number;
  readonly timestamp: number;
  readonly grade: TrainingGrade;
}

export interface SavedSuperMemo2 {
  readonly easiness: number;
  readonly history: SuperMemo2HistoryEntry[];
  readonly scheduledRepetitionTimestamp?: number;
  readonly effectiveTrainingIndex: number;
  readonly previousIntervalDays?: number;
}

// Jan 01 3000
const MaxTimestamp = 325036800000000;

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
    easinessHistory: SuperMemo2HistoryEntry[] = [],
    scheduledRepetitionTimestamp?: number
  ) {
    this.easinessInternal = easiness;
    this.effectiveTrainingIndex = effectiveTrainingIndex;
    this.previousIntervalDays = previousIntervalDays;
    this.historyInternal = easinessHistory;
    this.scheduledRepetitionTimestampInternal = scheduledRepetitionTimestamp;
  }

  static fromSaved(saved: SavedSuperMemo2): SuperMemo2 {
    return new SuperMemo2(
      saved.easiness,
      saved.effectiveTrainingIndex,
      saved.previousIntervalDays,
      saved.history,
      saved.scheduledRepetitionTimestamp
    );
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
    // https://apps.ankiweb.net/docs/manual20.html
    // reviewing a card shortly after it is scheduled has little impact on scheduling
    // (eg, a card due tomorrow with a one day interval will remain due tomorrow if reviewed early)
    let trainedEarly = false;
    const lastTraining = _.last(this.history);
    if (lastTraining) {
      const timeSinceLastTraining = now() - lastTraining.timestamp;
      trainedEarly = timeSinceLastTraining < MillisecondsPerHour;
    }

    const previousEasiness = this.easinessInternal;

    this.easinessInternal =
      previousEasiness + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));

    if (this.easinessInternal < 1.3) {
      this.easinessInternal = 1.3;
    }

    this.historyInternal.push({
      easiness: this.easinessInternal,
      timestamp: now(),
      grade,
    });

    const correctResponse = grade >= 3;
    if (correctResponse) {
      ++this.effectiveTrainingIndex;
    } else {
      // start repetitions for the item from the beginning without changing the easiness
      // (i.e. use intervals I(1), I(2) etc. as if the item was memorized anew).
      this.effectiveTrainingIndex = 1;
    }

    if (!(trainedEarly && correctResponse)) {
      this.updateSchedule();
    }
  }

  asSaved(): SavedSuperMemo2 {
    let timestamp = this.scheduledRepetitionTimestamp;

    if (this.scheduledRepetitionTimestamp) {
      if (this.scheduledRepetitionTimestamp > MaxTimestamp) {
        timestamp = MaxTimestamp;
      }
    }

    return {
      easiness: this.easinessInternal,
      history: this.historyInternal,
      scheduledRepetitionTimestamp: timestamp,
      previousIntervalDays: this.previousIntervalDays,
      effectiveTrainingIndex: this.effectiveTrainingIndex,
    };
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

    this.scheduledRepetitionTimestampInternal = _.min([
      now() + days * MillisecondsPerDay,
      MaxTimestamp,
    ]);

    this.previousIntervalDays = days;
  }
}
