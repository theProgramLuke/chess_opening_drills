import _ from "lodash";

import { Repertoire, SavedRepertoire } from "@/store/repertoire/Repertoire";
import { TagTree } from "@/store/repertoire/TagTree";
import { PositionCollection } from "@/store/repertoire/PositionCollection";
import { Side } from "@/store/side";

jest.mock("@/store/repertoire/PositionCollection");
jest.mock("@/store/repertoire/TagTree");
jest.mock("@/store/repertoire/RepetitionTraining");

describe("Repertoire", () => {
  describe("asSaved", () => {
    it("should save the repertoire", () => {
      const savedPositions = { saved: "positions" };
      const expectedPositions = new PositionCollection({});
      (expectedPositions.asSaved as jest.Mock).mockReturnValue(savedPositions);
      const expectedTags: TagTree[] = [
        new TagTree("name0", "fen0", "id0", [
          new TagTree("name1", "fen3", "id1", []),
          new TagTree("name2", "fen3", "id2", [])
        ]),
        new TagTree("name3", "fen3", "id3", [])
      ];
      const expected: SavedRepertoire = {
        positions: savedPositions,
        tags: expectedTags,
        sideToTrain: Side.White,
        name: "my white repertoire"
      };
      const repertoire = new Repertoire(
        expected.name,
        expected.sideToTrain,
        _.cloneDeep(expectedPositions),
        _.cloneDeep(expectedTags)
      );

      const actual = repertoire.asSaved();

      expect(actual).toEqual(expected);
    });
  });
});
