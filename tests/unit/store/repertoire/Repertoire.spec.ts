import _ from "lodash";

import {
  PositionCollection,
  AddMoveObserver,
  DeleteMoveObserver,
  Variation,
  VariationMove
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
  describe("asSaved/fromSaved", () => {
    it("should save the repertoire", () => {
      const expected: SavedRepertoire = {
        sideToTrain: Side.White,
        positions: new PositionCollection({}).asSaved(),
        tags: { name: "", fen: "", id: "", children: [], isRootTag: false },
        training: new TrainingCollection().asSaved()
      };
      const tags = new TagTree("", "", []);
      (tags.asSaved as jest.Mock).mockReturnValue(expected.tags);
      (TagTree.fromSaved as jest.Mock).mockReturnValue(tags);
      const repertoire = new Repertoire(_.cloneDeep(expected));

      const actual = repertoire.asSaved();

      expect(actual).toEqual(expected);
    });
  });

  describe("training", () => {
    it("should be updated with the new move when a move is added to the positions for the side to train", () => {
      const repertoire = new Repertoire({
        sideToTrain: Side.White,
        positions: {},
        tags: new TagTree("", "", []),
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
        sideToTrain: Side.White,
        positions: {},
        tags: new TagTree("", "", []),
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
        sideToTrain: Side.White,
        positions: {},
        tags: new TagTree("", "", []),
        training: {}
      });
      repertoire.tags = new TagTree("", "", []);
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
        sideToTrain: Side.White,
        positions: {},
        tags: new TagTree("", "", []),
        training: {}
      });
      repertoire.tags = new TagTree("", "", []);
      const positions = ["some", "positions"];

      (repertoire.positions as PositionCollection & {
        deleteMoveObserver: DeleteMoveObserver;
      }).deleteMoveObserver("", "", positions);

      _.forEach(positions, position =>
        expect(repertoire.tags.removeTag).toBeCalledWith(position)
      );
    });
  });

  describe("getTrainingVariations", () => {
    let repertoire: Repertoire;
    let variations: Variation[];
    let positions: string[][];
    let moves: string[][];
    let training: Record<string, Record<string, RepetitionTraining>>;

    beforeEach(() => {
      repertoire = new Repertoire({
        sideToTrain: Side.White,
        positions: {},
        tags: new TagTree("", "", []),
        training: {}
      });
      // tag0
      // fen0 -> fen1 (san0)
      //   fen1 -> fen2 (san1)
      //   tag1
      //   fen2 -> fen3 (san2)
      //   fen3 -> fen4 (san3)
      // tag2
      // fen5 -> fen6 (san4)
      //   fen6 -> fen7 (san5)
      positions = [
        ["fen0", "fen1", "fen2", "fen3", "fen4"],
        ["fen5", "fen6", "fen7"]
      ];
      moves = [
        ["san0", "san1", "san2", "san3"],
        ["san4", "san5"]
      ];
      repertoire.tags = new TagTree("", "", []);
      repertoire.tags.fen = positions[0][0];
      repertoire.tags.children = [
        new TagTree("", "", []),
        new TagTree("", "", [])
      ];
      (repertoire.tags.includesTag as jest.Mock).mockReturnValue(true);
      repertoire.tags.children[0].fen = positions[0][2];
      repertoire.tags.children[1].fen = positions[1][0];
      const descendants: Record<string, string[]> = {
        [positions[0][0]]: _.takeRight(positions[0], 4),
        [positions[0][1]]: _.takeRight(positions[0], 3),
        [positions[0][2]]: _.takeRight(positions[0], 2),
        [positions[0][3]]: _.takeRight(positions[0], 1),
        [positions[0][4]]: [],
        [positions[1][0]]: _.takeRight(positions[1], 2),
        [positions[1][1]]: _.takeRight(positions[1], 1),
        [positions[1][2]]: []
      };
      training = {
        [positions[0][0]]: {
          [moves[0][0]]: new RepetitionTraining()
        },
        [positions[0][1]]: {
          [moves[0][1]]: new RepetitionTraining()
        },
        [positions[0][2]]: {
          [moves[0][2]]: new RepetitionTraining()
        },
        [positions[0][3]]: {
          [moves[0][3]]: new RepetitionTraining()
        },
        [positions[1][0]]: {
          [moves[1][0]]: new RepetitionTraining()
        },
        [positions[1][1]]: {
          [moves[1][1]]: new RepetitionTraining()
        }
      };
      variations = [
        [
          {
            sourceFen: positions[0][0],
            san: moves[0][0],
            resultingFen: positions[0][1]
          },
          {
            sourceFen: positions[0][1],
            san: moves[0][1],
            resultingFen: positions[0][2]
          },
          {
            sourceFen: positions[0][2],
            san: moves[0][2],
            resultingFen: positions[0][3]
          },
          {
            sourceFen: positions[0][3],
            san: moves[0][3],
            resultingFen: positions[0][4]
          }
        ],
        [
          {
            sourceFen: positions[1][0],
            san: moves[1][0],
            resultingFen: positions[1][1]
          },
          {
            sourceFen: positions[1][1],
            san: moves[1][1],
            resultingFen: positions[1][2]
          }
        ]
      ];
      const sourceVariations: Record<string, Variation[]> = {
        [positions[0][0]]: [],
        [positions[0][1]]: [_.take(variations[0], 1)],
        [positions[0][2]]: [_.take(variations[0], 2)],
        [positions[0][3]]: [_.take(variations[0], 3)],
        [positions[0][4]]: [_.take(variations[0], 4)],
        [positions[1][0]]: [],
        [positions[1][1]]: [_.take(variations[1], 1)],
        [positions[1][2]]: [_.take(variations[1], 2)]
      };
      const movesFromPositions: Record<string, VariationMove[]> = {
        [positions[0][0]]: [variations[0][0]],
        [positions[0][1]]: [variations[0][1]],
        [positions[0][2]]: [variations[0][2]],
        [positions[0][3]]: [variations[0][3]],
        [positions[0][4]]: [],
        [positions[1][0]]: [variations[1][0]],
        [positions[1][1]]: [variations[1][1]],
        [positions[1][2]]: []
      };
      (repertoire.training
        .getTrainingForMove as jest.Mock).mockImplementation(
        (fen: string, san: string) => _.get(training, [fen, san])
      );
      (repertoire.positions
        .descendantPositions as jest.Mock).mockImplementation(
        (fen: string) => descendants[fen]
      );
      (repertoire.positions
        .getSourceVariations as jest.Mock).mockImplementation(
        (fen: string) => sourceVariations[fen]
      );
      (repertoire.positions.movesFromPosition as jest.Mock).mockImplementation(
        (fen: string) => movesFromPositions[fen]
      );
    });

    it(`should get the full variation
        that contain positions matching the training mode
        and descend from the tags to train`, () => {
      const trainingMode = TrainingMode.Scheduled;
      const expected: Variation[] = [_.take(variations[0], 4)];
      (training[positions[0][3]][moves[0][3]]
        .includeForTrainingMode as jest.Mock).mockImplementation(
        (mode: TrainingMode) => mode === trainingMode
      );

      const actual = repertoire.getTrainingVariations(
        [repertoire.tags],
        [trainingMode],
        true
      );

      expect(actual).toEqual(expected);
    });

    it(`should not include variations that do not match the training mode`, () => {
      const trainingMode = TrainingMode.Scheduled;
      (training[positions[0][1]][moves[0][1]]
        .includeForTrainingMode as jest.Mock).mockImplementation(() => false);

      const actual = repertoire.getTrainingVariations(
        [repertoire.tags],
        [trainingMode],
        true
      );

      expect(actual).toEqual([]);
    });

    it(`should end the variations after the move to train`, () => {
      const expected: Variation[] = [_.take(variations[0], 2)];
      (training[positions[0][0]][moves[0][0]]
        .includeForTrainingMode as jest.Mock).mockImplementation(() => false);
      (training[positions[0][1]][moves[0][1]]
        .includeForTrainingMode as jest.Mock).mockImplementation(() => true);
      (training[positions[0][2]][moves[0][2]]
        .includeForTrainingMode as jest.Mock).mockImplementation(() => false);
      (training[positions[0][3]][moves[0][3]]
        .includeForTrainingMode as jest.Mock).mockImplementation(() => false);

      const actual = repertoire.getTrainingVariations(
        [repertoire.tags],
        [TrainingMode.Scheduled],
        true
      );

      expect(actual).toEqual(expected);
    });

    it("should include only the longer of overlapping variations", () => {
      const expected: Variation[] = [_.take(variations[0], 4)];
      (training[positions[0][0]][moves[0][0]]
        .includeForTrainingMode as jest.Mock).mockImplementation(() => false);
      (training[positions[0][1]][moves[0][1]]
        .includeForTrainingMode as jest.Mock).mockImplementation(() => true);
      (training[positions[0][2]][moves[0][2]]
        .includeForTrainingMode as jest.Mock).mockImplementation(() => false);
      (training[positions[0][3]][moves[0][3]]
        .includeForTrainingMode as jest.Mock).mockImplementation(() => true);

      const actual = repertoire.getTrainingVariations(
        [repertoire.tags],
        [TrainingMode.Scheduled],
        true
      );

      expect(actual).toEqual(expected);
    });

    it("should only include variation once when the move to train descends from multiple tags", () => {
      const expected: Variation[] = [_.take(variations[0], 4)];
      (training[positions[0][3]][moves[0][3]]
        .includeForTrainingMode as jest.Mock).mockImplementation(() => true);

      const actual = repertoire.getTrainingVariations(
        [repertoire.tags, repertoire.tags.children[0]],
        [TrainingMode.Scheduled],
        true
      );

      expect(actual).toEqual(expected);
    });

    it("should get no variations if no training modes are specified", () => {
      const actual = repertoire.getTrainingVariations(
        [repertoire.tags],
        [],
        true
      );

      expect(actual).toEqual([]);
    });

    it("should get variations descending from any of the tags", () => {
      const expected: Variation[] = [variations[0], variations[1]];
      (training[positions[0][3]][moves[0][3]]
        .includeForTrainingMode as jest.Mock).mockImplementation(() => true);
      (training[positions[1][1]][moves[1][1]]
        .includeForTrainingMode as jest.Mock).mockImplementation(() => true);

      const actual = repertoire.getTrainingVariations(
        [repertoire.tags, repertoire.tags.children[1]],
        [TrainingMode.Scheduled],
        true
      );

      expect(actual).toEqual(expected);
    });

    it("should ignore tags to train that are not in the repertoire tags", () => {
      (repertoire.tags.includesTag as jest.Mock).mockReturnValue(false);
      (training[positions[0][3]][moves[0][3]]
        .includeForTrainingMode as jest.Mock).mockImplementation(() => true);

      const actual = repertoire.getTrainingVariations(
        [repertoire.tags],
        [TrainingMode.Scheduled],
        true
      );

      expect(actual).toEqual([]);
    });

    it("should only get the individual moves to train when entireVariation is false", () => {
      (training[positions[0][3]][moves[0][3]]
        .includeForTrainingMode as jest.Mock).mockImplementation(() => true);
      (training[positions[1][0]][moves[1][0]]
        .includeForTrainingMode as jest.Mock).mockImplementation(() => true);
      const expected = [[variations[0][3]], [variations[1][0]]];

      const actual = repertoire.getTrainingVariations(
        [repertoire.tags, repertoire.tags.children[1]],
        [TrainingMode.Scheduled],
        false
      );

      expect(actual).toEqual(expected);
    });

    it("should pass through the difficulty limit to includeForTrainingMode", () => {
      const expected = 2;

      repertoire.getTrainingVariations(
        [repertoire.tags, repertoire.tags.children[1]],
        [TrainingMode.Difficult],
        true,
        2
      );

      _.forEach(training, trainingForFen => {
        _.forEach(trainingForFen, trainingForSan => {
          expect(trainingForSan.includeForTrainingMode).toBeCalledWith(
            expect.anything(),
            expected
          );
        });
      });
    });

    describe("getTrainingForTags", () => {
      it("should get an empty array that descend if no tags are specified", () => {
        const actual = repertoire.getTrainingForTags([]);

        expect(actual).toEqual([]);
      });

      it("should get the training positions that descend from any of the tags", () => {
        // tag0
        // fen0 -> fen1 (san0)
        //   fen1 -> fen2 (san1)
        //   tag1
        //   fen2 -> fen3 (san2)
        //   fen3 -> fen4 (san3)
        // tag2
        // fen5 -> fen6 (san4)
        //   fen6 -> fen7 (san5)
        // positions = [
        //   ["fen0", "fen1", "fen2", "fen3", "fen4"],
        //   ["fen5", "fen6", "fen7"]
        // ];
        // moves = [
        //   ["san0", "san1", "san2", "san3"],
        //   ["san4", "san5"]
        // ];
        const expected: RepetitionTraining[] = [
          training[positions[0][0]][moves[0][0]],
          training[positions[0][1]][moves[0][1]],
          training[positions[0][2]][moves[0][2]],
          training[positions[0][3]][moves[0][3]]
        ];
        (training[positions[0][0]][moves[0][0]]
          .includeForTrainingMode as jest.Mock).mockImplementation(() => true);
        (training[positions[0][1]][moves[0][1]]
          .includeForTrainingMode as jest.Mock).mockImplementation(() => true);
        (training[positions[0][2]][moves[0][2]]
          .includeForTrainingMode as jest.Mock).mockImplementation(() => true);
        (training[positions[0][3]][moves[0][3]]
          .includeForTrainingMode as jest.Mock).mockImplementation(() => true);

        const actual = repertoire.getTrainingForTags([repertoire.tags]);

        expect(actual).toEqual(expected);
      });
    });
  });

  describe("newSavedRepertoire", () => {
    it.each([Side.White, Side.Black])(
      "should create a saved repertoire with the side %s to train",
      sideToTrain => {
        const actual = Repertoire.newSavedRepertoire(
          "name",
          "fen",
          sideToTrain
        );

        expect(actual.sideToTrain).toEqual(sideToTrain);
      }
    );
  });
});
