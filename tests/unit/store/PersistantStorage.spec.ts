import ElectronStore from "electron-store";
import _ from "lodash";

import { SavedStorage, PersistantStorage } from "@/store/PersistantStorage";
import { Repertoire, SavedRepertoire } from "@/store/repertoire";

jest.mock("electron-store");
jest.mock("@/store/repertoire");

describe("PersistantStorage", () => {
  let store: ElectronStore<SavedStorage>;
  let persistantStorage: PersistantStorage;

  beforeEach(() => {
    store = new ElectronStore<SavedStorage>();
    persistantStorage = new PersistantStorage(store);
  });

  describe("dark mode", () => {
    it.each([true, false])("should get the stored dark mode %s", darkMode => {
      store.get = jest.fn(() => darkMode);

      const actual = persistantStorage.darkMode;

      expect(store.get).toBeCalledWith("darkMode");
      expect(actual).toBe(darkMode);
    });

    it.each([true, false])("should set the stored dark mode %s", darkMode => {
      persistantStorage.darkMode = darkMode;

      expect(store.set).toBeCalledWith("darkMode", darkMode);
    });
  });

  describe("primary", () => {
    it.each(["red", "blue"])(
      "should get the stored primary color %s",
      color => {
        store.get = jest.fn(() => color);

        const actual = persistantStorage.primary;

        expect(actual).toBe(color);
      }
    );

    it.each(["red", "blue"])(
      "should set the stored primary color %s",
      color => {
        persistantStorage.primary = color;

        expect(store.set).toBeCalledWith("primary", color);
      }
    );
  });

  describe("secondary", () => {
    it.each(["red", "blue"])(
      "should get the stored secondary color %s",
      color => {
        store.get = jest.fn(() => color);

        const actual = persistantStorage.secondary;

        expect(actual).toBe(color);
      }
    );

    it.each(["red", "blue"])(
      "should set the stored secondary color %s",
      color => {
        persistantStorage.secondary = color;

        expect(store.set).toBeCalledWith("secondary", color);
      }
    );
  });

  describe("accent", () => {
    it.each(["red", "blue"])("should get the stored accent color %s", color => {
      store.get = jest.fn(() => color);

      const actual = persistantStorage.accent;

      expect(actual).toBe(color);
    });

    it.each(["red", "blue"])("should set the stored accent color %s", color => {
      persistantStorage.accent = color;

      expect(store.set).toBeCalledWith("accent", color);
    });
  });

  describe("error", () => {
    it.each(["red", "blue"])("should get the stored error color %s", color => {
      store.get = jest.fn(() => color);

      const actual = persistantStorage.error;

      expect(actual).toBe(color);
    });

    it.each(["red", "blue"])("should set the stored error color %s", color => {
      persistantStorage.error = color;

      expect(store.set).toBeCalledWith("error", color);
    });
  });

  describe("warning", () => {
    it.each(["red", "blue"])(
      "should get the stored warning color %s",
      color => {
        store.get = jest.fn(() => color);

        const actual = persistantStorage.warning;

        expect(actual).toBe(color);
      }
    );

    it.each(["red", "blue"])(
      "should set the stored warning color %s",
      color => {
        persistantStorage.warning = color;

        expect(store.set).toBeCalledWith("warning", color);
      }
    );
  });

  describe("info", () => {
    it.each(["red", "blue"])("should get the stored info color %s", color => {
      store.get = jest.fn(() => color);

      const actual = persistantStorage.info;

      expect(actual).toBe(color);
    });

    it.each(["red", "blue"])("should set the stored info color %s", color => {
      persistantStorage.info = color;

      expect(store.set).toBeCalledWith("info", color);
    });
  });

  describe("success", () => {
    it.each(["red", "blue"])(
      "should get the stored success color %s",
      color => {
        store.get = jest.fn(() => color);

        const actual = persistantStorage.success;

        expect(actual).toBe(color);
      }
    );

    it.each(["red", "blue"])(
      "should set the stored success color %s",
      color => {
        persistantStorage.success = color;

        expect(store.set).toBeCalledWith("success", color);
      }
    );
  });

  describe("boardTheme", () => {
    it.each(["red", "blue"])(
      "should get the stored boardTheme color %s",
      color => {
        store.get = jest.fn(() => color);

        const actual = persistantStorage.boardTheme;

        expect(actual).toBe(color);
      }
    );

    it.each(["red", "blue"])(
      "should set the stored boardTheme color %s",
      color => {
        persistantStorage.boardTheme = color;

        expect(store.set).toBeCalledWith("boardTheme", color);
      }
    );
  });

  describe("pieceTheme", () => {
    it.each(["red", "blue"])(
      "should get the stored pieceTheme color %s",
      color => {
        store.get = jest.fn(() => color);

        const actual = persistantStorage.pieceTheme;

        expect(actual).toBe(color);
      }
    );

    it.each(["red", "blue"])(
      "should set the stored pieceTheme color %s",
      color => {
        persistantStorage.pieceTheme = color;

        expect(store.set).toBeCalledWith("pieceTheme", color);
      }
    );
  });

  describe("whiteRepertoire", () => {
    it("should get the saved repertoire FromSaved", () => {
      const repertoire = new Repertoire([], []);
      Repertoire.FromSaved = jest.fn(() => repertoire);

      const actual = persistantStorage.whiteRepertoire;

      expect(store.get).toBeCalledWith("whiteRepertoire");
      expect(actual).toBe(repertoire);
    });

    it("should set the repertoire AsSaved", () => {
      const savedRepertoire = new SavedRepertoire([], []);
      const repertoire = new Repertoire([], []);
      repertoire.AsSaved = jest.fn(() => savedRepertoire);

      persistantStorage.whiteRepertoire = repertoire;

      expect(store.set).toBeCalledWith("whiteRepertoire", savedRepertoire);
    });
  });

  describe("blackRepertoire", () => {
    it("should get the saved repertoire FromSaved", () => {
      const repertoire = new Repertoire([], []);
      Repertoire.FromSaved = jest.fn(() => repertoire);

      const actual = persistantStorage.blackRepertoire;

      expect(store.get).toBeCalledWith("blackRepertoire");
      expect(actual).toBe(repertoire);
    });

    it("should set the repertoire AsSaved", () => {
      const savedRepertoire = new SavedRepertoire([], []);
      const repertoire = new Repertoire([], []);
      repertoire.AsSaved = jest.fn(() => savedRepertoire);

      persistantStorage.blackRepertoire = repertoire;

      expect(store.set).toBeCalledWith("blackRepertoire", savedRepertoire);
    });
  });

  describe("clear", () => {
    it("should clear the store", () => {
      persistantStorage.clear();

      expect(store.clear).toBeCalled();
    });
  });
});
