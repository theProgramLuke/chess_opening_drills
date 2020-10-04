import _ from "lodash";
import { Guid } from "guid-typescript";

import { TagTree } from "@/store/repertoire/TagTree";

describe("TagTree", () => {
  describe("removeTag", () => {
    it("should delete a tag and all of its successors", () => {
      const fenToDelete = "delete me";
      const tree = new TagTree("root", "", _.uniqueId(), [
        new TagTree("a", "", _.uniqueId(), [])
      ]);
      const expected = _.cloneDeep(tree);
      tree.children.push(
        new TagTree("b", fenToDelete, "", [
          new TagTree("c", "", _.uniqueId(), [])
        ])
      );

      tree.removeTag(fenToDelete);

      expect(tree).toEqual(expected);
    });
  });

  describe("addTag", () => {
    it("should add a tag with a random GUID id and the given name and fen", () => {
      const name = "name";
      const fen = "fen";
      const id = "some guid";
      const parent = new TagTree("root", _.uniqueId(), _.uniqueId(), []);
      const expected = new TagTree(name, fen, id, []);
      (Guid.create as jest.Mock).mockReturnValueOnce(id);

      parent.addTag(name, fen);

      expect(parent.children).toEqual([expected]);
    });
  });
});
