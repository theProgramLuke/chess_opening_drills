import Vue from "vue";
import { mapState, mapMutations } from "vuex";

import chessboard from "@/components/common/chessboard.vue";
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
