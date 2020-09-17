import fs from "graceful-fs";
import path from "path";
import _ from "lodash";

import { Backup } from "@/store/Backup";

export const day = 24 * 60 * 60 * 1000;
export const month = day * 31;
export const year = day * 365;

const lastBackupAge = (backups: Backup[]): number => {
  return _.min(_.map(backups, backup => backup.age)) || 0;
};

const trimBackups = (backups: Backup[], limit: number): Backup[] => {
  const sorted = _.sortBy(backups, backup => 0 - backup.age);

  while (sorted.length > limit) {
    const toDelete = sorted.pop();
    if (toDelete) {
      toDelete.delete();
    }
  }

  return sorted;
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
    yearlyLimit: number
  ) {
    this.backupFolder = backupFolder;
    this.dailyBackups = this.discoverBackups("daily");
    this.monthlyBackups = this.discoverBackups("monthly");
    this.yearlyBackups = this.discoverBackups("yearly");
    this.dailyLimit = dailyLimit;
    this.monthlyLimit = monthlyLimit;
    this.yearlyLimit = yearlyLimit;

    this.dailyBackups = trimBackups(this.dailyBackups, this.dailyLimit);
    this.monthlyBackups = trimBackups(this.monthlyBackups, this.monthlyLimit);
    this.yearlyBackups = trimBackups(this.yearlyBackups, this.yearlyLimit);
  }

  private discoverBackups(frequency: string): Backup[] {
    try {
      const files = fs.readdirSync(path.join(this.backupFolder, frequency));
      return _.map(files, file => new Backup(file));
    } catch {
      return [];
    }
  }

  SaveBackup(getContent: () => string, now = _.now): void {
    const fileName = `settings-${now()}.json`;
    let backup: Backup;

    if (this.dailyLimit && now() - lastBackupAge(this.dailyBackups) >= day) {
      backup = new Backup(path.join(this.backupFolder, "daily", fileName));
      this.dailyBackups.push(backup);
      backup.save(getContent());
      this.dailyBackups = trimBackups(this.dailyBackups, this.dailyLimit);
    }

    if (
      this.monthlyLimit &&
      now() - lastBackupAge(this.monthlyBackups) >= month
    ) {
      backup = new Backup(path.join(this.backupFolder, "monthly", fileName));
      this.monthlyBackups.push(backup);
      backup.save(getContent());
      this.monthlyBackups = trimBackups(this.monthlyBackups, this.monthlyLimit);
    }

    if (this.yearlyLimit && now() - lastBackupAge(this.yearlyBackups) >= year) {
      backup = new Backup(path.join(this.backupFolder, "yearly", fileName));
      this.yearlyBackups.push(backup);
      backup.save(getContent());
      this.yearlyBackups = trimBackups(this.yearlyBackups, this.yearlyLimit);
    }
  }
}
