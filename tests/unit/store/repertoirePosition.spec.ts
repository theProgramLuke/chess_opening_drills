import _ from "lodash";

import { RepertoirePosition } from "@/store/repertoirePosition";
import { Side } from "@/store/side";
import { Turn } from "@/store/turn";
import { FEN } from "chessground/types";
import {
  ResetTestRepertoire,
  LinkTestPositions,
  repertoire,
  e3,
  start,
  e3e6e4e5,
  e3e6,
  e3e6e4,
  e3e6d3,
  d3,
  d3e6,
  d3e6e3
} from "./testDataRepertoire";
import { TrainingMode } from "@/store/trainingMode";
import { TrainingEvent } from "@/store/TrainingEvent";

beforeEach(ResetTestRepertoire);

describe("RepertoirePosition", () => {
  describe("SideToMove", () => {
    it.each([
      ["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", Side.White],
      ["rnbqkbnr/pppppppp/8/8/8/4P3/PPPP1PPP/RNBQKBNR b KQkq - 0 1", Side.Black]
    ])("for FEN %s return %s", (fen: FEN, expected: Side) => {
      const side = new RepertoirePosition(fen, "", Side.White).SideToMove();

      expect(side).toBe(expected);
    });
  });

  describe("AddChild", () => {
    it("adds child and parent links", () => {
      start.AddChild(e3);

      expect(start.children).toEqual([e3]);
      expect(e3.position.parents).toContain(start);
    });

    it("does not add a child link given the same position", () => {
      const e3Clone = _.cloneDeep(e3);

      e3.position.AddChild(e3Clone);

      expect(e3.position.children).toHaveLength(0);
    });

    it("does not add a child link given an existing child", () => {
      const e3Clone = _.cloneDeep(e3);

      start.AddChild(e3);
      start.AddChild(e3Clone);

      expect(start.children).toEqual([e3]);
    });
  });

  describe("GetTurnLists", () => {
    beforeEach(LinkTestPositions);

    it("returns an empty array given a position with no parents", () => {
      const paths = start.GetTurnLists();

      expect(paths).toHaveLength(0);
    });

    it("returns a single turn list when there are no tranposition", () => {
      const paths = e3e6e4e5.position.GetTurnLists();

      expect(paths).toEqual([[new Turn(e3, e3e6), new Turn(e3e6e4, e3e6e4e5)]]);
    });

    it("returns multiple turn lists when there are tranpositions", () => {
      const paths = e3e6d3.position.GetTurnLists();

      expect(paths).toEqual([
        [new Turn(e3, e3e6), new Turn(e3e6d3)],
        [new Turn(d3, d3e6), new Turn(d3e6e3)]
      ]);
    });
  });

  describe("AsPgnMoveText", () => {
    beforeEach(LinkTestPositions);

    it("generates the pgn of position", () => {
      const pgnMoveText = start.AsPgnMoveText();
      const expectedPgnMoveText =
        "1. e3 ( 1. d3 e6 2. e3 ) e6 2. d3 ( 2. e4 e5 )";

      expect(pgnMoveText).toEqual(expectedPgnMoveText);
    });
  });

  describe("IncludeForTrainingMode", () => {
    it("should be included as new when there is no training history", () => {
      const position = new RepertoirePosition("", "", Side.White);

      const include = position.IncludeForTrainingMode(TrainingMode.New);

      expect(include).toBeTruthy();
    });

    it("should not be include in mistakes mode when there is no training history", () => {
      const position = new RepertoirePosition("", "", Side.White);

      const include = position.IncludeForTrainingMode(TrainingMode.Mistakes);

      expect(include).toBeFalsy();
    });

    it("should be included in mistakes mode when there is a recent mistake", () => {
      const position = new RepertoirePosition("", "", Side.White);
      position.AddTrainingEvent(new TrainingEvent(true, 0));
      position.AddTrainingEvent(new TrainingEvent(false, 0));
      position.AddTrainingEvent(new TrainingEvent(true, 0));

      const include = position.IncludeForTrainingMode(TrainingMode.Mistakes);

      expect(include).toBeTruthy();
    });

    it("should not be included in mistakes mode when there are no recent mistakes", () => {
      const position = new RepertoirePosition("", "", Side.White);
      position.AddTrainingEvent(new TrainingEvent(false, 0));
      position.AddTrainingEvent(new TrainingEvent(true, 0));
      position.AddTrainingEvent(new TrainingEvent(true, 0));
      position.AddTrainingEvent(new TrainingEvent(true, 0));
      position.AddTrainingEvent(new TrainingEvent(true, 0));
      position.AddTrainingEvent(new TrainingEvent(true, 0));

      const include = position.IncludeForTrainingMode(TrainingMode.Mistakes);

      expect(include).toBeFalsy();
    });
  });
});
