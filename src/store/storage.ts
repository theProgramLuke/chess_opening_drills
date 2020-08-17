import ElectronStore from "electron-store";

import { RepertoireTag } from "./repertoireTag";
import { Side } from "./side";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Repertoire, SavedRepertoire } from "./repertoire";

const whiteStartPosition = new RepertoirePosition(
  "rnbqkbnr/pppppppr/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  true,
  "",
  Side.White
);

const blackStartPosition = new RepertoirePosition(
  "rnbqkbnr/pppppppr/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  false,
  "",
  Side.Black
);

interface Storage {
  darkMode: boolean;
  whiteRepertoire: SavedRepertoire;
  blackRepertoire: SavedRepertoire;
}

export function GetPersistantStorage(): ElectronStore<Storage> {
  return new ElectronStore<Storage>({
    defaults: {
      darkMode: false,
      whiteRepertoire: new Repertoire(
        [whiteStartPosition],
        [
          new RepertoireTag(
            0,
            Side.White,
            "White",
            whiteStartPosition,
            whiteStartPosition.fen,
            []
          )
        ]
      ).AsSaved(),
      blackRepertoire: new Repertoire(
        [blackStartPosition],
        [
          new RepertoireTag(
            0,
            Side.Black,
            "Black",
            blackStartPosition,
            blackStartPosition.fen,
            []
          )
        ]
      ).AsSaved()
    }
  });
}
