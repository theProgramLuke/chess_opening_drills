import {
  TrainingCollection,
  RepetitionTrainingCollection,
  SavedTrainingCollection
} from "@/store/repertoire/TrainingCollection";
import {
  RepetitionTraining,
  SavedRepetitionTraining
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
      const expected = {
        [fen0]: {
          [san0]: expect.any(RepetitionTraining)
        },
        [fen1]: {
          [san1]: expect.any(RepetitionTraining)
        }
      };

      training.addMove(fen0, san0);
      training.addMove(fen1, san1);
      const actual = training.repetitionTraining;

      expect(actual).toEqual(expected);
    });

    it("should not modify already existing repetition training for the fen/san pair", () => {
      const expected = new RepetitionTraining();
      const fen = "some fen";
      const san = "some san";
      const training = new TrainingCollection({ [fen]: { [san]: expected } });

      training.addMove(fen, san);
      const actual = training.repetitionTraining[fen][san];

      expect(actual).toBe(expected);
    });

    it("should track allow more than one san for the same fen", () => {
      const training = new TrainingCollection();
      const fen = "some fen";
      const san0 = "some san0";
      const san1 = "some san1";
      const expected = {
        [fen]: {
          [san0]: expect.any(RepetitionTraining),
          [san1]: expect.any(RepetitionTraining)
        }
      };

      training.addMove(fen, san0);
      training.addMove(fen, san1);
      const actual = training.repetitionTraining;

      expect(actual).toEqual(expected);
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

      expect(training.repetitionTraining[fen][san]).toBeUndefined();
    });

    it("should not remove the fen entry for other moves from the same fen", () => {
      const training = new TrainingCollection();
      const fen = "fen";
      const san = "san";
      const other = "other san";
      training.addMove(fen, san);
      training.addMove(fen, other);

      training.deleteMove(fen, san);

      expect(training.repetitionTraining[fen][other]).toBeDefined();
    });

    it("should remove the fen entry if there are no remaining moves", () => {
      const training = new TrainingCollection();
      const fen = "fen";
      const san = "san";
      training.addMove(fen, san);

      training.deleteMove(fen, san);

      expect(training.repetitionTraining[fen]).toBeUndefined();
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
        effectiveTrainingIndex: 0
      };
      const expected = {
        [fen]: {
          [san]: savedTraining
        }
      };
      training.addMove(fen, san);
      (training.repetitionTraining[fen][san]
        .asSaved as jest.Mock).mockReturnValue(savedTraining);

      const actual = training.asSaved();

      expect(actual).toEqual(expected);
    });

    it("should restore the training state", () => {
      const savedRepetitionTraining = {
        history: [],
        easiness: 0,
        effectiveTrainingIndex: 0
      };
      const saved: SavedTrainingCollection = {
        "some fen": {
          "some san": savedRepetitionTraining
        }
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
});
