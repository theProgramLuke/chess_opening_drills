import path from "path";
import _ from "lodash";

import { BackupManager, day, month, year } from "@/store/BackupManager";
import { Backup } from "@/store/Backup";

describe("BackupManager", () => {
  const now = day + year + month;
  const backupFolder = "backups";
  const content = "some content";
  const dailyDirectory = path.join(backupFolder, "daily");
  const monthlyDirectory = path.join(backupFolder, "monthly");
  const yearlyDirectory = path.join(backupFolder, "yearly");
  const directoryBackups: { [key: string]: string[] } = {};

  const listDirectory = (directory: string) => directoryBackups[directory];

  const createMockedBackup = (filePath: string): Backup => {
    const backup = new Backup(filePath);
    backup.save = jest.fn();
    backup.delete = jest.fn();
    return backup;
  };

  const getBackupFiles = (backups: Backup[]) =>
    _.map(backups, backup => backup.filePath);

  beforeEach(() => {
    directoryBackups[dailyDirectory] = [];
    directoryBackups[monthlyDirectory] = [];
    directoryBackups[yearlyDirectory] = [];
  });

  describe("constructor", () => {
    it("should discover any existing backups from the filesystem", () => {
      directoryBackups[dailyDirectory] = ["daily-0", "daily-1"];
      directoryBackups[monthlyDirectory] = ["monthly-0"];
      directoryBackups[yearlyDirectory] = [];

      const manager = new BackupManager(
        backupFolder,
        0,
        0,
        0,
        listDirectory,
        createMockedBackup
      );
      const dailyBackups = getBackupFiles(manager.dailyBackups);
      const monthlyBackups = getBackupFiles(manager.monthlyBackups);
      const yearlyBackups = getBackupFiles(manager.yearlyBackups);

      expect(dailyBackups).toEqual(directoryBackups[dailyDirectory]);
      expect(monthlyBackups).toEqual(directoryBackups[monthlyDirectory]);
      expect(yearlyBackups).toEqual(directoryBackups[yearlyDirectory]);
    });
  });

  describe("SaveBackup", () => {
    it("should save a backups for each frequency if there are none existing", () => {
      const expectedDailyBackupFiles = [
        path.join(dailyDirectory, `settings-${now}.json`)
      ];
      const expectedMonthlyBackupFiles = [
        path.join(monthlyDirectory, `settings-${now}.json`)
      ];
      const expectedYearlyBackupFiles = [
        path.join(yearlyDirectory, `settings-${now}.json`)
      ];
      const manager = new BackupManager(
        backupFolder,
        1,
        1,
        1,
        jest.fn(() => []),
        createMockedBackup
      );

      manager.SaveBackup(
        content,
        jest.fn(() => now),
        createMockedBackup
      );
      const dailyBackupFiles = getBackupFiles(manager.dailyBackups);
      const monthlyBackupFiles = getBackupFiles(manager.monthlyBackups);
      const yearlyBackupFiles = getBackupFiles(manager.yearlyBackups);

      expect(dailyBackupFiles).toEqual(expectedDailyBackupFiles);
      expect(monthlyBackupFiles).toEqual(expectedMonthlyBackupFiles);
      expect(yearlyBackupFiles).toEqual(expectedYearlyBackupFiles);
      expect(manager.dailyBackups[0].save).toBeCalledWith(content);
      expect(manager.monthlyBackups[0].save).toBeCalledWith(content);
      expect(manager.yearlyBackups[0].save).toBeCalledWith(content);
    });

    it("should not save a backup if the limit is 0", () => {
      const manager = new BackupManager(
        backupFolder,
        0,
        0,
        0,
        jest.fn(() => []),
        createMockedBackup
      );
      const createBackup = jest.fn(() => createMockedBackup(""));

      manager.SaveBackup(
        "",
        jest.fn(() => now),
        createBackup
      );

      expect(manager.dailyBackups).toEqual([]);
      expect(manager.monthlyBackups).toEqual([]);
      expect(manager.yearlyBackups).toEqual([]);
      expect(createBackup).not.toBeCalled();
    });

    it("should save a daily backup if it has been a day since the last backup", () => {
      const old = `settings-${now - day}.json`;
      const expectedNew = path.join(dailyDirectory, `settings-${now}.json`);
      directoryBackups[dailyDirectory] = [old];
      const manager = new BackupManager(
        backupFolder,
        2,
        0,
        0,
        listDirectory,
        createMockedBackup
      );

      manager.SaveBackup(content, () => now, createMockedBackup);
      const backupFiles = getBackupFiles(manager.dailyBackups);

      expect(backupFiles).toEqual([old, expectedNew]);
    });

    it("should save a monthly backup if it has been a month since the last backup", () => {
      const old = `settings-${now - month}.json`;
      const expectedNew = path.join(monthlyDirectory, `settings-${now}.json`);
      directoryBackups[monthlyDirectory] = [old];
      const manager = new BackupManager(
        backupFolder,
        0,
        2,
        0,
        listDirectory,
        createMockedBackup
      );

      manager.SaveBackup(content, () => now, createMockedBackup);
      const backupFiles = getBackupFiles(manager.monthlyBackups);

      expect(backupFiles).toEqual([old, expectedNew]);
    });

    it("should save a yearly backup if it has been a year since the last backup", () => {
      const old = `settings-${now - year}.json`;
      const expectedNew = path.join(yearlyDirectory, `settings-${now}.json`);
      directoryBackups[yearlyDirectory] = [old];
      const manager = new BackupManager(
        backupFolder,
        0,
        0,
        2,
        listDirectory,
        createMockedBackup
      );

      manager.SaveBackup(content, () => now, createMockedBackup);
      const backupFiles = getBackupFiles(manager.yearlyBackups);

      expect(backupFiles).toEqual([old, expectedNew]);
    });

    it("should not save a daily backup if it has less than a day since the last backup", () => {
      const old = `settings-${now - (day - 1)}.json`;
      directoryBackups[dailyDirectory] = [old];
      const manager = new BackupManager(
        backupFolder,
        2,
        0,
        0,
        listDirectory,
        createMockedBackup
      );

      manager.SaveBackup(content, () => now, createMockedBackup);
      const backupFiles = getBackupFiles(manager.dailyBackups);

      expect(backupFiles).toEqual([old]);
    });

    it("should not save a monthly backup if it has less a month since the last backup", () => {
      const old = `settings-${now - (month - 1)}.json`;
      directoryBackups[monthlyDirectory] = [old];
      const manager = new BackupManager(
        backupFolder,
        0,
        2,
        0,
        listDirectory,
        createMockedBackup
      );

      manager.SaveBackup(content, () => now, createMockedBackup);
      const backupFiles = getBackupFiles(manager.monthlyBackups);

      expect(backupFiles).toEqual([old]);
    });

    it("should not save a yearly backup if it has less a year since the last backup", () => {
      const old = `settings-${now - (year - 1)}.json`;
      directoryBackups[yearlyDirectory] = [old];
      const manager = new BackupManager(
        backupFolder,
        0,
        0,
        2,
        listDirectory,
        createMockedBackup
      );

      manager.SaveBackup(content, () => now, createMockedBackup);
      const backupFiles = getBackupFiles(manager.yearlyBackups);

      expect(backupFiles).toEqual([old]);
    });

    it(
      "should delete the oldest %s backups if there are more than the limit",
      _.noop
    );
  });
});
