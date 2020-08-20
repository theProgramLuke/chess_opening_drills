import _, { isEmpty } from "lodash";

import { RepertoireTag, GetTrainingPositions } from "@/store/repertoireTag";
import {
  ResetTestRepertoire,
  LinkTestPositions,
  White,
  Black,
  start,
  repertoire,
  e3e6,
  d3e6,
  e3
} from "./testDataRepertoire";
import { TrainingMode } from "@/store/trainingMode";
import { Side } from "@/store/side";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Move } from "@/store/move";

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

    it("should get the matching positions for the my turn", () => {
      const trainingPositions = GetTrainingPositions(
        [TrainingMode.New],
        [White]
      );

      expect(trainingPositions).toEqual([start, e3e6.position, d3e6.position]);
    });
  });
});
