import _ from "lodash";

import { Backup } from "@/store/Backup";

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
    yearlyLimit: number
  ) {
    this.backupFolder = backupFolder;
    this.dailyBackups = [];
    this.monthlyBackups = [];
    this.yearlyBackups = [];
    this.dailyLimit = dailyLimit;
    this.monthlyLimit = monthlyLimit;
    this.yearlyLimit = yearlyLimit;
    this.SaveBackup = jest.fn();
  }

  SaveBackup: (getContent: () => string, now?: () => number) => void;
}
