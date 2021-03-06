import fs from "graceful-fs";
import ElectronStore from "electron-store";

import { SavedStorage, PersistantStorage } from "@/store/PersistantStorage";
import { Repertoire, SavedRepertoire } from "@/store/repertoire/Repertoire";
import { BackupManager } from "@/store/BackupManager";
import { EngineMetadata } from "@/store/EngineHelpers";

jest.mock("graceful-fs");
jest.mock("electron-store");
jest.mock("@/store/repertoire/Repertoire");
jest.mock("@/store/BackupManager");

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

const emptySavedRepertoire: SavedRepertoire = {
  training: {},
  sideToTrain: 0,
  positions: {},
  tags: { name: "", fen: "", id: "", children: [], isRootTag: false },
};

describe("PersistantStorage", () => {
  const storagePath = "some/path.json";

  let store: ElectronStore<SavedStorage>;
  let persistantStorage: PersistantStorage;

  beforeEach(() => {
    store = new ElectronStore<SavedStorage>();
    (store as Writeable<ElectronStore<SavedStorage>>).path = storagePath;
    persistantStorage = new PersistantStorage(store);
  });

  describe("GetDefaultStorage", () => {
    it("should get sane starting values", () => {
      new PersistantStorage();

      expect((ElectronStore as jest.Mock).mock.calls).toMatchSnapshot();
    });
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

        expect(store.get).toBeCalledWith("primary");
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

        expect(store.get).toBeCalledWith("secondary");
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

      expect(store.get).toBeCalledWith("accent");
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

      expect(store.get).toBeCalledWith("error");
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

        expect(store.get).toBeCalledWith("warning");
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

      expect(store.get).toBeCalledWith("info");
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

        expect(store.get).toBeCalledWith("success");
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

        expect(store.get).toBeCalledWith("boardTheme");
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

        expect(store.get).toBeCalledWith("pieceTheme");
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
      const actual = persistantStorage.whiteRepertoire;

      expect(store.get).toBeCalledWith("whiteRepertoire");
      expect(actual).toEqual(expect.any(Repertoire));
    });

    it("should set the repertoire AsSaved", () => {
      const repertoire = new Repertoire(emptySavedRepertoire);
      repertoire.asSaved = jest.fn(() => emptySavedRepertoire);

      persistantStorage.whiteRepertoire = repertoire;

      expect(store.set).toBeCalledWith("whiteRepertoire", emptySavedRepertoire);
    });
  });

  describe("blackRepertoire", () => {
    it("should get the saved repertoire FromSaved", () => {
      const actual = persistantStorage.blackRepertoire;

      expect(store.get).toBeCalledWith("blackRepertoire");
      expect(actual).toEqual(expect.any(Repertoire));
    });

    it("should set the repertoire AsSaved", () => {
      const repertoire = new Repertoire(emptySavedRepertoire);
      repertoire.asSaved = jest.fn(() => emptySavedRepertoire);

      persistantStorage.blackRepertoire = repertoire;

      expect(store.set).toBeCalledWith("blackRepertoire", emptySavedRepertoire);
    });
  });

  describe("engineMetadata", () => {
    it("should get the saved engine metadata", () => {
      const metadata: EngineMetadata = {
        filePath: "path",
        name: "name",
        options: [],
      };
      store.get = jest.fn(() => metadata);

      const actual = persistantStorage.engineMetadata;

      expect(store.get).toBeCalledWith("engineMetadata");
      expect(actual).toBe(metadata);
    });

    it("should set the engine metadata", () => {
      const metadata: EngineMetadata = {
        filePath: "path",
        name: "name",
        options: [],
      };
      store.get = jest.fn(() => metadata);

      persistantStorage.engineMetadata = metadata;

      expect(store.set).toBeCalledWith("engineMetadata", metadata);
    });

    it("should delete the engine metadata if undefined", () => {
      persistantStorage.engineMetadata = undefined;

      expect(store.delete).toBeCalledWith("engineMetadata");
    });
  });

  describe("backupDirectory", () => {
    it("should get the stored backup directory", () => {
      const backupDirectory = "backups";
      store.get = jest.fn(() => backupDirectory);

      const actual = persistantStorage.backupDirectory;

      expect(store.get).toBeCalledWith("backupDirectory");
      expect(actual).toBe(backupDirectory);
    });

    it("should set the stored backup directory", () => {
      const backupDirectory = "backups";

      persistantStorage.backupDirectory = backupDirectory;

      expect(store.set).toBeCalledWith("backupDirectory", backupDirectory);
    });

    it("should set the stored backupManager", () => {
      const backupDirectory = "backups";
      store.get = jest.fn(() => backupDirectory);

      persistantStorage.backupDirectory = backupDirectory;

      expect(persistantStorage.backupManager).toBeDefined();
      if (persistantStorage.backupManager) {
        expect(persistantStorage.backupManager.backupFolder).toBe(
          backupDirectory
        );
      }
    });

    it("should set the stored backup directory if undefined", () => {
      persistantStorage.backupDirectory = undefined;

      expect(store.delete).toBeCalledWith("backupDirectory");
    });

    it("should unset the backup manager if undefined", () => {
      persistantStorage.backupManager = new BackupManager("", 0, 0, 0);

      persistantStorage.backupDirectory = undefined;

      expect(persistantStorage.backupManager).toBeUndefined();
    });
  });

  describe("dailyBackupLimit", () => {
    it("should get the stored daily backup limit", () => {
      const limit = 2;
      store.get = jest.fn(() => limit);

      const actual = persistantStorage.dailyBackupLimit;

      expect(store.get).toBeCalledWith("dailyBackupLimit");
      expect(actual).toBe(limit);
    });

    it("should set the stored daily backup limit", () => {
      const limit = 2;
      persistantStorage.backupManager = new BackupManager("", 0, 0, 0);

      persistantStorage.dailyBackupLimit = limit;

      expect(store.set).toBeCalledWith("dailyBackupLimit", limit);
      expect(persistantStorage.backupManager.dailyLimit).toBe(limit);
    });
  });

  describe("monthlyBackupLimit", () => {
    it("should get the stored monthly backup limit", () => {
      const limit = 2;
      store.get = jest.fn(() => limit);

      const actual = persistantStorage.monthlyBackupLimit;

      expect(store.get).toBeCalledWith("monthlyBackupLimit");
      expect(actual).toBe(limit);
    });

    it("should set the stored monthly backup limit", () => {
      const limit = 2;
      persistantStorage.backupManager = new BackupManager("", 0, 0, 0);

      persistantStorage.monthlyBackupLimit = limit;

      expect(store.set).toBeCalledWith("monthlyBackupLimit", limit);
      expect(persistantStorage.backupManager.monthlyLimit).toBe(limit);
    });
  });

  describe("yearlyBackupLimit", () => {
    it("should get the stored yearly backup limit", () => {
      const limit = 2;
      store.get = jest.fn(() => limit);

      const actual = persistantStorage.yearlyBackupLimit;

      expect(store.get).toBeCalledWith("yearlyBackupLimit");
      expect(actual).toBe(limit);
    });

    it("should set the stored yearly backup limit", () => {
      const limit = 2;
      persistantStorage.backupManager = new BackupManager("", 0, 0, 0);

      persistantStorage.yearlyBackupLimit = limit;

      expect(store.set).toBeCalledWith("yearlyBackupLimit", limit);
      expect(persistantStorage.backupManager.yearlyLimit).toBe(limit);
    });
  });

  describe("moveAnimationSpeed", () => {
    it("should get the stored move animation speed", () => {
      const speed = 2;
      store.get = jest.fn(() => speed);

      const actual = persistantStorage.moveAnimationSpeed;

      expect(store.get).toBeCalledWith("moveAnimationSpeed");
      expect(actual).toBe(speed);
    });

    it("should set the stored move animation speed", () => {
      const speed = 2;

      persistantStorage.moveAnimationSpeed = speed;

      expect(store.set).toBeCalledWith("moveAnimationSpeed", speed);
    });
  });

  describe("enableBackups", () => {
    it.each([true, false])(
      "should get the stored enable backups setting",
      enableBackups => {
        store.get = jest.fn(() => enableBackups);

        const actual = persistantStorage.enableBackups;

        expect(store.get).toBeCalledWith("enableBackups");
        expect(actual).toBe(enableBackups);
      }
    );

    it.each([true, false])(
      "should set the stored enable backups setting",
      enableBackups => {
        persistantStorage.enableBackups = enableBackups;

        expect(store.set).toBeCalledWith("enableBackups", enableBackups);
      }
    );
  });

  describe("serialize", () => {
    it("should get the persisted file content", () => {
      const content = "content";
      (fs.readFileSync as jest.Mock) = jest.fn(() => content);

      const serialized = persistantStorage.serialize();

      expect(serialized).toBe(content);
    });
  });

  describe("backup", () => {
    it("should saveBackup with the serialized storage", async () => {
      store.get = () => true;
      const content = "content";
      const serialize = () => content;
      const backupManager = new BackupManager("", 0, 0, 0);
      persistantStorage.serialize = serialize;
      persistantStorage.backupManager = backupManager;
      let serializer = () => "";
      backupManager.SaveBackup = (fn: () => string) => (serializer = fn);

      await persistantStorage.backup();
      const actualContent = serializer();

      expect(actualContent).toEqual(content);
    });

    it("should not saveBackup when enable backups is false", async () => {
      store.get = () => false;
      const backupManager = new BackupManager("", 0, 0, 0);
      persistantStorage.backupManager = backupManager;

      await persistantStorage.backup();

      expect(backupManager.SaveBackup).not.toBeCalled();
    });

    it("should backup any changes", () => {
      const storage = new PersistantStorage(store);
      storage.backup = jest.fn();

      storage.darkMode = true;

      expect(storage.backup).toBeCalled();
    });
  });

  describe("clear", () => {
    it("should clear the store", () => {
      persistantStorage.clear();

      expect(store.clear).toBeCalled();
    });
  });
});
