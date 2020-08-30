import { Storage, PersistantStorage } from "@/store/PersistantStorage";
import { RepertoirePosition } from "./repertoirePosition";
import { Move } from "./move";
import { TrainingEvent } from "./TrainingEvent";
import { RepertoireTag } from "./repertoireTag";
import { Side } from "./side";
import { PgnGame } from "./pgnParser";

interface VuexStorage extends Storage {
  persisted: PersistantStorage;
}

export function setDarkMode(state: VuexStorage, darkMode: boolean): void {
  state.darkMode = darkMode;
  state.persisted.darkMode = darkMode;
}

export function setBoardTheme(state: VuexStorage, boardTheme: string): void {
  state.boardTheme = boardTheme;
  state.persisted.boardTheme = boardTheme;
}

export function setPieceTheme(state: VuexStorage, pieceTheme: string): void {
  state.pieceTheme = pieceTheme;
  state.persisted.pieceTheme = pieceTheme;
}

export function setColor(
  state: VuexStorage,
  payload: {
    colorToSet:
      | "primary"
      | "secondary"
      | "accent"
      | "error"
      | "warning"
      | "info"
      | "success";
    color: string;
  }
): void {
  state[payload.colorToSet] = payload.color;
  state.persisted[payload.colorToSet] = payload.color;
}

export function addRepertoirePosition(
  state: VuexStorage,
  payload: { parent: RepertoirePosition; newMove: Move }
): void {
  if (payload.parent && payload.newMove) {
    const repertoire =
      payload.parent.forSide === Side.White
        ? state.whiteRepertoire
        : state.blackRepertoire;
    const repertoireKey =
      payload.parent.forSide === Side.White
        ? "whiteRepertoire"
        : "blackRepertoire";

    repertoire.AddMove(payload.parent, payload.newMove);

    state.persisted[repertoireKey] = repertoire;
  }
}

export function addRepertoireTag(
  state: VuexStorage,
  payload: { parent: RepertoireTag; tag: RepertoireTag }
): void {
  if (payload.parent && payload.tag) {
    const repertoire =
      payload.parent.forSide === Side.White
        ? state.whiteRepertoire
        : state.blackRepertoire;
    const repertoireKey =
      payload.parent.forSide === Side.White
        ? "whiteRepertoire"
        : "blackRepertoire";

    payload.parent.AddChild(payload.tag);

    state.persisted[repertoireKey] = repertoire;
  }
}

export function addTrainingEvent(
  state: VuexStorage,
  payload: { position: RepertoirePosition; event: TrainingEvent }
): void {
  if (payload.position && payload.event) {
    const repertoire =
      payload.position.forSide === Side.White
        ? state.whiteRepertoire
        : state.blackRepertoire;
    const repertoireKey =
      payload.position.forSide === Side.White
        ? "whiteRepertoire"
        : "blackRepertoire";

    payload.position.AddTrainingEvent(payload.event);

    state.persisted[repertoireKey] = repertoire;
  }
}

export function removeRepertoireTag(
  state: VuexStorage,
  tag: RepertoireTag
): void {
  const repertoire =
    tag.forSide === Side.White ? state.whiteRepertoire : state.blackRepertoire;
  const repertoireKey =
    tag.forSide === Side.White ? "whiteRepertoire" : "blackRepertoire";

  repertoire.RemoveRepertoireTag(tag);

  state.persisted[repertoireKey] = repertoire;
}

export function removeRepertoireMove(state: VuexStorage, move: Move): void {
  const repertoire =
    move.position.forSide === Side.White
      ? state.whiteRepertoire
      : state.blackRepertoire;
  const repertoireKey =
    move.position.forSide === Side.White
      ? "whiteRepertoire"
      : "blackRepertoire";

  repertoire.RemoveMove(move);

  state.persisted[repertoireKey] = repertoire;
}

export function addPositionsFromGame(
  state: VuexStorage,
  payload: { forSide: Side; game: PgnGame }
): void {
  if (payload.game) {
    const repertoire =
      payload.forSide === Side.White
        ? state.whiteRepertoire
        : state.blackRepertoire;
    const repertoireKey =
      payload.forSide === Side.White ? "whiteRepertoire" : "blackRepertoire";

    repertoire.AddFromGame(payload.game);

    state.persisted[repertoireKey] = repertoire;
  }
}

export function clearStorage(state: VuexStorage): void {
  state.persisted.clear();
}
