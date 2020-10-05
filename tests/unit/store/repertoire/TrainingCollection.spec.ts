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
  describe("addForTraining", () => {
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

      training.addForTraining(fen0, san0);
      training.addForTraining(fen1, san1);
      const actual = training.repetitionTraining;

      expect(actual).toEqual(expected);
    });

    it("should not modify already existing repetition training for the fen/san pair", () => {
      const expected = new RepetitionTraining();
      const fen = "some fen";
      const san = "some san";
      const training = new TrainingCollection({ [fen]: { [san]: expected } });

      training.addForTraining(fen, san);
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

      training.addForTraining(fen, san0);
      training.addForTraining(fen, san1);
      const actual = training.repetitionTraining;

      expect(actual).toEqual(expected);
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
      training.addForTraining(fen, san);
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
