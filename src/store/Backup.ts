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

  delete(deleteFile = _.partialRight(fs.unlink, _.noop)): void {
    deleteFile(this.filePath);
  }

  save(
    content: string,
    writeFile = _.partialRight(fs.writeFile, _.noop),
    makeDirectory = _.partialRight(fs.mkdirSync, { recursive: true })
  ): void {
    makeDirectory(path.dirname(this.filePath));
    writeFile(this.filePath, content);
  }
}
