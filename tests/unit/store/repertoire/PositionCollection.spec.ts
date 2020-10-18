import _ from "lodash";

import {
  PositionCollection,
  VariationMove
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

describe("PositionCollection", () => {
  describe("addMove", () => {
    it("should add the move as an outgoing move of the given position", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      const move = { san: "e4" };

      repertoire.addMove(startPosition, move.san);
      const moves = repertoire.movesFromPosition(startPosition);

      expect(moves).toEqual([
        { moveData: move, resultingFen: expect.anything() }
      ]);
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

      repertoire.addMove(startPosition, san);
      const moves = repertoire.movesFromPosition(startPosition);

      expect(moves).toEqual([
        {
          moveData: expect.anything(),
          resultingFen: "rnbqkbnr/pppppppp/8/8/8/P7/1PPPPPPP/RNBQKBNR b KQkq -"
        }
      ]);
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

      repertoire.addMove(startPosition, san);

      const moves = repertoire.movesFromPosition(startPosition);

      expect(moves).toEqual([
        {
          moveData: expect.anything(),
          resultingFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -"
        }
      ]);
    });

    it("should not replace the FEN en passant section with - if en passant capture is possible", () => {
      const beforeEnPassantPossible =
        "rnbqkbnr/ppp1pppp/8/8/P2p4/8/1PPPPPPP/RNBQKBNR w KQkq -";
      const repertoire = new PositionCollection({
        option: graphOptions,
        nodes: [{ v: beforeEnPassantPossible }],
        edges: []
      });

      repertoire.addMove(beforeEnPassantPossible, "e4");
      const moves = repertoire.movesFromPosition(beforeEnPassantPossible);

      expect(moves).toEqual([
        {
          moveData: expect.anything(),
          resultingFen:
            "rnbqkbnr/ppp1pppp/8/8/P2pP3/8/1PPP1PPP/RNBQKBNR b KQkq e3"
        }
      ]);
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
      const moves = [
        {
          resultingFen:
            "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
          moveData: { san: "e4" }
        },
        {
          resultingFen:
            "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
          moveData: { san: "d4" }
        }
      ];
      const repertoire = new PositionCollection({
        option: graphOptions,
        nodes: [
          { v: startPosition },
          { v: moves[0].resultingFen },
          { v: moves[1].resultingFen }
        ],
        edges: [
          {
            v: startPosition,
            w: moves[0].resultingFen,
            value: moves[0].moveData
          },
          {
            v: startPosition,
            w: moves[1].resultingFen,
            value: moves[1].moveData
          }
        ]
      });

      const actualMoves = repertoire.movesFromPosition(startPosition);

      expect(actualMoves).toEqual(moves);
    });
  });

  describe("deleteMove", () => {
    let repertoire: PositionCollection;

    beforeEach(() => {
      repertoire = new PositionCollection(startingRepertoire);
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
  });

  describe("getVariations", () => {
    it("should get all the possible variations from the position", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      const variations: VariationMove[][] = [[], []];
      variations[0].push({
        resultingFen: repertoire.addMove(startPosition, "e4"),
        moveData: { san: "e4" }
      });
      variations[1].push(variations[0][0]);
      variations[0].push({
        resultingFen: repertoire.addMove(variations[0][0].resultingFen, "e5"),
        moveData: { san: "e5" }
      });
      variations[0].push({
        resultingFen: repertoire.addMove(variations[0][1].resultingFen, "Nf3"),
        moveData: { san: "Nf3" }
      });
      variations[1].push({
        resultingFen: repertoire.addMove(variations[1][0].resultingFen, "c6"),
        moveData: { san: "c6" }
      });
      variations[1].push({
        resultingFen: repertoire.addMove(variations[1][1].resultingFen, "d4"),
        moveData: { san: "d4" }
      });

      const actual = repertoire.getVariations(startPosition);

      expect(actual).toEqual(variations);
    });

    it("should get an empty list if the position has no successors", () => {
      const repertoire = new PositionCollection(startingRepertoire);

      const variations = repertoire.getVariations(startPosition);

      expect(variations).toEqual([]);
    });

    it("should stop the variation when a cycle is reached", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      const variation: VariationMove[] = [];
      variation.push({
        resultingFen: repertoire.addMove(startPosition, "Nf3"),
        moveData: { san: "Nf3" }
      });
      variation.push({
        resultingFen: repertoire.addMove(variation[0].resultingFen, "Nf6"),
        moveData: { san: "Nf6" }
      });
      variation.push({
        resultingFen: repertoire.addMove(variation[1].resultingFen, "Ng1"),
        moveData: { san: "Ng1" }
      });
      variation.push({
        resultingFen: repertoire.addMove(variation[2].resultingFen, "Ng8"),
        moveData: { san: "Ng8" }
      });

      const actual = repertoire.getVariations(startPosition);

      expect(actual).toEqual([variation]);
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
      _.forEach(variations, variation => {
        let fen = startPosition;
        _.forEach(variation, move => {
          fen = repertoire.addMove(fen, move);
        });
      });
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
      const expectedVariations: VariationMove[][] = [
        [
          {
            resultingFen:
              "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -",
            moveData: { san: "e4" }
          },
          {
            resultingFen:
              "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -",
            moveData: { san: "e5" }
          },
          {
            resultingFen:
              "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -",
            moveData: { san: "Nf3" }
          },
          {
            resultingFen:
              "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -",
            moveData: { san: "Nc6" }
          },
          {
            resultingFen:
              "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq -",
            moveData: { san: "Bc4" }
          }
        ]
      ];

      repertoire.loadPgn(pgn);
      const loaded = repertoire.getVariations(startPosition);

      expect(loaded).toEqual(expectedVariations);
    });

    it("should import sub variations from a pgn game into the repertoire", () => {
      const repertoire = new PositionCollection(startingRepertoire);
      const pgn = `1. e4 e5 (1... c5 2. d4) *`;
      const expectedVariations: VariationMove[][] = [
        [
          {
            resultingFen:
              "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -",
            moveData: { san: "e4" }
          },
          {
            resultingFen:
              "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -",
            moveData: { san: "e5" }
          }
        ],
        [
          {
            resultingFen:
              "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -",
            moveData: { san: "e4" }
          },
          {
            resultingFen:
              "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -",
            moveData: { san: "c5" }
          },
          {
            resultingFen:
              "rnbqkbnr/pp1ppppp/8/2p5/3PP3/8/PPP2PPP/RNBQKBNR b KQkq -",
            moveData: { san: "d4" }
          }
        ]
      ].sort();

      repertoire.loadPgn(pgn);
      const loaded = repertoire.getVariations(startPosition);

      expect(loaded.sort()).toEqual(expectedVariations);
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
  });

  describe("asSaved", () => {
    it("should be able to recreate the same repertoire", () => {
      const repertoire = new PositionCollection(startingRepertoire);

      const actual = repertoire.asSaved();

      expect(actual).toEqual(startingRepertoire);
    });
  });
});
