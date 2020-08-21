import _, { isEmpty } from "lodash";

import {
  GetTrainingPositions,
  GetTrainingMoveLists,
  IsPrefix,
  RemovePrefixes
} from "@/store/repertoireTag";
import {
  ResetTestRepertoire,
  LinkTestPositions,
  White,
  Black,
  start,
  e3e6,
  d3e6,
  e3,
  e3e6d3,
  d3,
  d3e6e3
} from "./testDataRepertoire";
import { TrainingMode } from "@/store/trainingMode";

beforeEach(() => {
  ResetTestRepertoire();
  LinkTestPositions();
});

describe("RepertoireTag", () => {
  describe("GetTrainingPositions", () => {
    it("should get no moves when no training modes are specified", () => {
      const trainingPositions = GetTrainingPositions([], [White, Black]);

      expect(_.isEmpty(trainingPositions)).toBeTruthy();
    });

    it("should get no moves when no tags are specified", () => {
      const trainingPositions = GetTrainingPositions(
        [TrainingMode.New, TrainingMode.Scheduled, TrainingMode.Mistakes],
        []
      );

      expect(isEmpty(trainingPositions)).toBeTruthy();
    });

    it("should get the matching positions for my turn", () => {
      const trainingPositions = GetTrainingPositions(
        [TrainingMode.New],
        [White]
      );

      expect(trainingPositions).toEqual([start, e3e6.position, d3e6.position]);
    });
  });

  describe("GetTrainingMoveLists", () => {
    it("should get no move lists when no tags are specified", () => {
      const trainingMoveLists = GetTrainingMoveLists(
        [TrainingMode.New, TrainingMode.Scheduled, TrainingMode.Mistakes],
        []
      );

      expect(isEmpty(trainingMoveLists)).toBeTruthy();
    });

    it("should get the full move lists matching the mode", () => {
      const trainingMoveLists = GetTrainingMoveLists(
        [TrainingMode.New],
        [White]
      );

      expect(trainingMoveLists).toEqual([
        [e3, e3e6, e3e6d3],
        [d3, d3e6, d3e6e3]
      ]);
    });
  });
});
