import _ from "lodash";
import { Guid } from "guid-typescript";

import { TagTree, SavedTagTree } from "@/store/repertoire/TagTree";

describe("TagTree", () => {
  describe("removeTag", () => {
    it("should delete a tag and all of its successors", () => {
      const fenToDelete = "delete me";
      const tree = new TagTree(
        "root",
        "",
        [new TagTree("a", "", [], _.uniqueId())],
        _.uniqueId()
      );
      const expected = _.cloneDeep(tree);
      tree.children.push(
        new TagTree(
          "b",
          fenToDelete,
          [new TagTree("c", "", [], _.uniqueId())],
          ""
        )
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
      const parent = new TagTree("root", _.uniqueId(), [], _.uniqueId());
      const expected = new TagTree(name, fen, [], id);
      (Guid.create as jest.Mock).mockReturnValueOnce(id);

      parent.addTag(name, fen);

      expect(parent.children).toEqual([expected]);
    });
  });

  describe("asSaved/fromSaved", () => {
    it("should create and restore a tag tree", () => {
      const saved: SavedTagTree = {
        name: "name0",
        fen: "fen0",
        id: "id0",
        children: [
          { name: "name1", fen: "fen1", id: "id1", children: [] },
          { name: "name2", fen: "fen2", id: "id2", children: [] }
        ]
      };

      const restored = TagTree.fromSaved(saved);
      const actual = restored.asSaved();

      expect(actual).toEqual(saved);
    });
  });
});
