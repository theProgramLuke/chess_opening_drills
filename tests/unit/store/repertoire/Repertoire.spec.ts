import _ from "lodash";

import { Repertoire, SavedRepertoire } from "@/store/repertoire/Repertoire";
import { PositionCollection } from "@/store/repertoire/PositionCollection";
import { Side } from "@/store/side";

jest.mock("@/store/repertoire/PositionCollection");
jest.mock("@/store/repertoire/TagTree");
jest.mock("@/store/repertoire/RepetitionTraining");

describe("Repertoire", () => {
  describe("asSaved", () => {
    it("should save the repertoire", () => {
      const expected: SavedRepertoire = {
        name: "my white repertoire",
        sideToTrain: Side.White,
        positions: new PositionCollection({}).asSaved(),
        tags: []
      };
      const repertoire = new Repertoire(_.cloneDeep(expected));

      const actual = repertoire.asSaved();

      expect(actual).toEqual(expected);
    });
  });
});
