import _ from "lodash";

import { Backup } from "@/store/Backup";

describe("Backup", () => {
  describe("age", () => {
    it("should get the age of the backup file from a timestamp appended to the name", () => {
      const age = _.now();
      const backup = new Backup(`settings-${age}.json`);

      const actual = backup.age();

      expect(actual).toEqual(age);
    });
  });

  describe("save", () => {
    it("should write the content to the filepath", () => {
      const saveFile = jest.fn();
      const content = "some content";
      const filePath = "not a real file path";
      const backup = new Backup(filePath);

      backup.save(content, saveFile);

      expect(saveFile).toBeCalledWith(filePath, content);
    });
  });

  describe("delete", () => {
    it("should delete the backup file", () => {
      const deleteFile = jest.fn();
      const filePath = "not a real file path";
      const backup = new Backup(filePath);

      backup.delete(deleteFile);

      expect(deleteFile).toBeCalledWith(filePath);
    });
  });
});
