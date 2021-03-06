import Vue from "vue";
import Vuex from "vuex";

import { mutations } from "@/store/Mutations";
import { PersistantStorage } from "@/store/PersistantStorage";

Vue.use(Vuex);

const storage = new PersistantStorage();

export default new Vuex.Store({
  state: {
    persisted: storage,
    darkMode: storage.darkMode,
    primary: storage.primary,
    secondary: storage.secondary,
    accent: storage.accent,
    error: storage.error,
    warning: storage.warning,
    info: storage.info,
    success: storage.success,
    boardTheme: storage.boardTheme,
    pieceTheme: storage.pieceTheme,
    whiteRepertoire: storage.whiteRepertoire,
    blackRepertoire: storage.blackRepertoire,
    engineMetadata: storage.engineMetadata,
    backupDirectory: storage.backupDirectory,
    dailyBackupLimit: storage.dailyBackupLimit,
    monthlyBackupLimit: storage.monthlyBackupLimit,
    yearlyBackupLimit: storage.yearlyBackupLimit,
    enableBackups: storage.enableBackups,
    moveAnimationSpeed: storage.moveAnimationSpeed,
  },

  mutations,

  actions: {},

  modules: {},

  strict: process.env.NODE_ENV !== "production",
});
