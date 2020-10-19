import _ from "lodash";

import {
  PositionCollection,
  AddMoveObserver,
  DeleteMoveObserver,
  VariationMove,
  Variation
} from "@/store/repertoire/PositionCollection";
import { Repertoire, SavedRepertoire } from "@/store/repertoire/Repertoire";
import { Side } from "@/store/side";
import { TrainingCollection } from "@/store/repertoire/TrainingCollection";
import { TagTree } from "@/store/repertoire/TagTree";
import { TrainingMode } from "@/store/trainingMode";
import { RepetitionTraining } from "@/store/repertoire/RepetitionTraining";

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
    it("should be updated with the new move when a move is added to the positions for the side to train", () => {
      const repertoire = new Repertoire({
        name: "",
        sideToTrain: Side.White,
        positions: {},
        tags: [],
        training: {}
      });
      const fen = "fen w ";
      const san = "san";

      (repertoire.positions as PositionCollection & {
        addMoveObserver: AddMoveObserver;
      }).addMoveObserver(fen, san);

      expect(repertoire.training.addMove).toBeCalledWith(fen, san);
    });

    it("should not be updated with the new move when a move is added to the positions for the side not to train", () => {
      const repertoire = new Repertoire({
        name: "",
        sideToTrain: Side.White,
        positions: {},
        tags: [],
        training: {}
      });
      const fen = "fen b ";
      const san = "san";

      (repertoire.positions as PositionCollection & {
        addMoveObserver: AddMoveObserver;
      }).addMoveObserver(fen, san);

      expect(repertoire.training.addMove).not.toBeCalled();
    });

    it("should be updated with the deleted moves and positions when a move is deleted", () => {
      const repertoire = new Repertoire({
        name: "",
        sideToTrain: Side.White,
        positions: {},
        tags: [],
        training: {}
      });
      const fen = "fen";
      const san = "san";
      const positions = ["some", "positions"];

      (repertoire.positions as PositionCollection & {
        deleteMoveObserver: DeleteMoveObserver;
      }).deleteMoveObserver(fen, san, positions);

      expect(repertoire.training.deleteMove).toBeCalledWith(fen, san);
      _.forEach(positions, position =>
        expect(repertoire.training.deletePosition).toBeCalledWith(position)
      );
    });
  });

  describe("tags", () => {
    it("should each be updated with the deleted positions when a position is deleted", () => {
      const repertoire = new Repertoire({
        name: "",
        sideToTrain: Side.White,
        positions: {},
        tags: [new TagTree("", "", "", []), new TagTree("", "", "", [])],
        training: {}
      });
      const positions = ["some", "positions"];

      (repertoire.positions as PositionCollection & {
        deleteMoveObserver: DeleteMoveObserver;
      }).deleteMoveObserver("", "", positions);

      _.forEach(repertoire.tags, tag =>
        _.forEach(positions, position =>
          expect(tag.removeTag).toBeCalledWith(position)
        )
      );
    });
  });

  // describe("getTrainingVariations", () => {
  //   it(`should get the full variation
  //       that contain positions matching the training mode
  //       and descend from the tags to train`, () => {
  //     const positions: string[] = ["fen0", "fen1", "fen2"];
  //     const moves: string[] = ["san0", "san1"];
  //     const descendants: Record<string, string[]> = {
  //       [positions[0]]: [positions[1], positions[2]],
  //       [positions[1]]: [positions[2]],
  //       [positions[2]]: []
  //     };
  //     const repertoire = new Repertoire({
  //       name: "",
  //       sideToTrain: Side.White,
  //       positions: {},
  //       tags: [new TagTree("", positions[0], "", [])],
  //       training: {}
  //     });
  //     const expected: Variation[] = [
  //       [{ sourceFen: positions[0], san: moves[0], resultingFen: positions[0] }]
  //     ];

  //     const actual = repertoire.getTrainingVariations(
  //       [repertoire.tags[0]],
  //       [TrainingMode.Scheduled]
  //     );

  //     expect(actual).toEqual(expected);
  //   });
  // });
});
