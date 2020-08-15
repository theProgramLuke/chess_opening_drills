import _ from "lodash";

import { Repertoire } from "@/store/repertoire";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Side } from "@/store/side";
import { Move } from "@/store/move";

describe("Repertoire", () => {
  describe("AddMoves", () => {
    it("adds position given position not in repertoire positions", () => {
      const start = new RepertoirePosition(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        true,
        "",
        Side.White
      );
      const e3 = new RepertoirePosition(
        "rnbqkbnr/pppppppp/8/8/8/4P3/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
        false,
        "",
        Side.White
      );
      const repertoire = new Repertoire([start], []);

      repertoire.AddMove(start, new Move("e3", e3));

      expect(repertoire.positions).toEqual([start, e3]);
    });

    it("adds the move as a child of the parent", () => {
      const start = new RepertoirePosition(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        true,
        "",
        Side.White
      );
      const e3 = new Move(
        "e3",
        new RepertoirePosition(
          "rnbqkbnr/pppppppp/8/8/8/4P3/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
          false,
          "",
          Side.White
        )
      );
      // start.AddChild = jest.fn();
      const repertoire = new Repertoire([start], []);

      repertoire.AddMove(start, e3);

      expect(start.children).toEqual([e3]);
    });

    it("does not add duplicate position given a transposition", () => {
      const start = new RepertoirePosition(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        true,
        "",
        Side.White
      );
      const e3 = new RepertoirePosition(
        "rnbqkbnr/pppppppp/8/8/8/4P3/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
        false,
        "",
        Side.White
      );
      const d3 = new RepertoirePosition(
        "rnbqkbnr/pppppppp/8/8/8/3P4/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
        false,
        "",
        Side.White
      );
      const e3e6 = new RepertoirePosition(
        "rnbqkbnr/pppp1ppp/4p3/8/8/4P3/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
        true,
        "",
        Side.White
      );
      const d3e6 = new RepertoirePosition(
        "rnbqkbnr/pppp1ppp/4p3/8/8/3P4/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
        true,
        "",
        Side.White
      );
      const d3e6e3 = new RepertoirePosition(
        "rnbqkbnr/pppp1ppp/4p3/8/8/3PP3/PPP2PPP/RNBQKBNR b KQkq - 0 2",
        true,
        "",
        Side.White
      );
      const e3e6d3 = new RepertoirePosition(
        "rnbqkbnr/pppp1ppp/4p3/8/8/3PP3/PPP2PPP/RNBQKBNR b KQkq - 0 2",
        true,
        "",
        Side.White
      );
      const repertoire = new Repertoire([start], []);

      repertoire.AddMove(start, new Move("e3", e3)); // 1. e3
      repertoire.AddMove(e3, new Move("d6", e3e6)); // 1. e3 e6
      repertoire.AddMove(e3e6, new Move("d3", e3e6d3)); // 1. e3 e6 2. d3
      repertoire.AddMove(start, new Move("d3", d3)); // 1. d3
      repertoire.AddMove(d3, new Move("e6", d3e6)); // 1. d3 e6
      repertoire.AddMove(d3e6, new Move("e3", d3e6e3)); // 1. d3 e6 2. e3 (transposes)

      _.forEach([start, e3, e3e6, e3e6d3, d3, d3e6], position =>
        expect(repertoire.positions).toContain(position)
      );
    });
  });
});
