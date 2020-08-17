import ElectronStore from "electron-store";

import { RepertoireTag } from "./repertoireTag";
import { Side } from "./side";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Repertoire, SavedRepertoire } from "./repertoire";

export const defaultPositions = [
  new RepertoirePosition(
    "rnbqkbnr/pppppppr/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    true,
    "",
    Side.White
  )
];

let id = 0;

export const defaultTags = [
  new RepertoireTag(
    id++,
    Side.White,
    "White",
    defaultPositions[0],
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    []
  ),
  new RepertoireTag(
    id++,
    Side.Black,
    "Black",
    defaultPositions[0],
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    []
  )
];

interface Storage {
  darkMode: boolean;
  repertoire: SavedRepertoire;
}

export function GetPersistantStorage(): ElectronStore<Storage> {
  return new ElectronStore<Storage>({
    defaults: {
      darkMode: false,
      repertoire: new Repertoire(defaultPositions, defaultTags).AsSaved()
    }
  });
}
