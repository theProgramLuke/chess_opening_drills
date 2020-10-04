import {
  Training,
  TrainingHistoryEntry
} from "@/store/repertoire/DurationSuperMemo2";
import { TrainingGrade } from "@/store/repertoire/SuperMemo2";

describe("Training", () => {
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
      "should assign a grade of %s for the duration %s with %s attempt(s)",
      (expectedGrade, elapsedMilliseconds, attempts) => {
        const training = new Training();

        training.addTrainingEvent(attempts, elapsedMilliseconds);
        const actual = training.history[0].grade;

        expect(actual).toEqual(expectedGrade);
      }
    );
  });

  describe("historyWithDurations", () => {
    it("should be the training history with durations", () => {
      const elapsed = 1000;
      const expected: TrainingHistoryEntry[] = [
        {
          elapsedMilliseconds: elapsed,
          easiness: expect.anything(),
          grade: expect.anything(),
          timestamp: expect.anything()
        }
      ];
      const training = new Training();

      training.addTrainingEvent(1, elapsed);
      const actual = training.history;

      expect(actual).toEqual(expected);
    });
  });
});