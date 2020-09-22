import { Graph, json, alg } from "graphlib";
import _ from "lodash";
import { Chess } from "chess.js";

interface EdgeData {
  san: string;
}

export class Repertoire {
  private graph: Graph<never, never, EdgeData>;

  constructor(serialized: json.SavedGraph) {
    this.graph = json.read(serialized);
  }

  addMove(fen: string, san: string): string {
    const nextFen = Repertoire.fenAfterMove(fen, san);

    this.graph.setEdge(fen, nextFen, { san });

    return nextFen;
  }

  deleteMove(fen: string, san: string): string[] {
    const nextFen = Repertoire.fenAfterMove(fen, san);
    const startPosition = this.graph.sources()[0];

    this.graph.removeEdge(fen, nextFen);
    return this.removeOrphans(startPosition);
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

  getVariations(fen: string): string[][] {
    const variations: string[][] = [];
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

  private static fenAfterMove(fen: string, san: string): string {
    const game = new Chess(fen + " 0 1"); // add back half move clock and full move number to be valid FEN
    game.move(san);
    let maybeEnPassantFen = game.fen();

    const enPassant = _.some(
      game.moves({
        verbose: true
      }),
      move => move.flags.includes("e") // "e" is en passant flag https://github.com/jhlywa/chess.js/
    );

    const fenSections = maybeEnPassantFen.split(" ");

    if (!enPassant) {
      fenSections[3] = "-"; // https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation
    }

    fenSections.pop(); // remove full move number
    fenSections.pop(); // remove half move clock
    maybeEnPassantFen = _.join(_.slice(fenSections), " ");

    return maybeEnPassantFen;
  }

  private collectVariations(
    fen: string,
    collector: string[][],
    path: string[] = []
  ): void {
    const successors = _.without(this.graph.successors(fen) || [], ...path);

    if (_.isEmpty(successors)) {
      if (_.some(path)) {
        collector.push(path);
      }
    } else {
      _.forEach(successors, successor => {
        this.collectVariations(successor, collector, [...path, successor]);
      });
    }
  }
}
