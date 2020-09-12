import fs from "graceful-fs";
import path from "path";
import _ from "lodash";

import { Backup } from "@/store/Backup";

export const day = 24 * 60 * 60 * 1000;
export const month = day * 31;
export const year = day * 365;

const lastBackupAge = (backups: Backup[]): number => {
  return _.min(_.map(backups, backup => backup.age())) || 0;
};

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
    listDirectory = (directory: string): string[] => fs.readdirSync(directory),
    createBackup = (filePath: string) => new Backup(filePath)
  ) {
    this.backupFolder = backupFolder;
    this.dailyBackups = this.discoverBackups(
      "daily",
      listDirectory,
      createBackup
    );
    this.monthlyBackups = this.discoverBackups(
      "monthly",
      listDirectory,
      createBackup
    );
    this.yearlyBackups = this.discoverBackups(
      "yearly",
      listDirectory,
      createBackup
    );
    this.dailyLimit = dailyLimit;
    this.monthlyLimit = monthlyLimit;
    this.yearlyLimit = yearlyLimit;
  }

  private discoverBackups(
    frequency: string,
    listDirectory: (directory: string) => string[],
    createBackup: (filePath: string) => Backup
  ): Backup[] {
    const files = listDirectory(path.join(this.backupFolder, frequency));
    return _.map(files, createBackup);
  }

  SaveBackup(
    content: string,
    now = _.now,
    createBackup = (filePath: string) => new Backup(filePath)
  ): void {
    const fileName = `settings-${now()}.json`;
    let backup: Backup;

    if (this.dailyLimit && now() - lastBackupAge(this.dailyBackups) >= day) {
      backup = createBackup(path.join(this.backupFolder, "daily", fileName));
      this.dailyBackups.push(backup);
      backup.save(content);
    }

    if (
      this.monthlyLimit &&
      now() - lastBackupAge(this.monthlyBackups) >= month
    ) {
      backup = createBackup(path.join(this.backupFolder, "monthly", fileName));
      this.monthlyBackups.push(backup);
      backup.save(content);
    }

    if (this.yearlyLimit && now() - lastBackupAge(this.yearlyBackups) >= year) {
      backup = createBackup(path.join(this.backupFolder, "yearly", fileName));
      this.yearlyBackups.push(backup);
      backup.save(content);
    }
  }
}