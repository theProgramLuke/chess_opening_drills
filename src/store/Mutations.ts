import { Storage, PersistantStorage } from "@/store/PersistantStorage";
import { Side } from "@/store/side";
import { Repertoire } from "@/store/repertoire/Repertoire";
import { EngineMetadata } from "@/store/EngineHelpers";
import {
  AddTrainingEventPayload,
  AddRepertoireMovePayload,
  SetColorPayload,
  AddRepertoireTagPayload,
  RemoveRepertoireMovePayload,
  RemoveRepertoireTagPayload,
  AddMovesFromPgnPayload
} from "@/store/MutationPayloads";

export interface MutationState extends Storage {
  persisted: PersistantStorage;
}

function setRepertoireForSide(
  state: MutationState,
  forSide: Side,
  repertoire: Repertoire
) {
  if (forSide === Side.White) {
    state.whiteRepertoire = repertoire;
    state.persisted.whiteRepertoire = repertoire;
  } else {
    state.blackRepertoire = repertoire;
    state.persisted.blackRepertoire = repertoire;
  }
}

export const mutations = {
  setDarkMode(state: MutationState, darkMode: boolean): void {
    state.darkMode = darkMode;
    state.persisted.darkMode = darkMode;
  },

  setBoardTheme(state: MutationState, boardTheme: string): void {
    state.boardTheme = boardTheme;
    state.persisted.boardTheme = boardTheme;
  },

  setPieceTheme(state: MutationState, pieceTheme: string): void {
    state.pieceTheme = pieceTheme;
    state.persisted.pieceTheme = pieceTheme;
  },

  setColor(state: MutationState, payload: SetColorPayload): void {
    state[payload.colorToSet] = payload.color;
    state.persisted[payload.colorToSet] = payload.color;
  },

  addRepertoireMove(
    state: MutationState,
    payload: AddRepertoireMovePayload
  ): void {
    payload.repertoire.positions.addMove(payload.fen, payload.san);

    setRepertoireForSide(
      state,
      payload.repertoire.sideToTrain,
      payload.repertoire
    );
  },

  addRepertoireTag(
    state: MutationState,
    payload: AddRepertoireTagPayload
  ): void {
    payload.parent.addTag(payload.name, payload.fen);

    setRepertoireForSide(
      state,
      payload.repertoire.sideToTrain,
      payload.repertoire
    );
  },

  addTrainingEvent(
    state: MutationState,
    payload: AddTrainingEventPayload
  ): void {
    const moveTraining = payload.repertoire.training.getTrainingForMove(
      payload.fen,
      payload.san
    );
    if (moveTraining) {
      moveTraining.addTrainingEvent(payload.event);
    }

    setRepertoireForSide(
      state,
      payload.repertoire.sideToTrain,
      payload.repertoire
    );
  },

  removeRepertoireTag(
    state: MutationState,
    payload: RemoveRepertoireTagPayload
  ): void {
    payload.parent.removeTag(payload.fen);

    setRepertoireForSide(
      state,
      payload.repertoire.sideToTrain,
      payload.repertoire
    );
  },

  removeRepertoireMove(
    state: MutationState,
    payload: RemoveRepertoireMovePayload
  ): void {
    payload.repertoire.positions.deleteMove(payload.fen, payload.san);

    setRepertoireForSide(
      state,
      payload.repertoire.sideToTrain,
      payload.repertoire
    );
  },

  addPositionsFromPgn(
    state: MutationState,
    payload: AddMovesFromPgnPayload
  ): void {
    payload.repertoire.positions.loadPgn(payload.pgn);

    setRepertoireForSide(
      state,
      payload.repertoire.sideToTrain,
      payload.repertoire
    );
  },

  setEngineMetadata(
    state: MutationState,
    engineMetadata?: EngineMetadata
  ): void {
    state.engineMetadata = engineMetadata;
    state.persisted.engineMetadata = engineMetadata;
  },

  setBackupDirectory(state: MutationState, backupDirectory: string): void {
    state.backupDirectory = backupDirectory;
    state.persisted.backupDirectory = backupDirectory;
  },

  setDailyBackupLimit(state: MutationState, limit: number): void {
    state.dailyBackupLimit = limit;
    state.persisted.dailyBackupLimit = limit;
  },

  setMonthlyBackupLimit(state: MutationState, limit: number): void {
    state.monthlyBackupLimit = limit;
    state.persisted.monthlyBackupLimit = limit;
  },

  setYearlyBackupLimit(state: MutationState, limit: number): void {
    state.yearlyBackupLimit = limit;
    state.persisted.yearlyBackupLimit = limit;
  },

  setEnableBackups(state: MutationState, enable: boolean): void {
    state.enableBackups = enable;
    state.persisted.enableBackups = enable;
  },

  setMoveAnimationSpeed(state: MutationState, speed: number): void {
    state.moveAnimationSpeed = speed;
    state.persisted.moveAnimationSpeed = speed;
  },

  clearStorage(state: MutationState): void {
    state.persisted.clear();
  }
};
