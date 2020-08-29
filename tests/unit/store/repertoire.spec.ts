import _ from "lodash";

import { Repertoire } from "@/store/repertoire";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { parsePgn } from "@/store/pgnParser";
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
  ExpectedSavedRepertoire,
  VariationC,
  VariationA
} from "./testDataRepertoire";

beforeEach(() => {
  ResetTestRepertoire();
});

describe("Repertoire", () => {
  describe("AsSaved", () => {
    it("transforms to a saved repertoire", () => {
      LinkTestPositions();

      const saved = repertoire.AsSaved();

      expect(saved).toMatchSnapshot();
    });
  });

  describe("FromSaved", () => {
    it("generates a real repertoire from a saved one", () => {
      LinkTestPositions();

      const loaded = Repertoire.FromSaved(repertoire.AsSaved());

      expect(loaded).toEqual(repertoire);
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

  describe("RemoveMove", () => {
    beforeEach(LinkTestPositions);

    it("deletes all orphaned child positions", () => {
      repertoire.RemoveMove(d3);

      expect(start.children.length).toBe(1);
      expect(repertoire.positions.length).toBe(6);
    });
  });

  describe("RemoveRepertoireTag", () => {
    it("should unlink a repertoire tag", () => {
      LinkTestPositions();

      repertoire.RemoveRepertoireTag(VariationC);

      expect(repertoire.tags[0].children).toEqual([VariationA]);
    });
  });

  describe("AddFromGame", () => {
    it("adds all game variations", () => {
      const parsedGame = parsePgn(
        '[White "me"]\n[Black "you"]\n1. e4 e5 (1. ...c5) *'
      )[0];
      const repertoire = new Repertoire([start], []);

      repertoire.AddFromGame(parsedGame);

      expect(_.map(start.children, child => child.san)).toEqual(["e4"]);
      expect(
        _.map(start.children[0].position.children, child => child.san)
      ).toEqual(["c5", "e5"]);
    });

    it("added positions can be removed", () => {
      const parsedGame = parsePgn(
        '[White "me"]\n[Black "you"]\n1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 (3... Nf6) *'
      )[0];
      const repertoire = new Repertoire([start], []);

      repertoire.AddFromGame(parsedGame);
      repertoire.RemoveMove(start.children[0]);

      expect(repertoire.positions.length).toEqual(1);
    });
  });
});
