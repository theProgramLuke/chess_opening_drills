import _ from "lodash";
import fs from "graceful-fs";
import path from "path";

export const AgeSeparator = "-";

export class Backup {
  filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  age(): number {
    // _.parseInt ignores the .json
    return _.parseInt(this.filePath.split(AgeSeparator)[1]);
  }

  delete(deleteFile = fs.unlinkSync): void {
    deleteFile(this.filePath);
  }

  save(
    content: string,
    writeFile = fs.writeFileSync,
    makeDirectory = fs.mkdirSync
  ): void {
    makeDirectory(path.dirname(this.filePath));
    writeFile(this.filePath, content);
  }
}
