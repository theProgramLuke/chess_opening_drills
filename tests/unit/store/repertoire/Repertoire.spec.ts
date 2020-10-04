import _ from "lodash";

import { Repertoire, SavedRepertoire } from "@/store/repertoire/Repertoire";
import { TagTree } from "@/store/repertoire/TagTree";
import {
  PositionCollection,
  VariationMove
} from "@/store/repertoire/PositionCollection";

jest.mock("@/store/repertoire/PositionCollection");
jest.mock("@/store/repertoire/TagTree");

describe("Repertoire", () => {
  describe("asSaved", () => {
    it("should save the positions and tags", () => {
      const saved = { saved: "positions" };
      const expectedPositions = new PositionCollection({});
      (expectedPositions.asSaved as jest.Mock).mockReturnValue(saved);
      const expectedTags: TagTree[] = [
        new TagTree("name0", "fen0", "id0", [
          new TagTree("name1", "fen3", "id1", []),
          new TagTree("name2", "fen3", "id2", [])
        ]),
        new TagTree("name3", "fen3", "id3", [])
      ];
      const expected: SavedRepertoire = {
        positions: saved,
        tags: expectedTags
      };
      const repertoire = new Repertoire(
        _.cloneDeep(expectedPositions),
        _.cloneDeep(expectedTags)
      );

      const actual = repertoire.asSaved();

      expect(actual).toEqual(expected);
    });
  });

  describe("addMove", () => {
    it("should passthrough to the position collection", () => {
      const positions = new PositionCollection({});
      const expected = "resulting fen";
      const fen = "some fen";
      const san = "some san";
      (positions.addMove as jest.Mock).mockReturnValue(expected);
      const repertoire = new Repertoire(positions, []);

      const actual = repertoire.addMove(fen, san);

      expect(actual).toBe(expected);
      expect(positions.addMove).toBeCalledWith(fen, san);
    });
  });

  describe("deleteMove", () => {
    it("should passthrough to the position collection ", () => {
      const positions = new PositionCollection({});
      const expected = ["resulting fen0", "resulting fen1"];
      const fen = "some fen";
      const san = "some san";
      (positions.deleteMove as jest.Mock).mockReturnValue(expected);
      const repertoire = new Repertoire(positions, []);

      const actual = repertoire.deleteMove(fen, san);

      expect(actual).toBe(expected);
      expect(positions.deleteMove).toBeCalledWith(fen, san);
    });

    it("should delete tags of deleted positions", () => {
      const positions = new PositionCollection({});
      const tags = [
        new TagTree("name0", "fen0", "id0", []),
        new TagTree("name1", "fen1", "id1", [])
      ];
      const deletedFens = ["deleted fen0", "deleted fen1"];
      (positions.deleteMove as jest.Mock).mockReturnValue(deletedFens);
      const repertoire = new Repertoire(positions, tags);

      repertoire.deleteMove("fen", "some san");

      _.forEach(tags, tagTree =>
        _.forEach(deletedFens, deleted =>
          expect(tagTree.removeTag).toBeCalledWith(deleted)
        )
      );
    });
  });

  describe("movesFromPosition", () => {
    it("should passthrough to the position collection ", () => {
      const positions = new PositionCollection({});
      const expected: VariationMove[] = [
        { moveData: { san: "san" }, resultingFen: "fen" }
      ];
      const fen = "some fen";
      (positions.movesFromPosition as jest.Mock).mockReturnValue(expected);
      const repertoire = new Repertoire(positions, []);

      const actual = repertoire.movesFromPosition(fen);

      expect(actual).toBe(expected);
      expect(positions.movesFromPosition).toBeCalledWith(fen);
    });
  });

  describe("parentPositions", () => {
    it("should passthrough to the position collection ", () => {
      const positions = new PositionCollection({});
      const expected = ["parent fen0", "parent fen1"];
      const fen = "some fen";
      (positions.parentPositions as jest.Mock).mockReturnValue(expected);
      const repertoire = new Repertoire(positions, []);

      const actual = repertoire.parentPositions(fen);

      expect(actual).toBe(expected);
      expect(positions.parentPositions).toBeCalledWith(fen);
    });
  });

  describe("descendantPositions", () => {
    it("should passthrough to the position collection ", () => {
      const positions = new PositionCollection({});
      const expected = ["resulting fen0", "resulting fen1"];
      const fen = "some fen";
      (positions.descendantPositions as jest.Mock).mockReturnValue(expected);
      const repertoire = new Repertoire(positions, []);

      const actual = repertoire.descendantPositions(fen);

      expect(actual).toBe(expected);
      expect(positions.descendantPositions).toBeCalledWith(fen);
    });
  });

  describe("asPgn", () => {
    it("should passthrough to the position collection ", () => {
      const positions = new PositionCollection({});
      const expected = "pgn";
      const fen = "some fen";
      (positions.asPgn as jest.Mock).mockReturnValue(expected);
      const repertoire = new Repertoire(positions, []);

      const actual = repertoire.asPgn(fen);

      expect(actual).toBe(expected);
      expect(positions.asPgn).toBeCalledWith(fen);
    });
  });

  describe("loadPgn", () => {
    it("should passthrough to the position collection ", () => {
      const positions = new PositionCollection({});
      const fen = "some fen";
      const repertoire = new Repertoire(positions, []);

      repertoire.loadPgn(fen);

      expect(positions.loadPgn).toBeCalledWith(fen);
    });
  });

  describe("getVariations", () => {
    it("should passthrough to the position collection ", () => {
      const positions = new PositionCollection({});
      const expected: VariationMove[][] = [
        [{ moveData: { san: "san" }, resultingFen: "fen" }]
      ];
      const fen = "some fen";
      (positions.getVariations as jest.Mock).mockReturnValue(expected);
      const repertoire = new Repertoire(positions, []);

      const actual = repertoire.getVariations(fen);

      expect(actual).toBe(expected);
      expect(positions.getVariations).toBeCalledWith(fen);
    });
  });
});
