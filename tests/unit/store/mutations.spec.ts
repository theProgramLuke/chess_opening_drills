import { mutations, MutationState } from "@/store/Mutations";
import { Repertoire } from "@/store/repertoire";
import { PersistantStorage } from "@/store/PersistantStorage";
import { Store } from "vuex";

describe("mutations", () => {
  let state: MutationState;

  beforeEach(() => {
    state = {
      persisted: new PersistantStorage({
        get: jest.fn(),
        set: jest.fn(),
        clear: jest.fn()
      }),
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

      expect(state.persisted.storage.clear).toBeCalled();
    });
  });
});
