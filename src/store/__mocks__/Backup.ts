import _ from "lodash";

import * as Real from "@/store/Backup";

export class Backup implements Real.Backup {
  filePath: string;
  age: number;
  delete: () => Promise<void>;
  save: (content: string) => Promise<void>;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.age = _.parseInt(this.filePath.split("-")[1]);
    this.delete = jest.fn();
    this.save = jest.fn();
  }
}
