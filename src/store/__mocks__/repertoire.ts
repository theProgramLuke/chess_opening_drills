import _ from "lodash";

import {
  RepertoirePosition,
  SavedRepertoirePosition
} from "@/store/repertoirePosition";
import { RepertoireTag, SavedRepertoireTag } from "@/store/repertoireTag";
import { Move } from "@/store/move";
import { PgnGame } from "pgn-parser";

export class SavedRepertoire {
  positions: SavedRepertoirePosition[];
  tags: SavedRepertoireTag[];

  constructor(
    positions: SavedRepertoirePosition[],
    tags: SavedRepertoireTag[]
  ) {
    this.positions = positions;
    this.tags = tags;
  }
}

export class Repertoire {
  positions: RepertoirePosition[];
  tags: RepertoireTag[];

  constructor(positions: RepertoirePosition[], tags: RepertoireTag[]) {
    this.positions = positions;
    this.tags = tags;
    this.AddMove = jest.fn();
    this.RemoveRepertoireTag = jest.fn();
    this.RemoveMove = jest.fn();
    this.AddFromGame = jest.fn();
    this.AsSaved = jest.fn();
  }

  AddMove: (parent: RepertoirePosition, move: Move) => void;

  RemoveRepertoireTag: (tagToRemove: RepertoireTag) => void;

  RemoveMove: (move: Move) => void;

  AddFromGame: (game: PgnGame) => void;

  AsSaved: () => SavedRepertoire;

  static FromSaved: (saved: SavedRepertoire) => Repertoire = jest.fn();
}
