import _ from "lodash";
import { EOL } from "os";

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

    it("returns a half move when white had the last move", () => {
      const paths = e3e6e4.position.GetTurnLists();

      expect(paths).toEqual([[new Turn(e3, e3e6), new Turn(e3e6e4)]]);
    });

    it("returns multiple turn lists when there are tranpositions", () => {
      const paths = e3e6d3.position.GetTurnLists();

      expect(paths).toEqual([
        [new Turn(e3, e3e6), new Turn(e3e6d3)],
        [new Turn(d3, d3e6), new Turn(d3e6e3)]
      ]);
    });
  });

  describe("AsPgn", () => {
    beforeEach(LinkTestPositions);

    it("generates the pgn from a position", () => {
      const expected = `[Event "N/A"]${EOL}[Site "N/A"]${EOL}[Date 2020.7.25"${EOL}[Round "N/A]"${EOL}[White "N/A"]${EOL}[Black "N/A"]${EOL}[Result "*"]${EOL}[SetUp "1"]${EOL}[SetUp "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"]${EOL}${EOL}1. e3 ( 1. d3 e6 2. e3 ) e6 2. d3 ( 2. e4 e5 )`;

      const pgn = start.AsPgn();

      expect(pgn).toEqual(expected);
    });
  });

  describe("AsPgnMoveText", () => {
    beforeEach(LinkTestPositions);

    it("generates the pgn moves of position", () => {
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
      position.nextRepetitionTimestamp = _.now() + 2 * millisecondsPerDay;

      const include = position.IncludeForTrainingMode(TrainingMode.Scheduled);

      expect(include).toBeFalsy();
    });

    it("should be included in scheduled mode when scheduled for today", () => {
      const position = new RepertoirePosition("", "", Side.White);
      position.AddTrainingEvent(new TrainingEvent(1, 0));
      position.nextRepetitionTimestamp = _.now();

      const include = position.IncludeForTrainingMode(TrainingMode.Scheduled);

      expect(include).toBeTruthy();
    });

    it("should not be included in scheduled mode when scheduled in the past", () => {
      const position = new RepertoirePosition("", "", Side.White);
      position.AddTrainingEvent(new TrainingEvent(1, 0));
      position.nextRepetitionTimestamp = _.now() - millisecondsPerDay;

      const include = position.IncludeForTrainingMode(TrainingMode.Scheduled);

      expect(include).toBeTruthy();
    });

    it("should not be included in difficult mode when the limit is lower than the easiness", () => {
      const limit = 1.5;
      const position = new RepertoirePosition("", "", Side.White);
      position.easinessFactor = 3;

      const include = position.IncludeForTrainingMode(
        TrainingMode.Difficult,
        limit
      );

      expect(include).toBeFalsy();
    });

    it("should be included in difficult mode when the limit is higher than the easiness", () => {
      const limit = 3;
      const position = new RepertoirePosition("", "", Side.White);
      position.easinessFactor = 1.5;

      const include = position.IncludeForTrainingMode(
        TrainingMode.Difficult,
        limit
      );

      expect(include).toBeTruthy();
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

    it.each([
      [1, 0, 2.6],
      [1, 5, 2.54],
      [1, 10, 2.48],
      [2, 0, 2.42],
      [2, 10, 2.36],
      [3, 0, 2.3]
    ])(
      "adding an event with %s attempts and response time of %s to a new position should give an easiness factor of %s",
      (attempts, responseTimeSeconds, easiness) => {
        const position = new RepertoirePosition("", "", Side.White);

        position.AddTrainingEvent(
          new TrainingEvent(attempts, responseTimeSeconds)
        );

        expect(position.easinessFactor).toBe(easiness);
      }
    );

    it("should schedule 1 day later for the first repetition", () => {
      const position = new RepertoirePosition("", "", Side.White);

      const nowBefore = _.now();
      position.AddTrainingEvent(new TrainingEvent(1, 0));
      const nowAfter = _.now();

      expect(position.nextRepetitionTimestamp).toBeGreaterThanOrEqual(
        nowBefore + millisecondsPerDay
      );
      expect(position.nextRepetitionTimestamp).toBeLessThanOrEqual(
        nowAfter + millisecondsPerDay
      );
    });

    it("should schedule 4 days later for the second repetition", () => {
      const position = new RepertoirePosition("", "", Side.White);
      position.AddTrainingEvent(new TrainingEvent(1, 0));

      const nowBefore = _.now();
      position.AddTrainingEvent(new TrainingEvent(1, 0));
      const nowAfter = _.now();

      expect(position.nextRepetitionTimestamp).toBeGreaterThanOrEqual(
        nowBefore + 4 * millisecondsPerDay
      );
      expect(position.nextRepetitionTimestamp).toBeLessThanOrEqual(
        nowAfter + 4 * millisecondsPerDay
      );
    });

    it("should reset the repetition index after a bad grade", () => {
      const position = new RepertoirePosition("", "", Side.White);
      position.AddTrainingEvent(new TrainingEvent(1, 0));
      position.AddTrainingEvent(new TrainingEvent(1, 0));
      position.AddTrainingEvent(new TrainingEvent(1, 0));

      const nowBefore = _.now();
      position.AddTrainingEvent(new TrainingEvent(2, 0)); // grade 3
      const nowAfter = _.now();

      expect(position.nextRepetitionTimestamp).toBeGreaterThanOrEqual(
        nowBefore + millisecondsPerDay
      );
      expect(position.nextRepetitionTimestamp).toBeLessThanOrEqual(
        nowAfter + millisecondsPerDay
      );
    });

    it("should set the interval by easiness after the second repetition", () => {
      const position = new RepertoirePosition("", "", Side.White);
      position.AddTrainingEvent(new TrainingEvent(1, 0));
      position.AddTrainingEvent(new TrainingEvent(1, 0));
      position.AddTrainingEvent(new TrainingEvent(1, 0));
      const expectedIntervalDays = 32;

      const nowBefore = _.now();
      position.AddTrainingEvent(new TrainingEvent(1, 0));
      const nowAfter = _.now();

      expect(position.nextRepetitionTimestamp).toBeGreaterThanOrEqual(
        nowBefore + expectedIntervalDays * millisecondsPerDay
      );
      expect(position.nextRepetitionTimestamp).toBeLessThanOrEqual(
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
