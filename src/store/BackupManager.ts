import fs from "graceful-fs";
import path from "path";
import _ from "lodash";

import { Backup } from "./Backup";

export const day = 24 * 60 * 60 * 1000;
export const month = day * 31;
export const year = day * 365;

export class BackupManager {
  backupFolder: string;
  dailyBackups: Backup[];
  monthlyBackups: Backup[];
  yearlyBackups: Backup[];
  dailyLimit: number;
  monthlyLimit: number;
  yearlyLimit: number;

  constructor(
    backupFolder: string,
    dailyLimit: number,
    monthlyLimit: number,
    yearlyLimit: number,
    listDirectory = BackupManager.defaultListDirectory
  ) {
    this.backupFolder = backupFolder;
    this.dailyBackups = this.discoverBackups("daily", listDirectory);
    this.monthlyBackups = this.discoverBackups("monthly", listDirectory);
    this.yearlyBackups = this.discoverBackups("yearly", listDirectory);
    this.dailyLimit = dailyLimit;
    this.monthlyLimit = monthlyLimit;
    this.yearlyLimit = yearlyLimit;
  }

  private static defaultListDirectory = (directory: string): string[] =>
    fs.readdirSync(directory);

  private discoverBackups(
    frequency: string,
    listDirectory = BackupManager.defaultListDirectory
  ): Backup[] {
    const files = listDirectory(path.join(this.backupFolder, frequency));
    return _.map(files, file => new Backup(file));
  }

  SaveBackup(
    content: string,
    now = _.now,
    createBackup = (filePath: string) => new Backup(filePath)
  ): void {
    const fileName = `settings-${now()}.json`;
    let backup: Backup;

    if (this.dailyLimit) {
      backup = createBackup(path.join(this.backupFolder, "daily", fileName));
      this.dailyBackups.push(backup);
      backup.save(content);
    }

    if (this.monthlyLimit) {
      backup = createBackup(path.join(this.backupFolder, "monthly", fileName));
      this.monthlyBackups.push(backup);
      backup.save(content);
    }

    if (this.yearlyLimit) {
      backup = createBackup(path.join(this.backupFolder, "yearly", fileName));
      this.yearlyBackups.push(backup);
      backup.save(content);
    }
  }
}
