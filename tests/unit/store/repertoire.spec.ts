import _ from "lodash";

import { Repertoire } from "@/store/repertoire";
import { RepertoirePosition } from "@/store/repertoirePosition";
import {
  ResetTestRepertoire,
  repertoire,
  start,
  e3,
  e3e6,
  e3e6d3,
  d3,
  d3e6,
  LinkTestPositions,
  ExpectedSavedRepertoire
} from "./testDataRepertoire";
import { RepertoireTag } from "@/store/repertoireTag";

beforeEach(() => {
  ResetTestRepertoire();
});

describe("Repertoire", () => {
  describe("AsSaved", () => {
    it("transforms to a saved repertoire", () => {
      LinkTestPositions();

      const saved = repertoire.AsSaved();

      expect(saved).toEqual(ExpectedSavedRepertoire);
    });
  });

  describe("FromSaved", () => {
    it("generates a real repertoire from a saved one", () => {
      LinkTestPositions();

      const loaded = Repertoire.FromSaved(ExpectedSavedRepertoire);

      expect(loaded).toEqual(repertoire);
      expect(loaded.positions[0].GetTurnLists).toBeDefined();
    });

    it("wip", () => {
      const rep = new Repertoire([start], []);

      const loaded = Repertoire.FromSaved(rep.AsSaved());

      expect(loaded).toEqual(rep);
      expect(loaded.positions[0].GetTurnLists).toBeDefined();
    });
  });

  describe("AddMoves", () => {
    it("adds position given position not in repertoire positions", () => {
      repertoire.AddMove(start, e3);

      expect(repertoire.positions).toEqual([start, e3.position]);
    });

    it("adds the move as a child of the parent", () => {
      const repertoire = new Repertoire([start], []);

      repertoire.AddMove(start, e3);

      expect(start.children).toEqual([e3]);
    });

    it("does not add duplicate position given a transposition", () => {
      LinkTestPositions();

      _.forEach(
        [
          start,
          e3.position,
          e3e6.position,
          e3e6d3.position,
          d3.position,
          d3e6.position
        ],
        (position: RepertoirePosition) =>
          expect(repertoire.positions).toContain(position)
      );
    });
  });

  describe("NextRepertoireTagId", () => {
    it("gets an incrementing id", () => {
      LinkTestPositions();

      const nextId = repertoire.NextRepertoireTagId();

      expect(nextId).toBe(3);
    });
  });
});
