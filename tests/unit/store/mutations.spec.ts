import { mutations, MutationState } from "@/store/Mutations";
import { Repertoire } from "@/store/repertoire";
import { PersistantStorage } from "@/store/PersistantStorage";

jest.mock("@/store/PersistantStorage");
jest.mock("@/store/repertoire");

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

  describe("clear", () => {
    it("should clear the storage", () => {
      mutations.clearStorage(state);

      expect(state.persisted.clear).toBeCalled();
    });
  });
});
