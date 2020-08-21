import _ from "lodash";

import {
  RepertoirePosition,
  millisecondsPerDay
} from "@/store/repertoirePosition";
import { Side } from "@/store/side";
import { Turn } from "@/store/turn";
import { FEN } from "chessground/types";
import {
  ResetTestRepertoire,
  LinkTestPositions,
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

    it("should not be include in scheduled mode when there is no training history", () => {
      const position = new RepertoirePosition("", "", Side.White);

      const include = position.IncludeForTrainingMode(TrainingMode.Scheduled);

      expect(include).toBeFalsy();
    });

    it("should not be include in scheduled mode when scheduled for more than a day away", () => {
      const position = new RepertoirePosition("", "", Side.White);
      position.AddTrainingEvent(new TrainingEvent(1, 0));
      position.nextRepititionTimestamp = _.now() + 2 * millisecondsPerDay;

      const include = position.IncludeForTrainingMode(TrainingMode.Scheduled);

      expect(include).toBeFalsy();
    });

    it("should be included in scheduled mode when scheduled for today", () => {
      const position = new RepertoirePosition("", "", Side.White);
      position.AddTrainingEvent(new TrainingEvent(1, 0));
      position.nextRepititionTimestamp = _.now();

      const include = position.IncludeForTrainingMode(TrainingMode.Scheduled);

      expect(include).toBeTruthy();
    });

    it("should not be include in scheduled mode when scheduled in the past", () => {
      const position = new RepertoirePosition("", "", Side.White);
      position.AddTrainingEvent(new TrainingEvent(1, 0));
      position.nextRepititionTimestamp = _.now() - millisecondsPerDay;

      const include = position.IncludeForTrainingMode(TrainingMode.Scheduled);

      expect(include).toBeTruthy();
    });

    it("should not be include in mistakes mode when there is no training history", () => {
      const position = new RepertoirePosition("", "", Side.White);

      const include = position.IncludeForTrainingMode(TrainingMode.Mistakes);

      expect(include).toBeFalsy();
    });

    it("should be included in mistakes mode when there is a recent mistake", () => {
      const position = new RepertoirePosition("", "", Side.White);
      position.AddTrainingEvent(new TrainingEvent(1, 0));
      position.AddTrainingEvent(new TrainingEvent(3, 0));
      position.AddTrainingEvent(new TrainingEvent(1, 0));

      const include = position.IncludeForTrainingMode(TrainingMode.Mistakes);

      expect(include).toBeTruthy();
    });

    it("should not be included in mistakes mode when there are no recent mistakes", () => {
      const position = new RepertoirePosition("", "", Side.White);
      position.AddTrainingEvent(new TrainingEvent(2, 0));
      position.AddTrainingEvent(new TrainingEvent(1, 0));
      position.AddTrainingEvent(new TrainingEvent(1, 0));
      position.AddTrainingEvent(new TrainingEvent(1, 0));
      position.AddTrainingEvent(new TrainingEvent(1, 0));
      position.AddTrainingEvent(new TrainingEvent(1, 0));

      const include = position.IncludeForTrainingMode(TrainingMode.Mistakes);

      expect(include).toBeFalsy();
    });
  });

  describe("AddTrainingEvent", () => {
    it("should add events to the training history", () => {
      const position = new RepertoirePosition("", "", Side.White);
      const events = [
        new TrainingEvent(0, 1),
        new TrainingEvent(1, 2),
        new TrainingEvent(2, 3)
      ];

      _.forEach(events, event => position.AddTrainingEvent(event));

      expect(position.trainingHistory).toEqual(events);
    });

    it("should schedule 1 day later for the first repitition", () => {
      const position = new RepertoirePosition("", "", Side.White);

      const nowBefore = _.now();
      position.AddTrainingEvent(new TrainingEvent(1, 0));
      const nowAfter = _.now();

      expect(position.nextRepititionTimestamp).toBeGreaterThanOrEqual(
        nowBefore + millisecondsPerDay
      );
      expect(position.nextRepititionTimestamp).toBeLessThanOrEqual(
        nowAfter + millisecondsPerDay
      );
    });

    it("should schedule 4 days later for the second repitition", () => {
      const position = new RepertoirePosition("", "", Side.White);
      position.AddTrainingEvent(new TrainingEvent(1, 0));

      const nowBefore = _.now();
      position.AddTrainingEvent(new TrainingEvent(1, 0));
      const nowAfter = _.now();

      expect(position.nextRepititionTimestamp).toBeGreaterThanOrEqual(
        nowBefore + 4 * millisecondsPerDay
      );
      expect(position.nextRepititionTimestamp).toBeLessThanOrEqual(
        nowAfter + 4 * millisecondsPerDay
      );
    });

    it("should reset the repitition index after a bad grade", () => {
      const position = new RepertoirePosition("", "", Side.White);
      position.AddTrainingEvent(new TrainingEvent(1, 0));
      position.AddTrainingEvent(new TrainingEvent(1, 0));
      position.AddTrainingEvent(new TrainingEvent(1, 0));

      const nowBefore = _.now();
      position.AddTrainingEvent(new TrainingEvent(2, 0)); // grade 3
      const nowAfter = _.now();

      expect(position.nextRepititionTimestamp).toBeGreaterThanOrEqual(
        nowBefore + millisecondsPerDay
      );
      expect(position.nextRepititionTimestamp).toBeLessThanOrEqual(
        nowAfter + millisecondsPerDay
      );
    });

    it("should set the interval by easiness after the second repitition", () => {
      const position = new RepertoirePosition("", "", Side.White);
      position.AddTrainingEvent(new TrainingEvent(1, 0));
      position.AddTrainingEvent(new TrainingEvent(1, 0));
      position.AddTrainingEvent(new TrainingEvent(1, 0));
      const expectedIntervalDays = 32;

      const nowBefore = _.now();
      position.AddTrainingEvent(new TrainingEvent(1, 0));
      const nowAfter = _.now();

      expect(position.nextRepititionTimestamp).toBeGreaterThanOrEqual(
        nowBefore + expectedIntervalDays * millisecondsPerDay
      );
      expect(position.nextRepititionTimestamp).toBeLessThanOrEqual(
        nowAfter + expectedIntervalDays * millisecondsPerDay
      );
    });

    it("should set a low easiness for an often missed position", () => {
      const position = new RepertoirePosition("", "", Side.White);

      position.AddTrainingEvent(new TrainingEvent(3, 0));
      position.AddTrainingEvent(new TrainingEvent(3, 0));
      position.AddTrainingEvent(new TrainingEvent(3, 0));

      expect(position.easinessFactor).toBe(1.8999999999999997);
    });

    it("should set not reduce the easiness below 1", () => {
      const position = new RepertoirePosition("", "", Side.White);

      _.forEach(_.range(10), _index => {
        position.AddTrainingEvent(new TrainingEvent(3, 0)); // Grade 0
      });

      expect(position.easinessFactor).toBe(1);
    });
  });
});
