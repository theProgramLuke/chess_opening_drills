import { Graph, json, alg } from "graphlib";
import _ from "lodash";
import { Pgn } from "chess-pgn";

import { parse } from "pgn-parser";
import {
  fenAfterMove,
  variationsFromPgnGame
} from "@/store/repertoire/chessHelpers";

export interface MoveData {
  san: string;
}

export interface VariationMove {
  moveData: MoveData;
  resultingFen: string;
}

export type AddMoveObserver = (fen: string, san: string) => void;
export type DeleteMoveObserver = (
  fen: string,
  san: string,
  deletedPositions: string[]
) => void;

export type SavedPositionCollection = json.SavedGraph;

export interface PositionCollectionInterface {
  addMove: (fen: string, san: string) => string;
  deleteMove: (fen: string, san: string) => string[];
  movesFromPosition: (fen: string) => VariationMove[];
  parentPositions: (fen: string) => string[];
  descendantPositions: (fen: string) => string[];
  asSaved: () => Record<string, any>;
  asPgn: (fen: string) => string;
  loadPgn: (pgn: string) => void;
  getChildVariations: (fen: string) => VariationMove[][];
}

export class PositionCollection implements PositionCollectionInterface {
  private graph: Graph<never, never, MoveData>;
  private onAddMove: AddMoveObserver;
  private onDeleteMove: DeleteMoveObserver;

  constructor(
    serialized: SavedPositionCollection,
    onAddMove: AddMoveObserver = _.noop,
    onDeleteMove: DeleteMoveObserver = _.noop
  ) {
    this.graph = json.read(serialized);
    this.onAddMove = onAddMove;
    this.onDeleteMove = onDeleteMove;
  }

  addMove(fen: string, san: string): string {
    const nextFen = fenAfterMove(fen, san);

    if (nextFen) {
      this.graph.setEdge(fen, nextFen, { san });

      this.onAddMove(fen, san);

      return nextFen;
    } else {
      return "";
    }
  }

  deleteMove(fen: string, san: string): string[] {
    const nextFen = fenAfterMove(fen, san) || "";
    const moveExists = this.graph.hasEdge(fen, nextFen);

    if (moveExists) {
      const startPosition = this.graph.sources()[0];

      this.graph.removeEdge(fen, nextFen);
      const removed = this.removeOrphans(startPosition);
      this.onDeleteMove(fen, san, removed);

      return removed;
    } else {
      return [];
    }
  }

  movesFromPosition(fen: string): VariationMove[] {
    const successors = this.graph.successors(fen);

    if (successors) {
      return _.map(successors, successor => {
        return {
          moveData: this.graph.edge(fen, successor),
          resultingFen: successor
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

  asSaved(): SavedPositionCollection {
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

    const variations = _.map(this.getChildVariations(fen), variation =>
      _.map(variation, move => move.moveData.san)
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

  getChildVariations(fen: string): VariationMove[][] {
    const variations: VariationMove[][] = [];
    this.collectVariations(fen, variations);
    return variations;
  }

  getSourceVariations(fen: string, san: string): VariationMove[][] {
    const startPosition = this.graph.sources()[0];
    const allVariations = this.getChildVariations(startPosition);

    const variationsIncludingPosition = _.filter(allVariations, variation =>
      _.some(variation, move => move.resultingFen === fen)
    );

    return allVariations;
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
        const move = this.graph.edge(fen, successor);

        this.collectVariations(successor, collector, [
          ...path,
          { resultingFen: successor, moveData: move }
        ]);
      });
    }
  }
}
