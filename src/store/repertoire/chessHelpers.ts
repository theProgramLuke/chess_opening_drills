import _ from "lodash";
import { Chess } from "chess.js";
import { PgnMove, PgnGame } from "pgn-parser";

export function fenAfterMove(fen: string, san: string): string | undefined {
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

    nextFen = _.join(_.slice(fenSections, 0, 4), " "); // omits half move clock and full move number

    return nextFen;
  }
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

export function variationsFromPgnGame(game: PgnGame): string[][] {
  const variations: string[][] = [];
  variationsFromGame(game.moves, variations);

  return variations;
}
