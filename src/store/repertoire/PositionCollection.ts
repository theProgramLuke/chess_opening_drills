import { Graph, json, alg } from "graphlib";
import _ from "lodash";
import { Pgn } from "chess-pgn";

import { parse } from "pgn-parser";
import {
  fenAfterMove,
  variationsFromPgnGame
} from "@/store/repertoire/chessHelpers";
import { DrawShape } from "chessground/draw";

export interface MoveData {
  san: string;
}

export interface PositionAnnotations {
  comments: string;
  drawings: DrawShape[];
}

export interface VariationMove extends MoveData {
  sourceFen: string;
  resultingFen: string;
}

export type Variation = VariationMove[];

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
  asSaved: () => SavedPositionCollection;
  asPgn: (fen: string) => string;
  loadPgn: (pgn: string) => void;
  getChildVariations: (fen: string) => Variation[];
  getSourceVariations: (fen: string) => Variation[];
}

export class PositionCollection implements PositionCollectionInterface {
  private graph: Graph<never, PositionAnnotations | undefined, MoveData>;
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
          sourceFen: fen,
          san: this.graph.edge(fen, successor).san,
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

  setPositionAnnotations(
    fen: string,
    data: PositionAnnotations,
    append = false
  ): void {
    if (append) {
      const existingData = this.getPositionAnnotations(fen);
      data.drawings = _.concat(existingData.drawings, data.drawings);

      if (!_.isEmpty(existingData.comments)) {
        data.comments = `${existingData.comments}
${data.comments}`;
      }
    }

    this.graph.setNode(fen, data);
  }

  getPositionAnnotations(fen: string): PositionAnnotations {
    return this.graph.node(fen) || { comments: "", drawings: [] };
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
          if (!_.isUndefined(move.move)) {
            fen = this.addMove(fen, move.move);

            if (!_.isUndefined(move.comments) && !_.isEmpty(move.comments)) {
              this.setPositionAnnotations(
                fen,
                {
                  comments: move.comments[0].text,
                  drawings: []
                },
                true
              );
            }
          }
        });
      });
    });
  }

  getChildVariations(fen: string): Variation[] {
    const variations: Variation[] = [];
    this.collectVariations(fen, variations);
    return variations;
  }

  getSourceVariations(fen: string): Variation[] {
    const collector: Variation[] = [];

    this.getSourceVariationsRecursive(fen, collector);

    return collector;
  }

  private getSourceVariationsRecursive(
    fen: string,
    collector: Variation[],
    path: Variation = []
  ): void {
    const parents = this.graph.predecessors(fen);

    if (!(parents instanceof Array) || _.isEmpty(parents)) {
      if (!_.isEmpty(path)) {
        collector.push(path);
      }
    } else {
      _.forEach(parents, parent => {
        const move = this.graph.edge(parent, fen);

        const clonedPath = _.clone(path);
        clonedPath.unshift({
          ...move,
          sourceFen: parent,
          resultingFen: fen
        });

        this.getSourceVariationsRecursive(parent, collector, clonedPath);
      });
    }
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
          { sourceFen: fen, resultingFen: successor, san: move.san }
        ]);
      });
    }
  }
}
