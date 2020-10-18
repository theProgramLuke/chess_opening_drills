import _ from "lodash";

import {
  PositionCollection,
  AddMoveObserver
} from "@/store/repertoire/PositionCollection";
import { Repertoire, SavedRepertoire } from "@/store/repertoire/Repertoire";
import { Side } from "@/store/side";
import { TrainingCollection } from "@/store/repertoire/TrainingCollection";

jest.mock("@/store/repertoire/TagTree");
jest.mock("@/store/repertoire/RepetitionTraining");
jest.mock("@/store/repertoire/PositionCollection");
jest.mock("@/store/repertoire/TrainingCollection");

beforeEach(() => {
  (TrainingCollection.fromSaved as jest.Mock).mockReturnValue(
    new TrainingCollection()
  );
});

describe("Repertoire", () => {
  describe("asSaved", () => {
    it("should save the repertoire", () => {
      const expected: SavedRepertoire = {
        name: "my white repertoire",
        sideToTrain: Side.White,
        positions: new PositionCollection({}).asSaved(),
        tags: [],
        training: new TrainingCollection().asSaved()
      };
      const repertoire = new Repertoire(_.cloneDeep(expected));

      const actual = repertoire.asSaved();

      expect(actual).toEqual(expected);
    });
  });

  describe("training", () => {
    it("should be updated with the new move when a move is added to the positions", () => {
      const repertoire = new Repertoire({
        name: "",
        sideToTrain: Side.White,
        positions: {},
        tags: [],
        training: {}
      });
      const fen = "fen";
      const san = "san";

      (repertoire.positions as PositionCollection & {
        addMoveObserver: AddMoveObserver;
      }).addMoveObserver(fen, san);

      expect(repertoire.training.addForTraining).toBeCalledWith(fen, san);
    });
  });
});
