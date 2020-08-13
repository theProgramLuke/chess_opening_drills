export class Position {
  fen: string;
  comment: string;
  parents: Array<string>;
  children: Array<string>;
  myTurn: boolean;

  constructor(
    fen: string,
    myTurn: boolean,
    comment: string,
    parents: Array<string>,
    children: Array<string>
  ) {
    this.fen = fen;
    this.comment = comment;
    this.parents = parents;
    this.children = children;
    this.myTurn = myTurn;
  }
}
