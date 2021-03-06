import { Storage, PersistantStorage } from "@/store/PersistantStorage";
import { Side } from "@/store/side";
import { Repertoire } from "@/store/repertoire/Repertoire";
import {
  AddTrainingEventPayload,
  AddRepertoireMovePayload,
  SetColorPayload,
  AddRepertoireTagPayload,
  RemoveRepertoireMovePayload,
  RemoveRepertoireTagPayload,
  AddMovesFromPgnPayload,
  SetPositionCommentsPayload,
  SetPositionDrawingsPayload,
  SetDarkModePayload,
  SetPieceThemePayload,
  SetBoardThemePayload,
  SetBackupDirectoryPayload,
  SetBackupLimitPayload,
  SetMoveAnimationSpeedPayload,
  SetEngineMetadataPayload,
  SetEnableBackupsPayload,
} from "@/store/MutationPayloads";

export interface MutationState extends Storage {
  persisted: PersistantStorage;
}

function saveRepertoire(state: MutationState, repertoire: Repertoire) {
  if (repertoire.sideToTrain === Side.White) {
    state.whiteRepertoire = repertoire;
    state.persisted.whiteRepertoire = repertoire;
  } else {
    state.blackRepertoire = repertoire;
    state.persisted.blackRepertoire = repertoire;
  }
}

export const mutations = {
  setDarkMode(state: MutationState, darkMode: SetDarkModePayload): void {
    state.darkMode = darkMode;
    state.persisted.darkMode = darkMode;
  },

  setBoardTheme(state: MutationState, boardTheme: SetBoardThemePayload): void {
    state.boardTheme = boardTheme;
    state.persisted.boardTheme = boardTheme;
  },

  setPieceTheme(state: MutationState, pieceTheme: SetPieceThemePayload): void {
    state.pieceTheme = pieceTheme;
    state.persisted.pieceTheme = pieceTheme;
  },

  setColor(state: MutationState, payload: SetColorPayload): void {
    state[payload.colorToSet] = payload.value;
    state.persisted[payload.colorToSet] = payload.value;
  },

  addRepertoireMove(
    state: MutationState,
    payload: AddRepertoireMovePayload
  ): void {
    payload.repertoire.positions.addMove(payload.fen, payload.san);

    saveRepertoire(state, payload.repertoire);
  },

  addRepertoireTag(
    state: MutationState,
    payload: AddRepertoireTagPayload
  ): void {
    payload.parent.addTag(payload.name, payload.fen);

    saveRepertoire(state, payload.repertoire);
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

    saveRepertoire(state, payload.repertoire);
  },

  removeRepertoireTag(
    state: MutationState,
    payload: RemoveRepertoireTagPayload
  ): void {
    payload.repertoire.tags.removeTag(payload.id);

    saveRepertoire(state, payload.repertoire);
  },

  removeRepertoireMove(
    state: MutationState,
    payload: RemoveRepertoireMovePayload
  ): void {
    payload.repertoire.positions.deleteMove(payload.fen, payload.san);

    saveRepertoire(state, payload.repertoire);
  },

  addPositionsFromPgn(
    state: MutationState,
    payload: AddMovesFromPgnPayload
  ): void {
    payload.repertoire.positions.loadPgn(payload.pgn);

    saveRepertoire(state, payload.repertoire);
  },

  setPositionComments(
    state: MutationState,
    payload: SetPositionCommentsPayload
  ): void {
    payload.repertoire.positions.setPositionComments(
      payload.fen,
      payload.comments
    );

    saveRepertoire(state, payload.repertoire);
  },

  setPositionDrawings(
    state: MutationState,
    payload: SetPositionDrawingsPayload
  ): void {
    payload.repertoire.positions.setPositionDrawings(
      payload.fen,
      payload.drawings
    );

    saveRepertoire(state, payload.repertoire);
  },

  setEngineMetadata(
    state: MutationState,
    engineMetadata: SetEngineMetadataPayload
  ): void {
    state.engineMetadata = engineMetadata;
    state.persisted.engineMetadata = engineMetadata;
  },

  setBackupDirectory(
    state: MutationState,
    backupDirectory: SetBackupDirectoryPayload
  ): void {
    state.backupDirectory = backupDirectory;
    state.persisted.backupDirectory = backupDirectory;
  },

  setDailyBackupLimit(
    state: MutationState,
    limit: SetBackupLimitPayload
  ): void {
    state.dailyBackupLimit = limit;
    state.persisted.dailyBackupLimit = limit;
  },

  setMonthlyBackupLimit(
    state: MutationState,
    limit: SetBackupLimitPayload
  ): void {
    state.monthlyBackupLimit = limit;
    state.persisted.monthlyBackupLimit = limit;
  },

  setYearlyBackupLimit(
    state: MutationState,
    limit: SetBackupLimitPayload
  ): void {
    state.yearlyBackupLimit = limit;
    state.persisted.yearlyBackupLimit = limit;
  },

  setEnableBackups(
    state: MutationState,
    enable: SetEnableBackupsPayload
  ): void {
    state.enableBackups = enable;
    state.persisted.enableBackups = enable;
  },

  setMoveAnimationSpeed(
    state: MutationState,
    speed: SetMoveAnimationSpeedPayload
  ): void {
    state.moveAnimationSpeed = speed;
    state.persisted.moveAnimationSpeed = speed;
  },

  clearStorage(state: MutationState): void {
    state.persisted.clear();
  },
};
