import { Graph, json, alg } from "graphlib";
import _ from "lodash";
import { Chess } from "chess.js";
import { Pgn } from "chess-pgn";

import { parse, PgnGame, PgnMove } from "pgn-parser";

interface EdgeData {
  san: string;
}

export interface VariationMove {
  san: string;
  resultingFen: string;
}

function variationsFromGame(
  pgnMoves: PgnMove[],
  collector: string[][],
  history: PgnMove[] = []
): void {
  _.forEach(pgnMoves, pgnMove => {
    if (pgnMove.ravs) {
      _.forEach(pgnMove.ravs, rav => {
        variationsFromGame(rav.moves, collector, _.clone(history));
      });
    }

    history.push(_.omit(pgnMove, "ravs"));
  });

  const moves = _.map(history, move => move.move || "");
  collector.push(moves);
}

function variationsFromPgnGame(game: PgnGame): string[][] {
  const variations: string[][] = [];
  variationsFromGame(game.moves, variations);

  return variations;
}

function fenAfterMove(fen: string, san: string): string | undefined {
  const game = new Chess(fen + " 0 1"); // add back half move clock and full move number to be valid FEN

  if (game.move(san)) {
    let nextFen = game.fen();

    const enPassant = _.some(
      game.moves({
        verbose: true
      }),
      move => move.flags.includes("e") // "e" is en passant flag https://github.com/jhlywa/chess.js/
    );

    const fenSections = nextFen.split(" ");

    if (!enPassant) {
      fenSections[3] = "-"; // https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation
    }

    fenSections.pop(); // remove full move number
    fenSections.pop(); // remove half move clock
    nextFen = _.join(_.slice(fenSections), " ");

    return nextFen;
  }
}

export class Repertoire {
  private graph: Graph<never, never, EdgeData>;

  constructor(serialized: json.SavedGraph) {
    this.graph = json.read(serialized);
  }

  addMove(fen: string, san: string): string {
    const nextFen = fenAfterMove(fen, san);

    if (nextFen) {
      this.graph.setEdge(fen, nextFen, { san });

      return nextFen;
    } else {
      return "";
    }
  }

  deleteMove(fen: string, san: string): string[] {
    const nextFen = fenAfterMove(fen, san);

    if (nextFen) {
      const startPosition = this.graph.sources()[0];

      this.graph.removeEdge(fen, nextFen);
      return this.removeOrphans(startPosition);
    } else {
      return [];
    }
  }

  movesFromPosition(fen: string): { move: EdgeData; fen: string }[] {
    const successors = this.graph.successors(fen);

    if (successors) {
      return _.map(successors, successor => {
        return {
          move: this.graph.edge(fen, successor),
          fen: successor
        };
      });
    }

    return [];
  }

  parentPositions(fen: string): string[] {
    return this.graph.predecessors(fen) || [];
  }

  descendantPositions(fen: string): string[] {
    return _.tail(alg.preorder(this.graph, [fen]));
  }

  asSaved(): json.SavedGraph {
    return json.write(this.graph);
  }

  asPgn(fen: string): string {
    let pgn = new Pgn();
    pgn = pgn.addTag("Event", "Chess Opening Drills");
    pgn = pgn.addTag("Site", "");
    pgn = pgn.addTag("Date", "??");
    pgn = pgn.addTag("Round", "");
    pgn = pgn.addTag("White", "");
    pgn = pgn.addTag("Black", "");
    pgn = pgn.addTag("Result", "*");

    if (!fen.startsWith("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq")) {
      pgn = pgn.addTag("FEN", fen);
      pgn = pgn.addTag("SetUp", "1");
    }

    const variations = _.map(this.getVariations(fen), variation =>
      _.map(variation, move => move.san)
    );

    if (fen.includes(" b ")) {
      _.forEach(variations, variation => {
        if (!_.isEmpty(variation)) {
          variation.unshift("...");
        }
      });
    }

    _.forEach(variations, variation => {
      pgn = pgn.startingPosition();
      _.forEach(variation, move => {
        pgn = pgn.move(move);
      });
    });

    return pgn.toString();
  }

  loadPgn(pgn: string): void {
    const games = parse(pgn);

    _.forEach(games, game => {
      const variations = variationsFromPgnGame(game);
      _.forEach(variations, variation => {
        const fenHeader = _.find(game.headers, header => header.name === "FEN");
        let fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -";
        if (fenHeader) {
          fen = fenHeader.value;
        }

        _.forEach(variation, move => {
          fen = this.addMove(fen, move);
        });
      });
    });
  }

  getVariations(fen: string): VariationMove[][] {
    const variations: VariationMove[][] = [];
    this.collectVariations(fen, variations);
    return variations;
  }

  private removeOrphans(startPosition: string): string[] {
    let orphans: string[] = [];
    const removed: string[] = [];
    do {
      orphans = _.without(this.graph.sources(), startPosition);
      _.forEach(orphans, orphan => this.graph.removeNode(orphan));
      removed.push(...orphans);
    } while (_.some(orphans));

    return removed;
  }

  private collectVariations(
    fen: string,
    collector: VariationMove[][],
    path: VariationMove[] = []
  ): void {
    const successors = _.without(
      this.graph.successors(fen) || [],
      ..._.map(path, move => move.resultingFen)
    );

    if (_.isEmpty(successors)) {
      if (_.some(path)) {
        collector.push(path);
      }
    } else {
      _.forEach(successors, successor => {
        const move = this.graph.edge(fen, successor).san;

        this.collectVariations(successor, collector, [
          ...path,
          { resultingFen: successor, san: move }
        ]);
      });
    }
  }
}
