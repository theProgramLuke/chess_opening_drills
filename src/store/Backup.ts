import _ from "lodash";
import fs from "graceful-fs";
import path from "path";

export const AgeSeparator = "-";

export class Backup {
  filePath: string;
  age: number;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.age = _.parseInt(this.filePath.split(AgeSeparator)[1]);
  }

  async delete(): Promise<void> {
    await fs.unlink(this.filePath, _.noop);
  }

  async save(content: string): Promise<void> {
    await fs.mkdir(
      path.dirname(this.filePath),
      { recursive: true },
      async () => {
        await fs.writeFile(this.filePath, content, _.noop);
      }
    );
  }
}
