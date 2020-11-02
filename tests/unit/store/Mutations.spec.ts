import { mutations, MutationState } from "@/store/Mutations";
import { PersistantStorage } from "@/store/PersistantStorage";
import { Repertoire, SavedRepertoire } from "@/store/repertoire/Repertoire";
import { PositionCollection } from "@/store/repertoire/PositionCollection";
import { TrainingCollection } from "@/store/repertoire/TrainingCollection";
import { TagTree } from "@/store/repertoire/TagTree";
import {
  RepetitionTraining,
  TrainingEvent,
} from "@/store/repertoire/RepetitionTraining";
import {
  SetEngineMetadataPayload,
  SetPositionCommentsPayload,
  SetPositionDrawingsPayload,
} from "@/store/MutationPayloads";
import { Side } from "@/store/side";

jest.mock("@/store/PersistantStorage");
jest.mock("@/store/repertoire/Repertoire");
jest.mock("@/store/repertoire/PositionCollection");
jest.mock("@/store/repertoire/TrainingCollection");
jest.mock("@/store/repertoire/TagTree");
jest.mock("@/store/repertoire/RepetitionTraining");
jest.mock("@/store/BackupManager");

describe("mutations", () => {
  let state: MutationState;

  const emptySavedRepertoire: SavedRepertoire = {
    training: {},
    sideToTrain: 0,
    positions: {},
    tags: { name: "", fen: "", id: "", children: [], isRootTag: false },
  };

  beforeEach(() => {
    state = {
      persisted: new PersistantStorage(),
      darkMode: false,
      primary: "",
      secondary: "",
      accent: "",
      error: "",
      warning: "",
      info: "",
      success: "",
      boardTheme: "",
      pieceTheme: "",
      whiteRepertoire: new Repertoire(emptySavedRepertoire),
      blackRepertoire: new Repertoire(emptySavedRepertoire),
      backupDirectory: "",
      dailyBackupLimit: 0,
      monthlyBackupLimit: 0,
      yearlyBackupLimit: 0,
      enableBackups: false,
      moveAnimationSpeed: 0,
    };

    state.whiteRepertoire.positions = new PositionCollection({});
    state.blackRepertoire.positions = new PositionCollection({});
  });

  describe("setDarkMode", () => {
    it.each([true, false])(
      "should set and persist the darkMode %s",
      (darkMode: boolean) => {
        mutations.setDarkMode(state, darkMode);

        expect(state.darkMode).toBe(darkMode);
        expect(state.persisted.darkMode).toBe(darkMode);
      }
    );
  });

  describe("setBoardTheme", () => {
    it("should set and persist the board theme", () => {
      const theme = "some theme";

      mutations.setBoardTheme(state, theme);

      expect(state.boardTheme).toBe(theme);
      expect(state.persisted.boardTheme).toBe(theme);
    });
  });

  describe("setPieceTheme", () => {
    it("should set and persist the piece theme", () => {
      const theme = "some theme";

      mutations.setPieceTheme(state, theme);

      expect(state.pieceTheme).toBe(theme);
      expect(state.persisted.pieceTheme).toBe(theme);
    });
  });

  describe("setColor", () => {
    it("should set and persist the piece theme", () => {
      const colorToSet = "primary";
      const color = "some theme";

      mutations.setColor(state, { colorToSet, value: color });

      expect(state.primary).toBe(color);
      expect(state.persisted.primary).toBe(color);
    });
  });

  describe("addRepertoireMove", () => {
    it("should add the move to the %s repertoire", () => {
      const repertoire = new Repertoire(emptySavedRepertoire);
      repertoire.positions = new PositionCollection({});
      const fen = "fen";
      const san = "san";

      mutations.addRepertoireMove(state, { repertoire, fen, san });

      expect(repertoire.positions.addMove).toBeCalledWith(fen, san);
    });

    it.each([Side.White, Side.Black])(
      "should persist the %s repertoire",
      sideToTrain => {
        const repertoire = new Repertoire(emptySavedRepertoire);
        repertoire.positions = new PositionCollection({});
        repertoire.sideToTrain = sideToTrain;

        mutations.addRepertoireMove(state, { repertoire, fen: "", san: "" });

        if (sideToTrain === Side.White) {
          expect(state.whiteRepertoire).toBe(repertoire);
          expect(state.persisted.whiteRepertoire).toBe(repertoire);
        } else {
          expect(state.blackRepertoire).toBe(repertoire);
          expect(state.persisted.blackRepertoire).toBe(repertoire);
        }
      }
    );
  });

  describe("addRepertoireTag", () => {
    it("should AddChild to the parent tag", () => {
      const parent = new TagTree("", "", []);
      const repertoire = new Repertoire(emptySavedRepertoire);
      const fen = "fen";
      const name = "name";

      mutations.addRepertoireTag(state, { repertoire, parent, fen, name });

      expect(parent.addTag).toBeCalledWith(name, fen);
    });

    it.each([Side.White, Side.Black])(
      "should persist the %s repertoire",
      sideToTrain => {
        const repertoire = new Repertoire(emptySavedRepertoire);
        repertoire.sideToTrain = sideToTrain;

        mutations.addRepertoireTag(state, {
          repertoire,
          parent: new TagTree("", "", []),
          fen: "",
          name: "",
        });

        if (sideToTrain === Side.White) {
          expect(state.whiteRepertoire).toBe(repertoire);
          expect(state.persisted.whiteRepertoire).toBe(repertoire);
        } else {
          expect(state.blackRepertoire).toBe(repertoire);
          expect(state.persisted.blackRepertoire).toBe(repertoire);
        }
      }
    );
  });

  describe("addTrainingEvent", () => {
    it("should addTrainingEvent to the %s position", () => {
      const repertoire = new Repertoire(emptySavedRepertoire);
      const moveTraining = new RepetitionTraining();
      const event: TrainingEvent = {
        attemptedMoves: [],
        elapsedMilliseconds: 0,
      };
      repertoire.training = new TrainingCollection({});
      (repertoire.training.getTrainingForMove as jest.Mock).mockReturnValue(
        moveTraining
      );
      const fen = "fen";
      const san = "san";

      mutations.addTrainingEvent(state, { repertoire, fen, san, event });

      expect(moveTraining.addTrainingEvent).toBeCalledWith(event);
      expect(repertoire.training.getTrainingForMove).toBeCalledWith(fen, san);
    });

    it.each([Side.White, Side.Black])(
      "should persist the %s repertoire",
      sideToTrain => {
        const repertoire = new Repertoire(emptySavedRepertoire);
        repertoire.training = new TrainingCollection();
        repertoire.sideToTrain = sideToTrain;

        mutations.addTrainingEvent(state, {
          repertoire,
          fen: "",
          san: "",
          event: {
            attemptedMoves: [],
            elapsedMilliseconds: 0,
          },
        });

        if (sideToTrain === Side.White) {
          expect(state.whiteRepertoire).toBe(repertoire);
          expect(state.persisted.whiteRepertoire).toBe(repertoire);
        } else {
          expect(state.blackRepertoire).toBe(repertoire);
          expect(state.persisted.blackRepertoire).toBe(repertoire);
        }
      }
    );
  });

  describe("removeRepertoireTag", () => {
    it("should removeTag to the parent tag", () => {
      const repertoire = new Repertoire(emptySavedRepertoire);
      repertoire.tags = new TagTree("", "", []);
      const id = "id";

      mutations.removeRepertoireTag(state, { repertoire, id });

      expect(repertoire.tags.removeTag).toBeCalledWith(id);
    });

    it.each([Side.White, Side.Black])(
      "should persist the %s repertoire",
      sideToTrain => {
        const repertoire = new Repertoire(emptySavedRepertoire);
        repertoire.tags = new TagTree("", "", []);
        repertoire.sideToTrain = sideToTrain;

        mutations.removeRepertoireTag(state, {
          repertoire,
          id: "",
        });

        if (sideToTrain === Side.White) {
          expect(state.whiteRepertoire).toBe(repertoire);
          expect(state.persisted.whiteRepertoire).toBe(repertoire);
        } else {
          expect(state.blackRepertoire).toBe(repertoire);
          expect(state.persisted.blackRepertoire).toBe(repertoire);
        }
      }
    );
  });

  describe("removeRepertoireMove", () => {
    it("should AddChild to the parent tag", () => {
      const repertoire = new Repertoire(emptySavedRepertoire);
      repertoire.positions = new PositionCollection({});
      const fen = "fen";
      const san = "san";

      mutations.removeRepertoireMove(state, { repertoire, fen, san });

      expect(repertoire.positions.deleteMove).toBeCalledWith(fen, san);
    });

    it.each([Side.White, Side.Black])(
      "should persist the %s repertoire",
      sideToTrain => {
        const repertoire = new Repertoire(emptySavedRepertoire);
        repertoire.positions = new PositionCollection({});
        repertoire.sideToTrain = sideToTrain;

        mutations.removeRepertoireMove(state, {
          repertoire,
          fen: "",
          san: "",
        });

        if (sideToTrain === Side.White) {
          expect(state.whiteRepertoire).toBe(repertoire);
          expect(state.persisted.whiteRepertoire).toBe(repertoire);
        } else {
          expect(state.blackRepertoire).toBe(repertoire);
          expect(state.persisted.blackRepertoire).toBe(repertoire);
        }
      }
    );
  });

  describe("addPositionsFromPgn", () => {
    it("should loadPgn on the repertoire positions", () => {
      const pgn = "";
      const repertoire = new Repertoire(emptySavedRepertoire);
      repertoire.positions = new PositionCollection({});

      mutations.addPositionsFromPgn(state, { repertoire, pgn });

      expect(repertoire.positions.loadPgn).toBeCalledWith(pgn);
    });

    it.each([Side.White, Side.Black])(
      "should persist the %s repertoire",
      sideToTrain => {
        const repertoire = new Repertoire(emptySavedRepertoire);
        repertoire.positions = new PositionCollection({});
        repertoire.sideToTrain = sideToTrain;

        mutations.addPositionsFromPgn(state, {
          repertoire,
          pgn: "",
        });

        if (sideToTrain === Side.White) {
          expect(state.whiteRepertoire).toBe(repertoire);
          expect(state.persisted.whiteRepertoire).toBe(repertoire);
        } else {
          expect(state.blackRepertoire).toBe(repertoire);
          expect(state.persisted.blackRepertoire).toBe(repertoire);
        }
      }
    );
  });

  describe("setBackupDirectory", () => {
    it("should set the backup directory", () => {
      const backupDirectory = "backups";

      mutations.setBackupDirectory(state, backupDirectory);

      expect(state.backupDirectory).toBe(backupDirectory);
      expect(state.persisted.backupDirectory).toBe(backupDirectory);
    });
  });

  describe("setDailyBackupLimit", () => {
    it("should set the daily backup limit", () => {
      const limit = 2;

      mutations.setDailyBackupLimit(state, limit);

      expect(state.dailyBackupLimit).toBe(limit);
      expect(state.persisted.dailyBackupLimit).toBe(limit);
    });
  });

  describe("setMonthlyBackupLimit", () => {
    it("should set the monthly backup limit", () => {
      const limit = 2;

      mutations.setMonthlyBackupLimit(state, limit);

      expect(state.monthlyBackupLimit).toBe(limit);
      expect(state.persisted.monthlyBackupLimit).toBe(limit);
    });
  });

  describe("setYearlyBackupLimit", () => {
    it("should set the yearly backup limit", () => {
      const limit = 2;

      mutations.setYearlyBackupLimit(state, limit);

      expect(state.yearlyBackupLimit).toBe(limit);
      expect(state.persisted.yearlyBackupLimit).toBe(limit);
    });
  });

  describe("setEnableBackups", () => {
    it.each([true, false])(
      "should set the enable backups setting %s",
      enable => {
        mutations.setEnableBackups(state, enable);

        expect(state.enableBackups).toBe(enable);
        expect(state.persisted.enableBackups).toBe(enable);
      }
    );
  });

  describe("setMoveAnimationSpeed", () => {
    it.each([100, 200])(
      "should set the move animation speed setting %s",
      speed => {
        mutations.setMoveAnimationSpeed(state, speed);

        expect(state.moveAnimationSpeed).toBe(speed);
        expect(state.persisted.moveAnimationSpeed).toBe(speed);
      }
    );
  });

  describe("setPositionComments", () => {
    it("should set the position comments", () => {
      const repertoire = new Repertoire(emptySavedRepertoire);
      repertoire.positions = new PositionCollection({});
      const payload: SetPositionCommentsPayload = {
        repertoire,
        fen: "some fen",
        comments: "some comments",
      };

      mutations.setPositionComments(state, payload);

      expect(repertoire.positions.setPositionComments).toBeCalledWith(
        payload.fen,
        payload.comments
      );
    });
  });

  describe("setPositionDrawings", () => {
    it("should set the position drawings", () => {
      const repertoire = new Repertoire(emptySavedRepertoire);
      repertoire.positions = new PositionCollection({});
      const payload: SetPositionDrawingsPayload = {
        repertoire,
        fen: "some fen",
        drawings: [],
      };

      mutations.setPositionDrawings(state, payload);

      expect(repertoire.positions.setPositionDrawings).toBeCalledWith(
        payload.fen,
        payload.drawings
      );
    });
  });

  describe("setEngineMetadata", () => {
    it("should set the engine metadata", () => {
      const expected: SetEngineMetadataPayload = {
        filePath: "",
        name: "",
        options: [],
      };

      mutations.setEngineMetadata(state, expected);

      expect(state.engineMetadata).toEqual(expected);
      expect(state.persisted.engineMetadata).toEqual(expected);
    });
  });

  describe("clear", () => {
    it("should clear the storage", () => {
      mutations.clearStorage(state);

      expect(state.persisted.clear).toBeCalled();
    });
  });
});
