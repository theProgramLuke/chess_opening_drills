import _, { isEmpty } from "lodash";

import {
  GetTrainingPositions,
  GetTrainingMoveLists,
  RepertoireTag
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
import { Side } from "@/store/side";

beforeEach(() => {
  ResetTestRepertoire();
  LinkTestPositions();
});

describe("RepertoireTag", () => {
  describe("AddChild", () => {
    it("should add the tag as a child", () => {
      const tag = new RepertoireTag(Side.White, "", start, start.fen, []);
      const childTag = new RepertoireTag(
        Side.White,
        "",
        e3.position,
        e3.position.fen,
        []
      );

      tag.AddChild(childTag);

      expect(tag.children).toEqual([childTag]);
    });
  });

  describe("GetTrainingPositions", () => {
    it("should get no moves when no training modes are specified", () => {
      const trainingPositions = GetTrainingPositions([], [White, Black]);

      expect(_.isEmpty(trainingPositions)).toBeTruthy();
    });

    it("should get no moves when no tags are specified", () => {
      const trainingPositions = GetTrainingPositions(
        [TrainingMode.New, TrainingMode.Scheduled, TrainingMode.Difficult],
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
        [TrainingMode.New, TrainingMode.Scheduled, TrainingMode.Difficult],
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

    it("should get only the matching positions when not generating the entire move list", () => {
      const trainingMoveLists = GetTrainingMoveLists(
        [TrainingMode.New],
        [White],
        0,
        false
      );

      expect(trainingMoveLists).toEqual([[e3], [e3e6, e3e6d3], [d3e6, d3e6e3]]);
    });
  });
});
