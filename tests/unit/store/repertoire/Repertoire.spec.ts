import _ from "lodash";

import { Repertoire, SavedRepertoire } from "@/store/repertoire/Repertoire";
import { PositionCollection } from "@/store/repertoire/PositionCollection";
import { Side } from "@/store/side";
import { TrainingCollection } from "@/store/repertoire/TrainingCollection";

describe("Repertoire", () => {
  describe("asSaved", () => {
    it("should save the repertoire", () => {
      const expected: SavedRepertoire = {
        name: "my white repertoire",
        sideToTrain: Side.White,
        positions: new PositionCollection({}).asSaved(),
        tags: [],
        training: new TrainingCollection({}).asSaved()
      };
      const repertoire = new Repertoire(_.cloneDeep(expected));

      const actual = repertoire.asSaved();

      expect(actual).toEqual(expected);
    });
  });
});
