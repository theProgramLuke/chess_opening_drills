export class Move {
  san: string;
  fen: string;

  constructor(san: string, fen: string) {
    this.san = san;
    this.fen = fen;
  }
}
