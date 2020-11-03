import _ from "lodash";
import path from "path";
import fs from "graceful-fs";

import { Backup } from "@/store/Backup";

jest.mock("graceful-fs");

describe("Backup", () => {
  describe("age", () => {
    it("should get the age of the backup file from a timestamp appended to the name", () => {
      const age = _.now();
      const backup = new Backup(`settings-${age}.json`);

      const actual = backup.age;

      expect(actual).toEqual(age);
    });
  });

  describe("save", () => {
    it("should write the content to the filepath", async () => {
      const content = "some content";
      const filePath = "not a real file path";
      const backup = new Backup(filePath);

      await backup.save(content);

      expect(fs.writeFile).toHaveBeenCalledWith(filePath, content, _.noop);
    });

    it("should try to create the directory", async () => {
      const filePath = "some/path/settings-0.json";
      const backup = new Backup(filePath);

      await backup.save("");

      expect(fs.mkdir).toBeCalledWith(
        path.dirname(filePath),
        {
          recursive: true,
        },
        expect.anything()
      );
    });
  });

  describe("delete", () => {
    it("should delete the backup file", async () => {
      const filePath = "not a real file path";
      const backup = new Backup(filePath);

      await backup.delete();

      expect(fs.unlink).toBeCalledWith(filePath, _.noop);
    });
  });
});
