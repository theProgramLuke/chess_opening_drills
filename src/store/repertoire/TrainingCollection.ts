import _ from "lodash";

import {
  RepetitionTraining,
  SavedRepetitionTraining
} from "@/store/repertoire/RepetitionTraining";

export type RepetitionTrainingCollection = Record<
  string,
  Record<string, RepetitionTraining>
>;

export type SavedTrainingCollection = Record<
  string,
  Record<string, SavedRepetitionTraining>
>;

export class TrainingCollection {
  repetitionTraining: RepetitionTrainingCollection;

  constructor(repetitionTraining: RepetitionTrainingCollection = {}) {
    this.repetitionTraining = repetitionTraining;
  }

  addMove(fen: string, san: string): void {
    const fenEntry = this.repetitionTraining[fen];
    if (fenEntry) {
      const sanEntry = fenEntry[san];
      if (!sanEntry) {
        fenEntry[san] = new RepetitionTraining();
      }
    } else {
      this.repetitionTraining[fen] = { [san]: new RepetitionTraining() };
    }
  }

  deleteMove(fen: string, san: string): void {
    delete this.repetitionTraining[fen][san];

    if (_.isEmpty(this.repetitionTraining[fen])) {
      this.deletePosition(fen);
    }
  }

  deletePosition(fen: string) {
    delete this.repetitionTraining[fen];
  }

  asSaved(): SavedTrainingCollection {
    const saved: SavedTrainingCollection = {};

    _.forEach(this.trackedFen(), fen =>
      _.forEach(this.trackedSan(fen), san => {
        if (!saved[fen]) {
          saved[fen] = {};
        }

        saved[fen][san] = this.repetitionTraining[fen][san].asSaved();
      })
    );

    return saved;
  }

  static fromSaved(saved: SavedTrainingCollection): TrainingCollection {
    const restored: RepetitionTrainingCollection = {};

    _.forEach(_.keys(saved), fen =>
      _.forEach(_.keys(saved[fen]), san => {
        if (!restored[fen]) {
          restored[fen] = {};
        }

        restored[fen][san] = RepetitionTraining.fromSaved(saved[fen][san]);
      })
    );

    return new TrainingCollection(restored);
  }

  private trackedFen(): string[] {
    return _.keys(this.repetitionTraining);
  }

  private trackedSan(fen: string): string[] {
    return _.keys(this.repetitionTraining[fen]);
  }
}
