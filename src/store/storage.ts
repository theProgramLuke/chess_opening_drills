import ElectronStore from "electron-store";

import { RepertoireTag } from "./repertoireTag";
import { Side } from "./side";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Repertoire, SavedRepertoire } from "./repertoire";

const whiteStartPosition = new RepertoirePosition(
  "rnbqkbnr/pppppppr/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "",
  Side.White,
  true
);

const blackStartPosition = new RepertoirePosition(
  "rnbqkbnr/pppppppr/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "",
  Side.Black,
  false
);

interface Storage {
  darkMode: boolean;
  primary: string;
  secondary: string;
  accent: string;
  error: string;
  warning: string;
  info: string;
  success: string;
  whiteRepertoire: SavedRepertoire;
  blackRepertoire: SavedRepertoire;
}

export function GetPersistantStorage(): ElectronStore<Storage> {
  return new ElectronStore<Storage>({
    defaults: {
      darkMode: false,
      primary: "#2196F3",
      secondary: "#424242",
      accent: "#FF4081",
      error: "#FF5252",
      warning: "#FFC107",
      info: "#2196F3",
      success: "#4CAF50",
      whiteRepertoire: new Repertoire(
        [whiteStartPosition],
        [
          new RepertoireTag(
            Side.White,
            "White",
            whiteStartPosition,
            whiteStartPosition.fen,
            [],
            "whiteStart"
          )
        ]
      ).AsSaved(),
      blackRepertoire: new Repertoire(
        [blackStartPosition],
        [
          new RepertoireTag(
            Side.Black,
            "Black",
            blackStartPosition,
            blackStartPosition.fen,
            [],
            "blackStart"
          )
        ]
      ).AsSaved()
    }
  });
}
