import _ from "lodash";
import now from "lodash/now";

import {
  SuperMemo2,
  TrainingGrade,
  MillisecondsPerDay,
  HistoryEntry
} from "@/store/repertoire/SuperMemo2";

jest.mock("lodash/now");

const nowTimestamp = 24601;

beforeEach(() => {
  (now as jest.Mock).mockReset();
  (now as jest.Mock).mockReturnValue(nowTimestamp);
});

// https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
describe("SuperMemo2", () => {
  describe("constructor", () => {
    it("should start the easiness at 2.5", () => {
      const sm2 = new SuperMemo2();
      const expected = 2.5;

      const actual = sm2.easiness;

      expect(actual).toEqual(expected);
    });
  });
  describe("addTrainingEvent", () => {
    it.each([
      [2.1, 5 as TrainingGrade, 2.0],
      [2.0, 4 as TrainingGrade, 2.0],
      [1.3, 4 as TrainingGrade, 1.3],
      [1.86, 3 as TrainingGrade, 2.0],
      [1.68, 2 as TrainingGrade, 2.0],
      [1.46, 1 as TrainingGrade, 2.0],
      [1.6, 0 as TrainingGrade, 2.4]
    ])(
      "should set the easiness as %s given a grade of %s and a previous easiness of %s",
      (expectedEasiness, grade, previousEasiness) => {
        const sm2 = new SuperMemo2(previousEasiness);

        sm2.addTrainingEvent(grade);
        const easiness = sm2.easiness;

        expect(easiness).toEqual(expectedEasiness);
      }
    );

    it("should not reduce the easiness below 1.3", () => {
      const sm2 = new SuperMemo2(1.3);

      sm2.addTrainingEvent(0);
      const easiness = sm2.easiness;

      expect(easiness).toEqual(1.3);
    });

    it("should schedule an interval of 1 day for the first interval", () => {
      const sm2 = new SuperMemo2(
        2.5,
        0 // has no repetitions
      );
      const expected = 1 * MillisecondsPerDay + nowTimestamp;

      sm2.addTrainingEvent(5);
      const actual = sm2.scheduledRepetitionTimestamp;

      expect(actual).toEqual(expected);
    });

    // SM-2 wants 6 days for the second interval, but that is really long.
    it("should schedule an interval of 4 days for the second interval", () => {
      const sm2 = new SuperMemo2(
        2.5,
        1 // already trained once
      );
      const expected = 4 * MillisecondsPerDay + nowTimestamp;

      sm2.addTrainingEvent(5);
      const actual = sm2.scheduledRepetitionTimestamp;

      expect(actual).toEqual(expected);
    });

    it.each([
      [25, 5 as TrainingGrade, 2.4, 10],
      [25, 5 as TrainingGrade, 2.3001, 10],
      [24, 5 as TrainingGrade, 2.3, 10],
      [12, 4 as TrainingGrade, 1.5, 8]
    ])(
      "should schedule an interval of %s days given a grade of %s, a previous easiness of %s, and a previous interval of %s days, after more than 2 repetitions",
      (expectedDays, grade, previousEasiness, previousIntervalDays) => {
        const sm2 = new SuperMemo2(previousEasiness, 2, previousIntervalDays);
        const expected = expectedDays * MillisecondsPerDay + nowTimestamp;

        sm2.addTrainingEvent(grade);
        const actual = sm2.scheduledRepetitionTimestamp;

        expect(actual).toEqual(expected);
      }
    );

    it.each([[0 as TrainingGrade], [1 as TrainingGrade], [2 as TrainingGrade]])(
      "should schedule the initial intervals (1, 4) after an incorrect response grade %s",
      grade => {
        const sm2 = new SuperMemo2(
          2.5,
          10, // Already trained more than 2 times successfully
          10
        );
        const expected: number[] = [
          1 * MillisecondsPerDay + nowTimestamp,
          4 * MillisecondsPerDay + nowTimestamp
        ];

        const actual: (number | undefined)[] = [];
        sm2.addTrainingEvent(grade);
        actual.push(sm2.scheduledRepetitionTimestamp);
        sm2.addTrainingEvent(5);
        actual.push(sm2.scheduledRepetitionTimestamp);

        expect(actual).toEqual(expected);
      }
    );

    it("should schedule an interval based on the previous interval for multiple repetitions, after the second repetition", () => {
      const previousIntervalDays = 5;
      const easiness = 2;
      const sm2 = new SuperMemo2(easiness, 2, previousIntervalDays);
      const expectedDays = [easiness * previousIntervalDays];
      expectedDays.push(easiness * expectedDays[0]);
      const expected = _.map(
        expectedDays,
        days => days * MillisecondsPerDay + nowTimestamp
      );

      const actual: (number | undefined)[] = [];
      sm2.addTrainingEvent(4); // Train with grade = 4 for this test so the easiness doesn't change.
      actual.push(sm2.scheduledRepetitionTimestamp);
      sm2.addTrainingEvent(4); // Train with grade = 4 for this test so the easiness doesn't change.
      actual.push(sm2.scheduledRepetitionTimestamp);

      expect(actual).toEqual(expected);
    });

    it("should get the expected intervals for a example repetition events", () => {
      const sm2 = new SuperMemo2();
      const grades: TrainingGrade[] = [4, 2, 4, 5, 4, 0, 3, 4, 5, 5];
      const expectedEasiness = [
        2.5,
        2.1799999999999997,
        2.1799999999999997,
        2.28,
        2.28,
        1.48,
        1.34,
        1.34,
        1.4400000000000002,
        1.5400000000000003
      ];
      const expectedIntervalDays = [1, 1, 4, 10, 23, 1, 4, 6, 9, 14];
      const expectedSchedule = _.map(
        expectedIntervalDays,
        days => days * MillisecondsPerDay + nowTimestamp
      );
      expect(expectedEasiness.length).toEqual(grades.length);
      expect(expectedSchedule.length).toEqual(grades.length);

      const actualEasiness: number[] = [];
      const actualSchedule: (number | undefined)[] = [];
      _.forEach(grades, grade => {
        sm2.addTrainingEvent(grade);
        actualEasiness.push(sm2.easiness);
        actualSchedule.push(sm2.scheduledRepetitionTimestamp);
      });

      expect(actualEasiness).toEqual(expectedEasiness);
      expect(actualSchedule).toEqual(expectedSchedule);
    });
  });

  describe("history", () => {
    it("should keep a timestamped history of the easiness", () => {
      const sm2 = new SuperMemo2();
      const grades: TrainingGrade[] = [0, 1, 2, 3, 4, 5];
      const expected: HistoryEntry[] = [
        {
          easiness: 1.7000000000000002,
          timestamp: nowTimestamp,
          grade: grades[0]
        },
        { easiness: 1.3, timestamp: nowTimestamp, grade: grades[1] },
        { easiness: 1.3, timestamp: nowTimestamp, grade: grades[2] },
        { easiness: 1.3, timestamp: nowTimestamp, grade: grades[3] },
        { easiness: 1.3, timestamp: nowTimestamp, grade: grades[4] },
        {
          easiness: 1.4000000000000001,
          timestamp: nowTimestamp,
          grade: grades[5]
        }
      ];
      expect(expected.length).toEqual(grades.length);

      _.forEach(grades, grade => sm2.addTrainingEvent(grade));
      const actual = sm2.history;

      expect(actual).toEqual(expected);
    });
  });
});
