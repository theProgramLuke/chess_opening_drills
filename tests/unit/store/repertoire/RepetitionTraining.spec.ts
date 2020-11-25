import _ from "lodash";
import now from "lodash/now";

import {
  RepetitionTraining,
  TrainingHistoryEntry,
  SavedRepetitionTraining,
  TrainingEvent,
} from "@/store/repertoire/RepetitionTraining";
import {
  TrainingGrade,
  MillisecondsPerDay,
} from "@/store/repertoire/SuperMemo2";
import { TrainingMode } from "@/store/trainingMode";
import { DateTime, DateObject } from "luxon";

jest.mock("lodash/now");

const nowTimestamp = 24601;

beforeEach(() => {
  (now as jest.Mock).mockReset();
  (now as jest.Mock).mockReturnValue(nowTimestamp);
});

describe("RepetitionTraining", () => {
  describe("addTrainingEvent", () => {
    it.each([
      [5 as TrainingGrade, 0, 1],
      [5 as TrainingGrade, 1999, 1],
      [4 as TrainingGrade, 2000, 1],
      [4 as TrainingGrade, 9999, 1],
      [3 as TrainingGrade, 10000, 1],
      [3 as TrainingGrade, Infinity, 1],
      [2 as TrainingGrade, 0, 2],
      [2 as TrainingGrade, 9999, 2],
      [1 as TrainingGrade, 10000, 2],
      [1 as TrainingGrade, Infinity, 2],
      [0 as TrainingGrade, 0, 3],
      [0 as TrainingGrade, Infinity, 3],
      [0 as TrainingGrade, 0, 4],
      [0 as TrainingGrade, Infinity, 4],
      [0 as TrainingGrade, 0, Infinity],
      [0 as TrainingGrade, Infinity, Infinity],
    ])(
      "should assign a grade of %s for the duration %s with %s attempted move(s)",
      (expectedGrade, elapsedMilliseconds, attemptsCount) => {
        const training = new RepetitionTraining();
        const attemptedMoves = _.times(attemptsCount, () => "");

        training.addTrainingEvent({
          attemptedMoves,
          elapsedMilliseconds,
        });
        const actual = training.history[0].grade;

        expect(actual).toEqual(expectedGrade);
      }
    );
  });

  describe("history", () => {
    it("should be the super memo2 history and the training event data", () => {
      const elapsedMilliseconds = 1000;
      const attemptedMoves: string[] = ["e4", "d4"];
      const expected: TrainingHistoryEntry[] = [
        {
          elapsedMilliseconds,
          attemptedMoves,
          easiness: expect.anything(),
          grade: expect.anything(),
          timestamp: expect.anything(),
        },
      ];
      const training = new RepetitionTraining();

      training.addTrainingEvent({
        attemptedMoves,
        elapsedMilliseconds,
      });
      const actual = training.history;

      expect(actual).toEqual(expected);
    });
  });

  describe("asSaved", () => {
    const events: TrainingEvent[] = [
      { elapsedMilliseconds: 10000, attemptedMoves: [""] },
      { elapsedMilliseconds: 3000, attemptedMoves: [""] },
      { elapsedMilliseconds: 0, attemptedMoves: [""] },
    ];
    const saved: SavedRepetitionTraining = {
      easiness: 2.46,
      history: [
        {
          easiness: 2.36,
          grade: 3,
          timestamp: MillisecondsPerDay,
          ...events[0],
        },
        {
          easiness: 2.36,
          grade: 4,
          timestamp: 10 * MillisecondsPerDay,
          ...events[1],
        },
        {
          easiness: 2.46,
          grade: 5,
          timestamp: 20 * MillisecondsPerDay,
          ...events[2],
        },
      ],
      scheduledRepetitionTimestamp: 30 * MillisecondsPerDay,
      previousIntervalDays: 10,
      effectiveTrainingIndex: events.length,
    };

    it("should save the state of the training", () => {
      const training = new RepetitionTraining();
      _.forEach(saved.history, historyEntry => {
        (now as jest.Mock).mockReturnValue(historyEntry.timestamp);
        training.addTrainingEvent(historyEntry);
      });

      const actual = training.asSaved();

      expect(actual).toEqual(saved);
    });

    it("should restore the training state", () => {
      const training = RepetitionTraining.fromSaved(saved);

      const actual = training.asSaved();

      expect(actual).toEqual(saved);
    });
  });

  describe("scheduledRepetitionTimestamp", () => {
    it("should be the timestamp of the training", () => {
      const expected = 24601;
      const training = new RepetitionTraining(0, 0, 0, [], expected);

      const actual = training.scheduledRepetitionTimestamp;

      expect(actual).toEqual(expected);
    });
  });

  describe("includeForTrainingMode", () => {
    describe("TrainingMode.New", () => {
      it("should be included if the position has not been trained", () => {
        const training = new RepetitionTraining();

        const actual = training.includeForTrainingMode(TrainingMode.New);

        expect(actual).toBeTruthy();
      });

      it("should not be included if the position has been trained", () => {
        const training = new RepetitionTraining();
        training.addTrainingEvent({
          elapsedMilliseconds: 0,
          attemptedMoves: [""],
        });

        const actual = training.includeForTrainingMode(TrainingMode.New);

        expect(actual).toBeFalsy();
      });
    });

    describe("TrainingMode.Cram", () => {
      it("should be included if the position has not been trained", () => {
        const training = new RepetitionTraining();

        const actual = training.includeForTrainingMode(TrainingMode.Cram);

        expect(actual).toBeTruthy();
      });

      it("should be included if the position has been trained", () => {
        const training = new RepetitionTraining();
        training.addTrainingEvent({
          elapsedMilliseconds: 0,
          attemptedMoves: [""],
        });

        const actual = training.includeForTrainingMode(TrainingMode.Cram);

        expect(actual).toBeTruthy();
      });
    });

    describe("TrainingMode.Scheduled", () => {
      it("should be included if the scheduled timestamp is before today", () => {
        const training = new RepetitionTraining(
          0,
          0,
          0,
          [],
          1 * MillisecondsPerDay
        );
        (now as jest.Mock).mockReturnValue(10 * MillisecondsPerDay);

        const actual = training.includeForTrainingMode(TrainingMode.Scheduled);

        expect(actual).toBeTruthy();
      });

      it("should be included if the scheduled timestamp is later in the same day as now", () => {
        const common: DateObject = { year: 2020, month: 9, day: 20 };
        const startOfDay = DateTime.fromObject(
          _.merge(common, { hour: 0, second: 1 })
        ).toMillis();
        const endOfDay = DateTime.fromObject(
          _.merge(common, { hour: 23 })
        ).toMillis();
        const training = new RepetitionTraining(0, 0, 0, [], endOfDay);
        (now as jest.Mock).mockReturnValue(startOfDay);

        const actual = training.includeForTrainingMode(TrainingMode.Scheduled);

        expect(actual).toBeTruthy();
      });

      it("should be not included if the scheduled timestamp is later than today", () => {
        const training = new RepetitionTraining(
          0,
          0,
          0,
          [],
          10 * MillisecondsPerDay
        );
        (now as jest.Mock).mockReturnValue(0);

        const actual = training.includeForTrainingMode(TrainingMode.Scheduled);

        expect(actual).toBeFalsy();
      });

      it("should be not included if the scheduled timestamp is not defined", () => {
        const training = new RepetitionTraining();

        const actual = training.includeForTrainingMode(TrainingMode.Scheduled);

        expect(actual).toBeFalsy();
      });
    });

    describe("TrainingMode.Difficult", () => {
      it("should not include new positions", () => {
        const training = new RepetitionTraining();

        const actual = training.includeForTrainingMode(
          TrainingMode.Difficult,
          2.6
        );

        expect(actual).toBeFalsy();
      });

      it("should be included if the easiness is less than difficulty limit", () => {
        const training = new RepetitionTraining();
        training.addTrainingEvent({
          elapsedMilliseconds: 0,
          attemptedMoves: [""],
        });
        expect(training.easiness).toEqual(2.6);

        const actual = training.includeForTrainingMode(
          TrainingMode.Difficult,
          2.7
        );

        expect(actual).toBeTruthy();
      });

      it("should be included if the easiness is the difficulty limit", () => {
        const training = new RepetitionTraining();
        training.addTrainingEvent({
          elapsedMilliseconds: 0,
          attemptedMoves: [""],
        });
        expect(training.easiness).toEqual(2.6);

        const actual = training.includeForTrainingMode(
          TrainingMode.Difficult,
          2.6
        );

        expect(actual).toBeTruthy();
      });

      it("should be included if the easiness more than the difficulty limit", () => {
        const training = new RepetitionTraining();
        training.addTrainingEvent({
          elapsedMilliseconds: 0,
          attemptedMoves: [""],
        });
        expect(training.easiness).toEqual(2.6);

        const actual = training.includeForTrainingMode(
          TrainingMode.Difficult,
          2.5
        );

        expect(actual).toBeFalsy();
      });
    });
  });
});
