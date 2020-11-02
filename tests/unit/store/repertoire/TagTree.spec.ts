import _ from "lodash";
import { Guid } from "guid-typescript";

import { TagTree, SavedTagTree } from "@/store/repertoire/TagTree";

jest.mock("guid-typescript");

const guid = "some guid";
(Guid.create as jest.Mock).mockReturnValue(guid);

describe("TagTree", () => {
  describe("addTag", () => {
    it("should add a tag with a random GUID id and the given name and fen", () => {
      const name = "name";
      const fen = "fen";
      const parent = new TagTree("root", _.uniqueId(), [], true, _.uniqueId());
      const child = new TagTree(name, fen, []);

      parent.addTag(name, fen);

      expect(parent.children).toEqual([child]);
      expect(child.id).toBe(guid);
    });
  });

  describe("includesTag", () => {
    it("should be true if the tag id is the id", () => {
      const tag = new TagTree("", "", []);

      const actual = tag.includesTag(tag.id);

      expect(actual).toBeTruthy();
    });

    it("should be true if any of the children have the id", () => {
      const tag = new TagTree("", "", [
        new TagTree("", "", []),
        new TagTree("", "", []),
      ]);
      const id = "some id";
      tag.children[1].id = id;

      const actual = tag.includesTag(id);

      expect(actual).toBeTruthy();
    });

    it("should be false if the tag id is not the id, and no children have the id", () => {
      const tag = new TagTree("", "", [
        new TagTree("", "", []),
        new TagTree("", "", []),
      ]);

      const actual = tag.includesTag("not the guid");

      expect(actual).toBeFalsy();
    });
  });

  describe("removeTag", () => {
    it("should delete a tag and all of its successors", () => {
      const idToDelete = "delete me";
      const tree = new TagTree("root", "", [new TagTree("a", "", [])]);
      const expected = _.cloneDeep(tree);
      tree.children.push(
        new TagTree("b", "", [new TagTree("c", "", [])], false, idToDelete)
      );

      tree.removeTag(idToDelete);

      expect(tree).toEqual(expected);
    });
  });

  describe("asSaved/fromSaved", () => {
    it("should create and restore a tag tree", () => {
      const saved: SavedTagTree = {
        name: "name0",
        fen: "fen0",
        id: "id0",
        isRootTag: true,
        children: [
          {
            name: "name1",
            fen: "fen1",
            id: "id1",
            children: [],
            isRootTag: false,
          },
          {
            name: "name2",
            fen: "fen2",
            id: "id2",
            children: [],
            isRootTag: false,
          },
        ],
      };

      const restored = TagTree.fromSaved(saved);
      const actual = restored.asSaved();

      expect(actual).toEqual(saved);
    });
  });
});
