import { mutations, MutationState } from "@/store/Mutations";
import { Repertoire } from "@/store/repertoire";
import { PersistantStorage } from "@/store/PersistantStorage";
import { Side } from "@/store/side";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Move } from "@/store/move";
import { RepertoireTag } from "@/store/repertoireTag";
import { TrainingEvent } from "@/store/TrainingEvent";
import { PgnGame } from "@/store/pgnParser";

jest.mock("@/store/PersistantStorage");
jest.mock("@/store/repertoire");
jest.mock("@/store/repertoireTag");
jest.mock("@/store/repertoirePosition");
jest.mock("@/store/TrainingEvent");

describe("mutations", () => {
  let state: MutationState;

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
      whiteRepertoire: new Repertoire([], []),
      blackRepertoire: new Repertoire([], [])
    };
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

      mutations.setColor(state, { colorToSet, color });

      expect(state.primary).toBe(color);
      expect(state.persisted.primary).toBe(color);
    });
  });

  describe("addRepertoirePosition", () => {
    it.each([Side.White, Side.Black])(
      "should addMove to the %s repertoire",
      side => {
        const parent = new RepertoirePosition("", "", side);
        parent.forSide = side;
        const newMove = new Move("", new RepertoirePosition("", "", side));
        const repertoire =
          side === Side.White ? state.whiteRepertoire : state.blackRepertoire;

        mutations.addRepertoirePosition(state, { parent, newMove });

        expect(repertoire.AddMove).toBeCalledWith(parent, newMove);
      }
    );
  });

  describe("addRepertoireTag", () => {
    it.each([Side.White, Side.Black])(
      "should AddChild to the parent tag",
      side => {
        const parent = new RepertoireTag(
          side,
          "",
          new RepertoirePosition("", "", side),
          "",
          []
        );
        const tag = new RepertoireTag(
          side,
          "",
          new RepertoirePosition("", "", side),
          "",
          []
        );
        parent.forSide = side;
        const repertoire =
          side === Side.White ? state.whiteRepertoire : state.blackRepertoire;

        mutations.addRepertoireTag(state, { parent, tag });

        expect(parent.AddChild).toBeCalledWith(tag);
      }
    );
  });

  describe("addTrainingEvent", () => {
    it.each([Side.White, Side.Black])(
      "should addTrainingEvent to the %s position",
      side => {
        const position = new RepertoirePosition("", "", side);
        position.forSide = side;
        const event = new TrainingEvent(0, 0);
        const repertoire =
          side === Side.White ? state.whiteRepertoire : state.blackRepertoire;

        mutations.addTrainingEvent(state, { position, event });

        expect(position.AddTrainingEvent).toBeCalledWith(event);
      }
    );
  });

  describe("removeRepertoireTag", () => {
    it.each([Side.White, Side.Black])(
      "should AddChild to the parent tag",
      side => {
        const tag = new RepertoireTag(
          side,
          "",
          new RepertoirePosition("", "", side),
          "",
          []
        );
        tag.forSide = side;
        const repertoire =
          side === Side.White ? state.whiteRepertoire : state.blackRepertoire;

        mutations.removeRepertoireTag(state, tag);

        expect(repertoire.RemoveRepertoireTag).toBeCalledWith(tag);
      }
    );
  });

  describe("removeRepertoireMove", () => {
    it.each([Side.White, Side.Black])(
      "should AddChild to the parent tag",
      side => {
        const move = new Move("", new RepertoirePosition("", "", side));
        move.position.forSide = side;
        const repertoire =
          side === Side.White ? state.whiteRepertoire : state.blackRepertoire;

        mutations.removeRepertoireMove(state, move);

        expect(repertoire.RemoveMove).toBeCalledWith(move);
      }
    );
  });

  describe("addPositionsFromGame", () => {
    it.each([Side.White, Side.Black])(
      "should AddFromGame to the %s repertoire",
      side => {
        const game: PgnGame = {
          commentsAboveHeader: "",
          comments: "",
          moves: [],
          headers: [],
          result: ""
        };
        const repertoire =
          side === Side.White ? state.whiteRepertoire : state.blackRepertoire;

        mutations.addPositionsFromGame(state, { forSide: side, game });

        expect(repertoire.AddFromGame).toBeCalledWith(game);
      }
    );
  });

  describe("clear", () => {
    it("should clear the storage", () => {
      mutations.clearStorage(state);

      expect(state.persisted.clear).toBeCalled();
    });
  });
});