import Vue from "vue";
import { mapState, mapMutations } from "vuex";

import chessboard from "@/components/common/chessboard.vue";
import { BoardThemes, PieceThemes } from "@/views/ChessgroundThemes";
import { GetMetadataFromEngine, EngineMetadata } from "@/store/EngineHelpers";

interface SettingsViewModelData {
  panels?: number;
  colorPanels?: number;
  colorOptions: string[];
  selectedColor: string;
  boardThemes: string[];
  pieceThemes: string[];
}

export default Vue.extend({
  data(): SettingsViewModelData {
    return {
      panels: undefined,
      colorPanels: undefined,
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
    };
  },

  components: {
    chessboard
  },

  computed: {
    ...mapState(["darkMode", "boardTheme", "pieceTheme", "engineMetadata"]),

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
    },

    selectedEngineMetadata: {
      get(): EngineMetadata {
        return this.engineMetadata;
      },
      set(engineMetadata: EngineMetadata) {
        this.setEngineMetadata(engineMetadata);
      }
    },

    selectedEngine: {
      get(): File | undefined {
        if (this.selectedEngineMetadata) {
          return new File([], this.selectedEngineMetadata.filePath);
        }

        return undefined;
      },
      async set(newEngine?: File) {
        if (newEngine) {
          this.selectedEngineMetadata = await GetMetadataFromEngine(
            newEngine.path
          );
        } else {
          this.selectedEngineMetadata = undefined;
        }
      }
    }
  },

  watch: {
    selectedEngineMetadata: {
      deep: true,
      handler(updatedMetadata) {
        this.setEngineMetadata(updatedMetadata);
      }
    }
  },

  methods: mapMutations([
    "setDarkMode",
    "setColor",
    "setBoardTheme",
    "setPieceTheme",
    "setEngineMetadata",
    "clearStorage"
  ])
});
