import _ from "lodash";

import {
  TrainingCollection,
  SavedTrainingCollection,
  TrainingMoveSpecification,
} from "@/store/repertoire/TrainingCollection";
import {
  RepetitionTraining,
  SavedRepetitionTraining,
} from "@/store/repertoire/RepetitionTraining";

jest.mock("@/store/repertoire/RepetitionTraining");

describe("TrainingCollection", () => {
  describe("addMove", () => {
    it("should track repetition training for fen/san pairs", () => {
      const training = new TrainingCollection();
      const fen0 = "some fen0";
      const san0 = "some san0";
      const fen1 = "some fen1";
      const san1 = "some san1";

      training.addMove(fen0, san0);
      training.addMove(fen1, san1);
      const actual = [
        training.getTrainingForMove(fen0, san0),
        training.getTrainingForMove(fen1, san1),
      ];

      expect(actual).toEqual([
        expect.any(RepetitionTraining),
        expect.any(RepetitionTraining),
      ]);
    });

    it("should not modify already existing repetition training for the fen/san pair", () => {
      const expected = new RepetitionTraining();
      const fen = "some fen";
      const san = "some san";
      const training = new TrainingCollection({ [fen]: { [san]: expected } });

      training.addMove(fen, san);
      const actual = training.getTrainingForMove(fen, san);

      expect(actual).toBe(expected);
    });

    it("should track allow more than one san for the same fen", () => {
      const training = new TrainingCollection();
      const fen = "some fen";
      const san0 = "some san0";
      const san1 = "some san1";

      training.addMove(fen, san0);
      training.addMove(fen, san1);
      const actual = [
        training.getTrainingForMove(fen, san0),
        training.getTrainingForMove(fen, san1),
      ];

      expect(actual).toEqual([
        expect.any(RepetitionTraining),
        expect.any(RepetitionTraining),
      ]);
    });
  });

  describe("deleteMove", () => {
    it("should remove the san entry for the deleted move", () => {
      const training = new TrainingCollection();
      const fen = "fen";
      const san = "san";
      training.addMove(fen, san);
      training.addMove(fen, "other");

      training.deleteMove(fen, san);

      expect(training.getTrainingForMove(fen, san)).toBeUndefined();
    });

    it("should remove the fen entry if there are no remaining moves", () => {
      const training = new TrainingCollection();
      const fen = "fen";
      const san = "san";
      training.addMove(fen, san);

      training.deleteMove(fen, san);
      const actual = training.asSaved();

      expect(actual).toEqual({});
    });

    it("should not remove the fen entry for other moves from the same fen", () => {
      const training = new TrainingCollection();
      const fen = "fen";
      const san = "san";
      const other = "other san";
      training.addMove(fen, san);
      training.addMove(fen, other);

      training.deleteMove(fen, san);

      expect(training.getTrainingForMove(fen, other)).toBeDefined();
    });

    it("should not throw an exception if the move does not exist", () => {
      const training = new TrainingCollection();

      training.deleteMove("fen", "san");
    });
  });

  describe("deletePosition", () => {
    it("should remove all training moves for the delete position", () => {
      const training = new TrainingCollection();
      const fen = "fen";
      const san0 = "san0";
      const san1 = "san1";
      training.addMove(fen, san0);
      training.addMove(fen, san1);

      training.deletePosition(fen);
      const actual = [
        training.getTrainingForMove(fen, san0),
        training.getTrainingForMove(fen, san1),
      ];

      expect(actual).toEqual([undefined, undefined]);
    });
  });

  describe("asSaved", () => {
    it("should capture the state of the training", () => {
      const training = new TrainingCollection();
      const fen = "some fen";
      const san = "some san";
      const savedTraining: SavedRepetitionTraining = {
        history: [],
        easiness: 0,
        effectiveTrainingIndex: 0,
      };
      const expected = {
        [fen]: {
          [san]: savedTraining,
        },
      };
      training.addMove(fen, san);
      ((training.getTrainingForMove(fen, san) || expect.anything())
        .asSaved as jest.Mock).mockReturnValue(savedTraining);

      const actual = training.asSaved();

      expect(actual).toEqual(expected);
    });

    it("should restore the training state", () => {
      const savedRepetitionTraining = {
        history: [],
        easiness: 0,
        effectiveTrainingIndex: 0,
      };
      const saved: SavedTrainingCollection = {
        "some fen": {
          "some san": savedRepetitionTraining,
        },
      };
      const mockedRepetitionTraining = new RepetitionTraining();
      (mockedRepetitionTraining.asSaved as jest.Mock).mockReturnValue(
        savedRepetitionTraining
      );
      (RepetitionTraining.fromSaved as jest.Mock).mockReturnValue(
        mockedRepetitionTraining
      );
      const training = TrainingCollection.fromSaved(saved);

      const actual = training.asSaved();

      expect(actual).toEqual(saved);
    });
  });

  describe("getMoves", () => {
    it("should enumerate the stored moves", () => {
      const expected: TrainingMoveSpecification[] = [
        { fen: "fen0", san: "san0" },
        { fen: "fen1", san: "san1" },
        { fen: "fen1", san: "san2" },
      ];
      const training = new TrainingCollection();
      _.forEach(expected, move => training.addMove(move.fen, move.san));

      const actual = training.getMoves();

      expect(actual).toEqual(expected);
    });
  });

  describe("getPositionsWithMultipleTrainings", () => {
    it("should be an empty collection if there are no positions with multiple moves", () => {
      const moves: TrainingMoveSpecification[] = [
        { fen: "0", san: "0" },
        { fen: "1", san: "1" },
      ];
      const training = new TrainingCollection();
      _.forEach(moves, move => training.addMove(move.fen, move.san));

      const actual = training.getPositionsWithMultipleTrainings();

      expect(actual).toEqual({});
    });

    it("should be a map of the positions with duplicate moves to the duplicate moves", () => {
      const moves: TrainingMoveSpecification[] = [
        { fen: "0", san: "0" },
        { fen: "0", san: "1" },
        { fen: "1", san: "2" },
      ];
      const expected = { [moves[0].fen]: [moves[0], moves[1]] };
      const training = new TrainingCollection();
      _.forEach(moves, move => training.addMove(move.fen, move.san));

      const actual = training.getPositionsWithMultipleTrainings();

      expect(actual).toEqual(expected);
    });
  });
});
