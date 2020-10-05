import _ from "lodash";
import now from "lodash/now";

import {
  RepetitionTraining,
  TrainingHistoryEntry,
  SavedRepetitionTraining,
  TrainingEvent
} from "@/store/repertoire/RepetitionTraining";
import {
  TrainingGrade,
  MillisecondsPerDay
} from "@/store/repertoire/SuperMemo2";

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
      [0 as TrainingGrade, Infinity, Infinity]
    ])(
      "should assign a grade of %s for the duration %s with %s attempted move(s)",
      (expectedGrade, elapsedMilliseconds, attemptsCount) => {
        const training = new RepetitionTraining();
        const attemptedMoves = _.times(attemptsCount, () => "");

        training.addTrainingEvent({
          attemptedMoves,
          elapsedMilliseconds
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
          timestamp: expect.anything()
        }
      ];
      const training = new RepetitionTraining();

      training.addTrainingEvent({
        attemptedMoves,
        elapsedMilliseconds
      });
      const actual = training.history;

      expect(actual).toEqual(expected);
    });
  });

  describe("asSaved", () => {
    const events: TrainingEvent[] = [
      { elapsedMilliseconds: 10000, attemptedMoves: [""] },
      { elapsedMilliseconds: 3000, attemptedMoves: [""] },
      { elapsedMilliseconds: 0, attemptedMoves: [""] }
    ];
    const saved: SavedRepetitionTraining = {
      easiness: 2.46,
      history: [
        { easiness: 2.36, grade: 3, timestamp: nowTimestamp, ...events[0] },
        { easiness: 2.36, grade: 4, timestamp: nowTimestamp, ...events[1] },
        { easiness: 2.46, grade: 5, timestamp: nowTimestamp, ...events[2] }
      ],
      scheduledRepetitionTimestamp: 10 * MillisecondsPerDay + nowTimestamp,
      previousIntervalDays: 10,
      effectiveTrainingIndex: events.length
    };

    it("should capture the state of the training", () => {
      const training = new RepetitionTraining();
      _.forEach(events, event => training.addTrainingEvent(event));

      const actual = training.asSaved();

      expect(actual).toEqual(saved);
    });

    it("should restore the training state", () => {
      const training = RepetitionTraining.fromSaved(saved);

      const actual = training.asSaved();

      expect(actual).toEqual(saved);
    });
  });
});
