import _ from "lodash";
import { Guid } from "guid-typescript";

import {
  RepertoireTag,
  removeTag,
  addTag
} from "@/store/repertoire/RepertoireTag";

describe("removeTag", () => {
  it("should delete a tag and all of its successors", () => {
    const tagToDelete = "delete me";
    const tree: RepertoireTag = {
      name: "root",
      fen: "",
      id: _.uniqueId(),
      children: [
        {
          name: "a",
          fen: "",
          id: _.uniqueId(),
          children: []
        }
      ]
    };
    const expected = _.cloneDeep(tree);
    tree.children.push({
      name: "b",
      fen: "",
      id: tagToDelete,
      children: [
        {
          name: "c",
          fen: "",
          id: _.uniqueId(),
          children: []
        }
      ]
    });

    removeTag(tree, tagToDelete);

    expect(tree).toEqual(expected);
  });
});

describe("addTag", () => {
  it("should add a tag with a random GUID id and the given name and fen", () => {
    const name = "name";
    const fen = "fen";
    const id = "some guid";
    const parent: RepertoireTag = {
      name: "root",
      fen: _.uniqueId(),
      id: _.uniqueId(),
      children: []
    };
    const expected = _.cloneDeep(parent);
    expected.children.push({
      name,
      fen,
      id,
      children: []
    });
    (Guid.create as jest.Mock).mockReturnValueOnce(id);

    addTag(parent, parent.id, name, fen);

    expect(parent).toEqual(expected);
  });
});
