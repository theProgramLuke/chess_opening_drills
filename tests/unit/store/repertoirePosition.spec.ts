import _ from "lodash";

import { RepertoirePosition } from "@/store/repertoirePosition";
import { Side } from "@/store/side";
import { Move } from "@/store/move";

describe("RepertoirePosition", () => {
  describe("AddChild", () => {
    it("adds child and parent links", () => {
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

      start.AddChild(e3);

      expect(start.children).toEqual([e3]);
      expect(e3.position.parents).toContain(start);
    });
  });
});
