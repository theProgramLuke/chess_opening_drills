import ElectronStore from "electron-store";
import _ from "lodash";
import fs from "graceful-fs";
import path from "path";

import { RepertoireTag } from "./repertoireTag";
import { Side } from "./side";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Repertoire, SavedRepertoire } from "./repertoire";
import { EngineMetadata } from "./EngineHelpers";
import { BackupManager } from "./BackupManager";
import electron from "electron";

export interface SavedStorage {
  darkMode: boolean;
  primary: string;
  secondary: string;
  accent: string;
  error: string;
  warning: string;
  info: string;
  success: string;
  boardTheme: string;
  pieceTheme: string;
  whiteRepertoire: SavedRepertoire;
  blackRepertoire: SavedRepertoire;
  engineMetadata?: EngineMetadata;
  backupDirectory?: string;
  dailyBackupLimit: number;
  monthlyBackupLimit: number;
  yearlyBackupLimit: number;
}

export interface Storage {
  darkMode: boolean;
  primary: string;
  secondary: string;
  accent: string;
  error: string;
  warning: string;
  info: string;
  success: string;
  boardTheme: string;
  pieceTheme: string;
  whiteRepertoire: Repertoire;
  blackRepertoire: Repertoire;
  engineMetadata?: EngineMetadata;
  backupDirectory?: string;
  dailyBackupLimit: number;
  monthlyBackupLimit: number;
  yearlyBackupLimit: number;
}

function GetDefaultStorage() {
  const whiteStartPosition = new RepertoirePosition(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    "",
    Side.White,
    true
  );

  const blackStartPosition = new RepertoirePosition(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    "",
    Side.Black,
    false
  );

  const defaultCwd = (electron.app || electron.remote.app).getPath("userData");

  return new ElectronStore<SavedStorage>({
    defaults: {
      darkMode: false,
      primary: "#2196F3",
      secondary: "#424242",
      accent: "#FF4081",
      error: "#FF5252",
      warning: "#FFC107",
      info: "#2196F3",
      success: "#4CAF50",
      boardTheme: "maple",
      pieceTheme: "staunty",
      whiteRepertoire: new Repertoire(
        [whiteStartPosition],
        [
          new RepertoireTag(
            Side.White,
            "White",
            whiteStartPosition,
            whiteStartPosition.fen,
            [],
            "whiteStart"
          )
        ]
      ).AsSaved(),
      blackRepertoire: new Repertoire(
        [blackStartPosition],
        [
          new RepertoireTag(
            Side.Black,
            "Black",
            blackStartPosition,
            blackStartPosition.fen,
            [],
            "blackStart"
          )
        ]
      ).AsSaved(),
      backupDirectory: path.join(defaultCwd, "backups"),
      dailyBackupLimit: 14,
      monthlyBackupLimit: 6,
      yearlyBackupLimit: 3
    }
  });
}

export class PersistantStorage implements Storage {
  storage: ElectronStore<SavedStorage>;
  backupManager?: BackupManager;
  createBackupManager: (
    filePath: string,
    dailyBackupLimit: number,
    monthlyBackupLimit: number,
    yearlyBackupLimit: number
  ) => BackupManager;

  constructor(
    storage?: ElectronStore<SavedStorage>,
    createBackupManager = (
      filePath: string,
      dailyBackupLimit: number,
      monthlyBackupLimit: number,
      yearlyBackupLimit: number
    ) =>
      new BackupManager(
        filePath,
        dailyBackupLimit,
        monthlyBackupLimit,
        yearlyBackupLimit
      )
  ) {
    this.storage = storage || GetDefaultStorage();
    this.createBackupManager = createBackupManager;
    this.initializeBackupManagement();
  }

  private initializeBackupManagement(): void {
    if (this.backupDirectory) {
      this.backupManager = this.createBackupManager(
        this.backupDirectory,
        this.dailyBackupLimit,
        this.monthlyBackupLimit,
        this.yearlyBackupLimit
      );
    }
  }

  backup(): void {
    if (this.backupManager) {
      this.backupManager.SaveBackup(this.serialize());
    }
  }

