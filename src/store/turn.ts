import { Move } from "@/store/move";

export class Turn {
  whiteMove: Move;
  blackMove?: Move;

  constructor(whiteMove: Move, blackMove?: Move) {
    (this.whiteMove = whiteMove), (this.blackMove = blackMove);
  }
}
