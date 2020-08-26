<template lang="pug">
  v-container
    v-row
      v-expansion-panels(v-model="panels", hover, popout)
        v-expansion-panel
          v-expansion-panel-header Application Appearance
          v-expansion-panel-content.pa-2
            v-switch(v-model="selectedDarkMode", label="Dark Mode")

            v-select(
              v-model="selectedColor",
              :items="colorOptions",
              label="Colors",
              solo)

            v-color-picker(
              v-if="selectedColor",
              v-model="selectedColorValue")

            v-btn(v-if="false", color="warning")
              | Reset Appearance

        v-expansion-panel
          v-expansion-panel-header Board Appearance
          v-expansion-panel-content.pa-2
            v-select(
              v-model="selectedBoardTheme",
              :items="boardThemes",
              label="Board",
              solo)
            v-select(
              v-model="selectedPieceTheme",
              :items="pieceThemes",
              label="Pieces",
              solo)

            v-col(cols=4)
              chessboard(fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")

        v-expansion-panel
          v-expansion-panel-header Development
          v-expansion-panel-content.pa-2
            v-btn(@click="clearStorage", color="error")
             | Clear All Storage
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapMutations } from "vuex";

import chessboard from "@/components/chessboard.vue";
import { BoardThemes, PieceThemes } from "@/views/ChessgroundThemes";

export default Vue.extend({
  data: () => ({
    panels: [],
    colorPanels: [],
    colorOptions: [
      "primary",
      "secondary",
      "accent",
      "error",
      "warning",
      "info",
      "success"
    ],
    selectedColor: "",
    boardThemes: BoardThemes,
    pieceThemes: PieceThemes
  }),

  components: {
    chessboard
  },

  computed: {
    ...mapState(["darkMode", "boardTheme", "pieceTheme"]),

    selectedDarkMode: {
      get() {
        return this.darkMode;
      },
      set(darkMode: boolean) {
        this.setDarkMode(darkMode);
      }
    },

    selectedColorValue: {
      get() {
        return this.$vuetify.theme.currentTheme[this.selectedColor] as string;
      },
      set(color: string) {
        this.setColor({
          colorToSet: this.selectedColor,
          color: color
        });
      }
    },

    selectedBoardTheme: {
      get() {
        return this.boardTheme;
      },
      set(boardTheme: string) {
        this.setBoardTheme(boardTheme);
      }
    },

    selectedPieceTheme: {
      get() {
        return this.pieceTheme;
      },
      set(pieceTheme: string) {
        this.setPieceTheme(pieceTheme);
      }
    }
  },

  methods: mapMutations([
    "setDarkMode",
    "setColor",
    "setBoardTheme",
    "setPieceTheme",
    "clearStorage"
  ])
});
</script>