  setStorage<Key extends keyof SavedStorage>(
    key: Key,
    value?: SavedStorage[Key]
  ): void {
    this.storage.set(key, value);
    this.backup();
  }

  get darkMode(): boolean {
    return this.storage.get("darkMode");
  }

  set darkMode(value: boolean) {
    this.setStorage("darkMode", value);
  }

  get primary(): string {
    return this.storage.get("primary");
  }

  set primary(value: string) {
    this.setStorage("primary", value);
  }

  get secondary(): string {
    return this.storage.get("secondary");
  }

  set secondary(value: string) {
    this.setStorage("secondary", value);
  }

  get accent(): string {
    return this.storage.get("accent");
  }

  set accent(value: string) {
    this.setStorage("accent", value);
  }

  get error(): string {
    return this.storage.get("error");
  }

  set error(value: string) {
    this.setStorage("error", value);
  }

  get warning(): string {
    return this.storage.get("warning");
  }

  set warning(value: string) {
    this.setStorage("warning", value);
  }

  get info(): string {
    return this.storage.get("info");
  }

  set info(value: string) {
    this.setStorage("info", value);
  }

  get success(): string {
    return this.storage.get("success");
  }

  set success(value: string) {
    this.setStorage("success", value);
  }

  get boardTheme(): string {
    return this.storage.get("boardTheme");
  }

  set boardTheme(value: string) {
    this.setStorage("boardTheme", value);
  }

  get pieceTheme(): string {
    return this.storage.get("pieceTheme");
  }

  set pieceTheme(value: string) {
    this.setStorage("pieceTheme", value);
  }

  get whiteRepertoire(): Repertoire {
    return Repertoire.FromSaved(this.storage.get("whiteRepertoire"));
  }

  set whiteRepertoire(value: Repertoire) {
    this.setStorage("whiteRepertoire", value.AsSaved());
  }

  get blackRepertoire(): Repertoire {
    return Repertoire.FromSaved(this.storage.get("blackRepertoire"));
  }

  set blackRepertoire(value: Repertoire) {
    this.setStorage("blackRepertoire", value.AsSaved());
  }

  get engineMetadata(): EngineMetadata | undefined {
    return this.storage.get("engineMetadata");
  }

  set engineMetadata(engineMetadata: EngineMetadata | undefined) {
    if (engineMetadata) {
      this.setStorage("engineMetadata", engineMetadata);
    } else {
      this.storage.delete("engineMetadata");
    }
  }

  get backupDirectory(): string | undefined {
    return this.storage.get("backupDirectory");
  }

  set backupDirectory(backupDirectory: string | undefined) {
    this.backupManager = undefined;
    if (backupDirectory) {
      this.setStorage("backupDirectory", backupDirectory);
      this.initializeBackupManagement();
    } else {
      this.storage.delete("backupDirectory");
    }
  }

  get dailyBackupLimit(): number {
    return this.storage.get("dailyBackupLimit");
  }

  set dailyBackupLimit(limit: number) {
    this.setStorage("dailyBackupLimit", limit);
    if (this.backupManager) {
      this.backupManager.dailyLimit = limit;
    }
  }

  get monthlyBackupLimit(): number {
    return this.storage.get("monthlyBackupLimit");
  }

  set monthlyBackupLimit(limit: number) {
    this.setStorage("monthlyBackupLimit", limit);
    if (this.backupManager) {
      this.backupManager.monthlyLimit = limit;
    }
  }

  get yearlyBackupLimit(): number {
    return this.storage.get("yearlyBackupLimit");
  }

  set yearlyBackupLimit(limit: number) {
    this.setStorage("yearlyBackupLimit", limit);
    if (this.backupManager) {
      this.backupManager.yearlyLimit = limit;
    }
  }

  serialize(
    readFile = (filePath: string): string =>
      fs.readFileSync(filePath, { encoding: "utf8" })
  ): string {
    return readFile(this.storage.path);
  }

  clear(): void {
    this.storage.clear();
  }
}
