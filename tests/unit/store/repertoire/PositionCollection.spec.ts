import _ from "lodash";

import {
  PositionCollection,
  DeleteMoveObserver,
  Variation
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

    const realPgn = `[Event "N/A"]
[Site "N/A"]
[Date "2020.9.26"]
[Round "N/A"]
[White "N/A"]
[Black "N/A"]
[Result "*"]

1. e4 e5 ( 2... c5 2. Nf3 e6 ( 3... Nc6 3. Bb5 d6 ( 4... g6 4. O-O Bg7 5. Re1 e5 ( 6... Nf6 6. e5 Nd5 7. Nc3 Nc7 ( 8... Nxc3 8. dxc3 O-O 9. Qd5 ) 8. Bxc6 dxc6 9. Ne4 Ne6 ( 10... b6 10. Nf6+ Kf8 11. Ne4 ) 10. d3 O-O 11. Be3 b6 ( 12... Nd4  ) 12. Qd2 Nd4 13. Nxd4 cxd4 14. Bh6 ) 6. Bxc6 dxc6 7. d3 ) ( 4... e6 4. O-O Nge7 5. d4 cxd4 6. Nxd4 Qb6 ( 7... Nxd4 7. Qxd4 a6 8. Be2 Nc6 9. Qc3 ) ( 7... a6 7. Be2 Nxd4 ( 8... d5 8. exd5 Qxd5 ( 9... Nxd4 9. Qxd4 Nxd5 ( 10... Qxd5 10. Qxd5 Nxd5 11. c4 Ne7 12. Bf3 ) 10. Rd1 ) 9. Be3 Nxd4 10. Bxd4 Nc6 ( 11... e5 11. Bb6 Be6 12. c4 Qc6 13. Qb3 Rc8 14. Nd2 ) 11. Bb6 Be7 12. Nc3 Qxd1 13. Rfxd1 f5 14. Na4 ) 8. Qxd4 Nc6 9. Qc3 ) 7. Nxc6 dxc6 ( 8... bxc6  ) ( 8... Qxb5 8. Nd4 Qb6 9. Nc3 a6 10. a4 Nc6 11. Nb3 Qc7 12. a5 Bb4 13. Be3 Nxa5 14. Qg4 g6 ) ( 8... Nxc6 8. Be2 Be7 9. c4 O-O 10. Nc3 Bf6 11. Nb5 a6 12. Be3 Qa5 13. Nd6 Bxb2 14. Rb1 Be5 15. a4 Bxd6 16. Qxd6 Qxa4 17. Bb6 ) 8. Bc4 Ng6 9. Kh1!? Qc7 10. f4 Be7 11. a4 ) 4. O-O Bd7 5. Re1 Nf6 6. c3 a6 7. Bf1 Bg4 8. h3 Bxf3 ( 9... Bh5 9. g4 Bg6 10. d4 Bxe4 11. Rxe4 Nxe4 12. d5 Ne5 13. Qa4+ ) 9. Qxf3 g6 10. d3 Bg7 11. Be3 Nd7 12. Nd2 O-O 13. Qd1 b5 14. Nf3 b4 15. Qa4 Qc8 16. d4 ) ( 3... g6 3. c3 Bg7 4. d4 cxd4 5. cxd4 d5 ( 6... d6 6. h3 Nf6 7. Nc3 O-O 8. Be3 ) 6. e5 Nc6 7. Bb5 Bd7 ( 8... Bg4 8. Bxc6+ bxc6 9. Nbd2 Nh6 10. O-O O-O 11. h3 Bxf3 12. Nxf3 Qb6 13. b3 c5 14. Bf4 ) ( 8... Nh6 8. O-O O-O 9. h3 f6 10. Nc3 fxe5 11. Bxc6 bxc6 12. Bxh6 Bxh6 13. Nxe5 Qd6 14. Na4 ) 8. Nc3 e6 9. h4 h6 10. Be3 Nge7 11. Bd3 Nf5 12. Bxf5 gxf5 13. O-O ) ( 3... d6 3. Bb5+ Bd7 ( 4... Nd7 4. O-O a6 5. Bd3 b5 ( 6... Ngf6 6. Re1 e6 ( 7... g6 7. c3 Bg7 8. Bc2 O-O 9. d4 cxd4 ( 10... e5 10. h3 ) 10. cxd4 b5 11. a4 ) 7. c3 b5 ( 8... Be7 8. a4 ) 8. a4 bxa4 ( 9... c4 9. Bc2 ) 9. Bc2 ) 6. c4 bxc4 7. Bxc4 Nb6 8. d3 ) 4. Bxd7+ Qxd7 5. O-O Nc6 6. c3 Nf6 7. d4 Nxe4 8. d5 Ne5 9. Re1 Nxf3+ 10. Qxf3 Nf6 11. c4 ) 3. d3 Nc6 4. g3 g6 5. Bg5 Be7 ( 6... Nf6  ) ( 6... Qb6 6. Nbd2 Qxb2 ( 7... Bg7 7. Nc4 Qc7 8. a4 d5 9. exd5 exd5 10. Qe2+ Be6 11. Bf4 Qd7 12. Nfe5 Nxe5 13. Nxe5 Qe7 14. Bg2 ) 7. Nc4 Qc3+ ( 8... Qg7 8. Rb1 d5 9. exd5 exd5 10. Qe2+ Nge7 ( 11... Be7 11. Nd6+ Kf8 12. Nxc8 Bxg5 13. Bh3 ) ( 11... Be6 11. Nce5 ) 11. Nd6+ ) 8. Bd2 Qg7 ) ( 6... Qc7 6. Bg2 Bg7 7. c3 Nge7 8. O-O O-O 9. d4 cxd4 10. cxd4 d5 11. e5 Qb6 12. Qd2 Nf5 13. Rd1 h6 14. Bf4 g5 15. Be3 Nxe3 16. Qxe3 Qxb2 17. Nc3 ) 6. Bxe7 ) ( 2... g6 2. d4 Bg7 ( 3... Nf6 3. e5 Nh5 4. Nf3 d6 5. Bc4 d5 6. Be2 ) ( 3... d6 3. Nc3 c6 4. Be3 b5 5. a3 ) 3. Nc3 d6 4. f4 c6 ( 5... Nf6 5. Nf3 O-O ( 6... c5 6. Bb5+ ) 6. Be3 ) ( 5... a6 5. Nf3 b5 6. Bd3 Bb7 ( 7... Nd7 7. e5 c5 8. Be4 Rb8 9. O-O Nh6 ( 10... cxd4 10. Nxd4 dxe5 11. Nc6 Qb6+ 12. Kh1 Ngf6 13. Nxb8 Qxb8 14. fxe5 Nxe5 15. Bf4 ) 10. exd6 O-O ( 11... exd6 11. f5 cxd4 12. Nxd4 Qb6 13. Be3 Ng4 14. Qxg4 Bxd4 15. Bxd4 Qxd4+ 16. Kh1 O-O 17. fxg6 hxg6 18. Rad1 Qe5 19. Bd5 Qg7 20. Ne4 Ne5 21. Qg3 ) 11. f5 exd6 12. Bg5 Nf6 13. fxg6 hxg6 14. Nd5 Re8 15. Ne5 ) 7. Qe2 Nd7 8. e5 e6 9. a4 b4 10. Ne4 Bxe4 11. Bxe4 d5 12. Bd3 a5 13. O-O Ne7 14. c3 c5 15. dxc5 bxc3 16. Be3 cxb2 17. Qxb2 ) 5. Nf3 Qa5 6. Be3 ) ( 2... d5 2. exd5 Nf6 ( 3... Qxd5 3. Nc3 Qd8 ( 4... Qd6 4. d4 Nf6 5. Nf3 Bg4 6. h3 Bh5 7. g4 Bg6 8. Ne5 Nbd7 9. Nxg6 hxg6 10. Bg2 c6 11. d5 ) ( 4... Qe5+ 4. Be2 c6 5. Nf3 Qc7 6. d4 Bf5 7. Ne5 Nd7 8. Bf4 Nxe5 9. Bxe5 ) ( 4... Qa5 4. d4 Nf6 ( 5... Bf5 5. Qf3 c6 ( 6... Nc6 6. Bb5 Bd7 7. Ne2 ) 6. b4 Qxb4 7. Rb1 Qxd4 8. Qxf5 Qxc3+ 9. Bd2 Qd4 10. Qc8+ Qd8 11. Qxb7 Nd7 12. Qxc6 ) 5. Nf3 c6 6. Bc4 Bg4 ( 7... Bf5 7. Ne5 e6 8. g4 Be4 ( 9... Bg6 9. h4 Be4 ( 10... Nbd7 10. Nxd7 Nxd7 ( 11... Kxd7 11. h5 Be4 12. O-O Rd8 ( 13... Bd5 13. Nxd5 cxd5 14. Bd3 ) 13. Nxe4 Nxe4 14. Bd3 Nf6 15. g5 Ne8 16. Qf3 ) 11. h5 Be4 12. O-O ) 10. Rh3 Bd5 11. Bd2 Bxc4 12. Nxc4 Qd8 13. g5 Qxd4 14. Qe2 Qg4 15. gxf6 Qxh3 16. O-O-O ) 9. O-O Bd5 10. Bd3 Nbd7 11. f4 ) 7. h3 Bh5 8. Qe2 e6 ( 9... Nbd7 9. g4 Bg6 10. Bd2 Bxc2 ( 11... e6 11. O-O-O Bb4 12. a3 Bxc3 13. Bxc3 Qc7 14. Ne5 ) 11. Nb5 Qb6 12. Nd6+ ) 9. g4 ) 4. d4 g6 ( 5... c6 5. Bc4 Nf6 ( 6... Bf5 6. g4 Bg6 7. Nge2 h5 ( 8... Nf6 8. Nf4 e5 9. Nxg6 hxg6 10. Be3 ) 8. Nf4 ) 6. Nf3 Bf5 7. Ne5 e6 8. g4 Bg6 9. h4 Nbd7 ( 10... Bb4 10. f3 Nd5 11. Bd2 Bxc3 12. bxc3 b5 13. Bxd5 Qxd5 14. h5 f6 15. hxg6 fxe5 16. Rxh7 Rg8 17. Rh5 ) 10. f3 Nxe5 11. dxe5 Nd7 12. h5 ) ( 5... Nf6 5. Nf3 Bf5 ( 6... Bg4 6. h3 Bxf3 ( 7... Bh5 7. g4 Bg6 8. Ne5 e6 ( 9... Nbd7 9. Qe2 Nxe5 10. dxe5 Nd7 11. Bg5 ) 9. Bg2 c6 10. h4 Bb4 11. O-O Nbd7 12. Qe2 ) 7. Qxf3 c6 8. Be3 e6 9. Bd3 Nbd7 ( 10... Bb4 10. O-O Nbd7 11. Ne4 ) 10. O-O-O Bb4 ( 11... Qa5 11. Kb1 ) 11. Ne2 Nd5 12. Qg3 O-O ( 13... Nxe3 13. fxe3 ) ( 13... g6 13. Bh6 b5 14. h4 Bf8 15. Bg5 Be7 16. Kb1 ) 13. Bh6 Qf6 14. Bg5 ) ( 6... c6 6. Bc4 Bg4 ( 7... Bf5 7. Ne5 e6 8. g4 Bg6 9. h4 Nbd7 ( 10... Bb4 10. f3 Nd5 11. Bd2 Bxc3 12. bxc3 b5 13. Bxd5 Qxd5 14. h5 f6 15. hxg6 fxe5 16. Rxh7 Rg8 17. Rh5 ) 10. f3 Nxe5 11. dxe5 Nd7 12. h5 ) 7. Bxf7+ Kxf7 8. Ne5+ ) 6. Ne5 c6 7. Bc4 e6 8. g4 Bg6 9. h4 Nbd7 ( 10... Bb4 10. f3 Nd5 11. Bd2 Bxc3 12. bxc3 b5 13. Bxd5 Qxd5 14. h5 f6 15. hxg6 fxe5 16. Rxh7 Rg8 17. Rh5 ) 10. f3 Nxe5 11. dxe5 Nd7 12. h5 ) 5. Bf4 Bg7 6. Qd2 Nf6 ( 7... Qxd4 7. Qxd4 Bxd4 8. Nd5 Bb6 9. Bxc7 ) 7. O-O-O c6 8. Bh6 ) 3. Bb5+ c6 ( 4... Bd7 4. Be2 Nxd5 5. d4 g6 ( 6... Bf5 6. Nf3 e6 7. O-O Be7 8. a3 O-O 9. c4 Nb6 10. Nc3 Bf6 11. Be3 Nc6 12. h3 ) 6. c4 Nf6 7. Nc3 Bg7 8. Nf3 O-O 9. O-O ) ( 4... Nbd7 4. d4 Nxd5 5. Nf3 c6 6. Be2 N7f6 ( 7... g6 7. O-O Bg7 8. c4 Nc7 9. Nc3 O-O 10. Bf4 Ne6 11. Be3 Nf6 12. h3 ) 7. c4 Nb6 8. h3 Bf5 9. O-O e6 10. Nc3 Be7 11. Be3 ) 4. dxc6 Nxc6 ( 5... bxc6 5. Be2 e5 6. d3 Bc5 7. Nf3 ) 5. Nf3 ) ( 2... c6 2. d4 d5 3. exd5 cxd5 4. Bd3 Nc6 5. c3 Nf6 6. Bf4 Bg4 7. Qb3 Qd7 8. Nd2 e6 9. Ngf3 Bxf3 10. Nxf3 Bd6 11. Bxd6 Qxd6 12. O-O O-O 13. Qd1 ) ( 2... e6  ) ( 2... Nf6 2. e5 Nd5 ( 3... Ne4 3. d3 Nc5 4. d4 Ne6 5. f4 ) ( 3... Ng8 3. d4 d6 4. Nf3 ) 3. d4 d6 4. c4 ( 4. Nf3  ) Nb6 5. exd6 exd6 ( 6... cxd6 6. Nc3 Nc6 ( 7... g6 7. Be3 Bg7 8. Rc1 Nc6 ( 9... O-O 9. b3 e5 ( 10... Bf5 10. g4! Bd7 11. h4 Nc6 12. d5! Ne5 13. Be2 Rc8 14. Bd4 f5 15. g5 f4 16. Nf3 ) ( 10... Nc6 10. d5 Ne5 11. Be2 f5 ( 12... Re8 12. f4 Ned7 13. Nf3 Nf6 14. O-O e6 15. dxe6 Bxe6 16. Bd4 ) 12. Nh3! Nbd7 13. O-O Nf6 14. f4 Neg4 15. Bd4 ) 10. Nf3 Nc6 11. Be2 Bg4 12. dxe5! dxe5 13. c5 Nd7 14. O-O ) 9. d5 Ne5 10. Be2 O-O 11. b3 ) 7. d5! Ne5 8. f4 Nexc4?? ( 9... Ned7 9. Nf3 g6 10. Be2 Bg7 11. Nd4 O-O 12. O-O Nc5 13. f5 ) 9. Bxc4 Nxc4 10. Qa4+ ) 6. Nc3 g6 ( 7... Bf5 7. Bd3 Bxd3 8. Qxd3 Be7 9. Nf3 O-O 10. O-O ) ( 7... Nc6 7. Be3 Bf5 ( 8... Be7 8. Bd3 O-O ( 9... Nb4 9. Bb1! O-O 10. a3 Nc6 11. Nge2 Nxc4?? 12. Qd3 ) 9. b3 Bf6 10. Nge2 ) 8. Bd3 ) ( 7... Be7 7. Bd3 Nc6 8. Nge2 Nb4 ( 9... Bg4 9. Be3 Nb4 ( 10... O-O 10. b3! Nb4?! ( 11... Bf6 11. O-O Re8 12. h3 Bh5 13. Qd2 Bg6 14. d5 Ne5 15. Bxg6 Nxg6 16. Ng3 ) 11. Bb1 ) ( 10... Bf6 10. f3 Bh4+? ( 11... Bh5 11. O-O Bg6 12. Bf2 ) 11. g3! Bxf3 12. O-O! Bxe2 13. Qxe2 Be7 14. c5 ) 10. Bb1 ) 9. Bb1! O-O 10. a3 Nc6 11. O-O Nxc4?? 12. Qd3 ) 7. Nf3 Bg7 8. Bg5 f6 ) 2. Nf3 Nc6 ( 3... Nf6  ) ( 3... d6  ) 3. Bc4 Nf6 ( 4... Bc5 4. O-O d6 5. c3 Nf6 6. d3 a6 7. Bb3 Ba7 8. Nbd2 O-O 9. h3 h6 10. Re1 Be6 11. Bc2 ) 4. d3 Be7 5. O-O O-O 6. Re1 d6 7. c3 Na5 8. Bb5 a6 9. Ba4 b5 10. Bc2 c5 11. Nbd2 Nc6 12. Nf1 Re8 13. Ng3 Bf8 14. h3 *
`;

    it("should load a real pgn", () => {
      const positions = new PositionCollection(startingRepertoire, jest.fn());

      positions.loadPgn(realPgn);
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
