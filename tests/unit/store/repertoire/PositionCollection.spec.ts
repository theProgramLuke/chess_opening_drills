import _ from "lodash";

import {
  PositionCollection,
  DeleteMoveObserver,
  Variation,
  PositionData
} from "@/store/repertoire/PositionCollection";

const startPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -";

const graphOptions = {
  directed: true,
  multigraph: false,
  compound: false
};

const startingRepertoire = {
  options: graphOptions,
  nodes: [{ v: startPosition }],
  edges: []
};

function addMovesToRepertoire(
  repertoire: PositionCollection,
  moves: string[]
): Variation {
  const variation: Variation = [];
  let sourceFen = startPosition;

  _.forEach(moves, move => {
    const resultingFen = repertoire.addMove(sourceFen, move);

    variation.push({
      sourceFen,
      resultingFen,
      san: move
    });

    sourceFen = resultingFen;
  });

  return variation;
}

describe("PositionCollection", () => {
  describe("addMove", () => {
    it("should add the move as an outgoing move of the given position", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      const san = "e4";
      const expected: Variation = [
        { san, resultingFen: expect.anything(), sourceFen: startPosition }
      ];

      repertoire.addMove(startPosition, san);
      const actual = repertoire.movesFromPosition(startPosition);

      expect(actual).toEqual(expected);
    });

    it("should not add an illegal move", () => {
      const repertoire = new PositionCollection(startingRepertoire);

      repertoire.addMove(startPosition, "Ne4");
      const moves = repertoire.movesFromPosition(startPosition);

      expect(moves).toEqual([]);
    });

    it("should return the fen of the resulting move", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      const move = { san: "a3" };

      const actual = repertoire.addMove(startPosition, move.san);

      expect(actual).toEqual(
        "rnbqkbnr/pppppppp/8/8/8/P7/1PPPPPPP/RNBQKBNR b KQkq -"
      );
    });

    it("should add the resulting position with the correct FEN", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      const san = "a3";
      const expected: Variation = [
        {
          san: expect.anything(),
          resultingFen: "rnbqkbnr/pppppppp/8/8/8/P7/1PPPPPPP/RNBQKBNR b KQkq -",
          sourceFen: startPosition
        }
      ];

      repertoire.addMove(startPosition, san);
      const moves = repertoire.movesFromPosition(startPosition);

      expect(moves).toEqual(expected);
    });

    it("should add the move as an incoming move of the resulting position", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      const move = { san: "a3" };
      repertoire.addMove(startPosition, move.san);

      const parents = repertoire.parentPositions(
        "rnbqkbnr/pppppppp/8/8/8/P7/1PPPPPPP/RNBQKBNR b KQkq -"
      );

      expect(parents).toEqual([startPosition]);
    });

    it("should add a new parent to the resulting position if the resulting position already exists", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      let fen = repertoire.addMove(startPosition, "e4"); // 1. e4
      fen = repertoire.addMove(fen, "e5"); // 1. e4 e5
      fen = repertoire.addMove(fen, "d4"); // 1. e4 e5 2. d4
      fen = repertoire.addMove(startPosition, "d4"); // 1. d4
      fen = repertoire.addMove(fen, "e5"); // 1. d4 e5
      fen = repertoire.addMove(fen, "e4"); // 1. d4 e5 2. e4 { transposes }

      const parents = repertoire.parentPositions(fen);

      expect(parents).toEqual([
        "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -",
        "rnbqkbnr/pppp1ppp/8/4p3/3P4/8/PPP1PPPP/RNBQKBNR w KQkq -"
      ]);
    });

    it("should not add a new position if the resulting position already exists", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      let fen = repertoire.addMove(startPosition, "e4"); // 1. e4
      fen = repertoire.addMove(fen, "e5"); // 1. e4 e5
      fen = repertoire.addMove(fen, "d4"); // 1. e4 e5 2. d4
      fen = repertoire.addMove(startPosition, "d4"); // 1. d4
      fen = repertoire.addMove(fen, "e5"); // 1. d4 e5
      fen = repertoire.addMove(fen, "e4"); // 1. d4 e5 2. e4 { transposes }

      const parents = repertoire.parentPositions(fen);

      expect(parents).toEqual([
        "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -",
        "rnbqkbnr/pppp1ppp/8/4p3/3P4/8/PPP1PPPP/RNBQKBNR w KQkq -"
      ]);
    });

    it("should not change the repertoire if the move already exists", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      const move = { san: "e4" };
      repertoire.addMove(startPosition, move.san);
      const expected = repertoire.asSaved();

      repertoire.addMove(startPosition, move.san);
      const actual = repertoire.asSaved();

      expect(actual).toEqual(expected);
    });

    it("should replace the FEN en passant section with - if no en passant capture is possible", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      const san = "e4";
      const expected: Variation = [
        {
          san,
          resultingFen:
            "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -",
          sourceFen: startPosition
        }
      ];

      repertoire.addMove(startPosition, san);
      const moves = repertoire.movesFromPosition(startPosition);

      expect(moves).toEqual(expected);
    });

    it("should not replace the FEN en passant section with - if en passant capture is possible", () => {
      const beforeEnPassantPossible =
        "rnbqkbnr/ppp1pppp/8/8/P2p4/8/1PPPPPPP/RNBQKBNR w KQkq -";
      const repertoire = new PositionCollection({
        option: graphOptions,
        nodes: [{ v: beforeEnPassantPossible }],
        edges: []
      });
      const expected: Variation = [
        {
          san: "e4",
          resultingFen:
            "rnbqkbnr/ppp1pppp/8/8/P2pP3/8/1PPP1PPP/RNBQKBNR b KQkq e3",
          sourceFen: beforeEnPassantPossible
        }
      ];

      repertoire.addMove(beforeEnPassantPossible, "e4");
      const moves = repertoire.movesFromPosition(beforeEnPassantPossible);

      expect(moves).toEqual(expected);
    });

    it("should not include half move clock and full move number fen fields", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      const move = { san: "a3" };

      const fen = repertoire.addMove(startPosition, move.san);

      expect(fen).toEqual(
        "rnbqkbnr/pppppppp/8/8/8/P7/1PPPPPPP/RNBQKBNR b KQkq -"
      );
    });

    it("should call onAddMove with the fen and san if a move was added", () => {
      const onAddMove = jest.fn();
      const repertoire = new PositionCollection(startingRepertoire, onAddMove);
      const san = "e4";

      repertoire.addMove(startPosition, san);

      expect(onAddMove).toBeCalledWith(startPosition, san);
    });

    it("should not call onAddMove if a move was not added", () => {
      const onAddMove = jest.fn();
      const repertoire = new PositionCollection(startingRepertoire, onAddMove);
      const san = "e5"; // illegal move

      repertoire.addMove(startPosition, san);

      expect(onAddMove).not.toBeCalled();
    });
  });

  describe("getPositionData", () => {
    it("should get the data stored for a position", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      const expected: PositionData = {
        comments: "some comments",
        drawings: [{ brush: "a brush", orig: "a1", dest: "a2" }]
      };

      repertoire.setPositionData(startPosition, expected);
      const actual = repertoire.getPositionData(startPosition);

      expect(actual).toEqual(expected);
    });

    it("should get empty comments and drawings if there is no stored data", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      const expected: PositionData = {
        comments: "",
        drawings: []
      };

      const actual = repertoire.getPositionData(startPosition);

      expect(actual).toEqual(expected);
    });
  });

  describe("descendantPositions", () => {
    it("should get all the positions occurring after the given position", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      const expected: string[] = [];
      expected.push(repertoire.addMove(startPosition, "e4"));
      expected.push(repertoire.addMove(_.last(expected) || "", "e5"));
      expected.push(repertoire.addMove(_.last(expected) || "", "Nf3"));

      const actual = repertoire.descendantPositions(startPosition);

      expect(actual).toEqual(expected);
    });
  });

  describe("movesFromPosition", () => {
    it("should get all the moves from the position", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      const moves = [
        addMovesToRepertoire(repertoire, ["e4"])[0],
        addMovesToRepertoire(repertoire, ["d4"])[0]
      ];

      const actualMoves = repertoire.movesFromPosition(startPosition);

      expect(actualMoves).toEqual(moves);
    });

    it("should get an empty array if the position is not in the repertoire", () => {
      const repertoire = new PositionCollection(startingRepertoire);

      const actualMoves = repertoire.movesFromPosition(
        "not a repertoire position"
      );

      expect(actualMoves).toEqual([]);
    });

    it("should get an empty array if the position has no children", () => {
      const repertoire = new PositionCollection(startingRepertoire);

      const actualMoves = repertoire.movesFromPosition(startPosition);

      expect(actualMoves).toEqual([]);
    });
  });

  describe("deleteMove", () => {
    let repertoire: PositionCollection;
    let onDeleteMove: DeleteMoveObserver;

    beforeEach(() => {
      onDeleteMove = jest.fn();
      repertoire = new PositionCollection(
        startingRepertoire,
        _.noop,
        onDeleteMove
      );
      let fen = repertoire.addMove(startPosition, "d4");
      fen = repertoire.addMove(fen, "d5");
      fen = repertoire.addMove(startPosition, "d3");
      fen = repertoire.addMove(fen, "d6");
      fen = repertoire.addMove(fen, "d4");
      fen = repertoire.addMove(fen, "d5");
    });

    it("should not be a move from the position after being deleted", () => {
      repertoire.deleteMove(startPosition, "d4");
      const remainingMoves = repertoire.movesFromPosition(startPosition);

      expect(remainingMoves).not.toContainEqual({
        fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq -",
        move: { san: "d4" }
      });
    });

    it("should delete any orphaned positions other than the starting position", () => {
      repertoire.deleteMove(startPosition, "d3");
      const remainingParents = repertoire.parentPositions(
        "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq -"
      );

      expect(remainingParents).toEqual([
        "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq -"
      ]);
    });

    it("should return all the deleted positions", () => {
      const removed = repertoire.deleteMove(startPosition, "d3");

      expect(removed).toEqual([
        "rnbqkbnr/pppppppp/8/8/8/3P4/PPP1PPPP/RNBQKBNR b KQkq -",
        "rnbqkbnr/ppp1pppp/3p4/8/8/3P4/PPP1PPPP/RNBQKBNR w KQkq -",
        "rnbqkbnr/ppp1pppp/3p4/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq -"
      ]);
    });

    it("should call onDeleteMove with the deleted move and positions if a move was deleted", () => {
      const san = "d3";

      const removedPositions = repertoire.deleteMove(startPosition, san);

      expect(onDeleteMove).toHaveBeenCalledWith(
        startPosition,
        san,
        removedPositions
      );
    });

    it("should not call onDeleteMove if no move was deleted", () => {
      repertoire.deleteMove(startPosition, "a3"); // not a repertoire move

      expect(onDeleteMove).not.toHaveBeenCalled();
    });
  });

  describe("getChildVariations", () => {
    it("should get all the possible variations from the position", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      const variations: Variation[] = [
        addMovesToRepertoire(repertoire, ["e4", "e5", "Nf3"]),
        addMovesToRepertoire(repertoire, ["e4", "c6", "d4"])
      ];

      const actual = repertoire.getChildVariations(startPosition);

      expect(actual).toEqual(variations);
    });

    it("should get an empty list if the position has no successors", () => {
      const repertoire = new PositionCollection(startingRepertoire);

      const variations = repertoire.getChildVariations(startPosition);

      expect(variations).toEqual([]);
    });

    it("should stop the variation when a cycle is reached", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      const variation: Variation = addMovesToRepertoire(repertoire, [
        "Nf3",
        "Nf6",
        "Ng1",
        "Ng8"
      ]);

      const actual = repertoire.getChildVariations(startPosition);

      expect(actual).toEqual([variation]);
    });
  });

  describe("getSourceVariations", () => {
    it("should be an empty list for the start position", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      addMovesToRepertoire(repertoire, ["e4", "e5", "Nf3", "Nc6", "d4"]);

      const actual = repertoire.getSourceVariations(startPosition);

      expect(actual).toEqual([]);
    });

    it("should get the variations that gives rise to the position", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      const expected: Variation[] = [
        addMovesToRepertoire(repertoire, ["e4", "e5", "Nf3", "Nc6", "d4"]),
        addMovesToRepertoire(repertoire, ["Nf3", "e5", "e4", "Nc6", "d4"])
      ];

      const actual = repertoire.getSourceVariations(
        "r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq -"
      );

      expect(actual).toEqual(expected);
    });

    it("should not include variations that don't gives rise to the position", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      const expected: Variation[] = [
        addMovesToRepertoire(repertoire, ["e4", "e5", "Nf3", "Nc6", "d4"])
      ];
      addMovesToRepertoire(repertoire, ["d4", "d5", "c4"]);
      const fen = expected[0][4].resultingFen;

      const actual = repertoire.getSourceVariations(fen);

      expect(actual).toEqual(expected);
    });

    it("should not include moves after the position", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      const variations: Variation[] = [
        addMovesToRepertoire(repertoire, ["e4", "e5", "Nf3", "Nc6", "d4"])
      ];
      const expected = [_.take(variations[0], 3)];
      const fen = expected[0][2].resultingFen;

      const actual = repertoire.getSourceVariations(fen);

      expect(actual).toEqual(expected);
    });

    it("should not include duplicate variations", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      let fen = repertoire.addMove(startPosition, "e4");
      repertoire.addMove(fen, "e5");
      fen = repertoire.addMove(startPosition, "e4");
      repertoire.addMove(fen, "e6");

      const parents = repertoire.getSourceVariations(fen);

      expect(parents).toEqual([
        [
          {
            sourceFen: startPosition,
            resultingFen: fen,
            san: "e4"
          }
        ]
      ]);
    });
  });

  describe("asPgn", () => {
    it("should get the pgn representation of the repertoire", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      const variation = ["e4", "e5", "Nf3", "Nf6", "Bc4"];
      let fen = startPosition;
      _.forEach(variation, move => {
        fen = repertoire.addMove(fen, move);
      });
      const expectedPgn = `[Event "Chess Opening Drills"]
[Site ""]
[Date "??"]
[Round ""]
[White ""]
[Black ""]
[Result "*"]

1. ${variation[0]} ${variation[1]} 2. ${variation[2]} ${variation[3]} 3. ${variation[4]} *`;

      const pgn = repertoire.asPgn(startPosition);

      expect(pgn).toEqual(expectedPgn);
    });

    it("should include the FEN and SetUp tags if the position is not the normal starting position", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      const variation = ["e4", "e5", "Nf3", "Nf6", "Bc4"];
      let fen = repertoire.addMove(startPosition, variation[0]);
      const positionFen = repertoire.addMove(fen, variation[1]);
      fen = positionFen;
      _.forEach(_.slice(variation, 2), move => {
        fen = repertoire.addMove(fen, move);
      });

      const expectedPgn = `[Event "Chess Opening Drills"]
[Site ""]
[Date "??"]
[Round ""]
[White ""]
[Black ""]
[Result "*"]
[FEN "${positionFen}"]
[SetUp "1"]

1. ${variation[2]} ${variation[3]} 2. ${variation[4]} *`;

      const pgn = repertoire.asPgn(positionFen);

      expect(pgn).toEqual(expectedPgn);
    });

    it("should append ... before the first move if black plays first", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      const variation = ["e4", "e5", "Nf3", "Nf6", "Bc4"];
      let fen = repertoire.addMove(startPosition, variation[0]);
      const positionFen = fen;
      _.forEach(_.tail(variation), move => {
        fen = repertoire.addMove(fen, move);
      });

      const expectedPgn = `[Event "Chess Opening Drills"]
[Site ""]
[Date "??"]
[Round ""]
[White ""]
[Black ""]
[Result "*"]
[FEN "${positionFen}"]
[SetUp "1"]

1. ... ${variation[1]} 2. ${variation[2]} ${variation[3]} 3. ${variation[4]} *`;

      const pgn = repertoire.asPgn(positionFen);

      expect(pgn).toEqual(expectedPgn);
    });

    it("should include variations in the pgn representation", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      const variations = [
        ["e4", "e5", "Nf3", "Nc6", "Bc4"],
        ["e4", "c5", "d4"]
      ];
      addMovesToRepertoire(repertoire, variations[0]);
      addMovesToRepertoire(repertoire, variations[1]);
      const expectedPgn = `[Event "Chess Opening Drills"]
[Site ""]
[Date "??"]
[Round ""]
[White ""]
[Black ""]
[Result "*"]

1. ${variations[0][0]} ${variations[0][1]} (1... ${variations[1][1]} 2. ${variations[1][2]}) 2. ${variations[0][2]} ${variations[0][3]} 3. ${variations[0][4]} *`;

      const pgn = repertoire.asPgn(startPosition);

      expect(pgn).toEqual(expectedPgn);
    });
  });

  describe("loadPgn", () => {
    it("should import all the moves from a pgn game into the repertoire", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      const pgn = `1. e4 e5 2. Nf3 Nc6 3. Bc4 *`;
      const expected: Variation[] = [
        addMovesToRepertoire(repertoire, ["e4", "e5", "Nf3", "Nc6", "Bc4"])
      ];

      repertoire.loadPgn(pgn);
      const loaded = repertoire.getChildVariations(startPosition);

      expect(loaded).toEqual(expected);
    });

    it("should import sub variations from a pgn game into the repertoire", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      const pgn = `1. e4 e5 (1... c5 2. d4) *`;
      const expectedVariations: Variation[] = [
        addMovesToRepertoire(repertoire, ["e4", "e5"]),
        addMovesToRepertoire(repertoire, ["e4", "c5", "d4"])
      ];

      repertoire.loadPgn(pgn);
      const loaded = repertoire.getChildVariations(startPosition);

      expect(loaded).toEqual(expectedVariations);
    });

    it("should not change the repertoire if the pgn start position is not in the repertoire", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      const before = repertoire.asSaved();
      const pgn = `[FEN "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1"]
[SetUp "1"]

1... e5 2. Nf3 Nf6 3. Bc4 *`;

      repertoire.loadPgn(pgn);
      const after = repertoire.asSaved();

      expect(after).toEqual(before);
    });

    it("should call onAddMove for all the added moves from a pgn game", () => {
      const onAddMove = jest.fn();
      const repertoire = new PositionCollection(startingRepertoire, onAddMove);
      const pgn = `1. e4 e5 2. Nf3 Nc6 3. Bc4 *`;

      repertoire.loadPgn(pgn);

      expect(onAddMove).toHaveBeenCalledWith(startPosition, "e4");
      expect(onAddMove).toHaveBeenCalledWith(
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -",
        "e5"
      );
      expect(onAddMove).toHaveBeenCalledWith(
        "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -",
        "Nf3"
      );
      expect(onAddMove).toHaveBeenCalledWith(
        "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -",
        "Nc6"
      );
      expect(onAddMove).toHaveBeenCalledWith(
        "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -",
        "Bc4"
      );
    });
  });

  describe("asSaved", () => {
    it("should be able to recreate the same repertoire", () => {
      const repertoire = new PositionCollection(startingRepertoire);

      const actual = repertoire.asSaved();

      expect(actual).toEqual(startingRepertoire);
    });
  });
});
