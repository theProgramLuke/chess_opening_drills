import path from "path";
import _ from "lodash";

import { BackupManager } from "@/store/BackupManager";
import { Backup } from "@/store/Backup";

describe("BackupManager", () => {
  const now = 2001000;
  const backupFolder = "backups";
  const dailyDirectory = path.join(backupFolder, "daily");
  const monthlyDirectory = path.join(backupFolder, "monthly");
  const yearlyDirectory = path.join(backupFolder, "yearly");
  const directoryBackups: { [key: string]: string[] } = {};
  const listDirectory = (directory: string) => directoryBackups[directory];

  const createMockedBackup = (filePath: string): Backup => {
    const backup = new Backup(filePath);
    backup.save = jest.fn();
    return backup;
  };

  describe("constructor", () => {
    it("should discover any existing backups from the filesystem", () => {
      directoryBackups[dailyDirectory] = ["daily0", "daily1"];
      directoryBackups[monthlyDirectory] = ["monthly0"];
      directoryBackups[yearlyDirectory] = [];
      const expectedDailyBackups = _.map(
        directoryBackups[dailyDirectory],
        name => new Backup(name)
      );
      const expectedMonthlyBackups = _.map(
        directoryBackups[monthlyDirectory],
        name => new Backup(name)
      );
      const expectedYearlyBackups = _.map(
        directoryBackups[yearlyDirectory],
        name => new Backup(name)
      );

      const manager = new BackupManager(backupFolder, 0, 0, 0, listDirectory);

      expect(manager.dailyBackups).toEqual(expectedDailyBackups);
      expect(manager.monthlyBackups).toEqual(expectedMonthlyBackups);
      expect(manager.yearlyBackups).toEqual(expectedYearlyBackups);
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
        jest.fn(() => [])
      );
      const content = "some content";

      manager.SaveBackup(
        content,
        jest.fn(() => now),
        createMockedBackup
      );
      const getActualFiles = (backups: Backup[]) =>
        _.map(backups, backup => backup.filePath);
      const dailyBackupFiles = getActualFiles(manager.dailyBackups);
      const monthlyBackupFiles = getActualFiles(manager.monthlyBackups);
      const yearlyBackupFiles = getActualFiles(manager.yearlyBackups);

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
        jest.fn(() => [])
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

    it(
      "should save a daily backup if it has been a day since the last backup",
      _.noop
    );

    it(
      "should save a month backup if it has been a month since the last backup",
      _.noop
    );

    it(
      "should save a year backup if it has been a year since the last backup",
      _.noop
    );

    it.each(["daily", "monthly", "yearly"])(
      "should delete the oldest %s backups if there are more than the limit",
      _.noop
    );
  });
});
