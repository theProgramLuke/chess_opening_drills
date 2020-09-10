import Vue from "vue";
import { mapState, mapMutations } from "vuex";
import _ from "lodash";

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
      get(): boolean {
        return this.darkMode;
      },
      set(darkMode: boolean): void {
        this.setDarkMode(darkMode);
      }
    },

    selectedColorValue: {
      get(): string {
        return this.$vuetify.theme.currentTheme[this.selectedColor] as string;
      },
      set(color: string): void {
        this.setColor({
          colorToSet: this.selectedColor,
          color: color
        });
      }
    },

    selectedBoardTheme: {
      get(): string {
        return this.boardTheme;
      },
      set(boardTheme: string): void {
        this.setBoardTheme(boardTheme);
      }
    },

    selectedPieceTheme: {
      get(): string {
        return this.pieceTheme;
      },
      set(pieceTheme: string): void {
        this.setPieceTheme(pieceTheme);
      }
    },

    selectedEngineMetadata(): EngineMetadata {
      return _.cloneDeep(this.engineMetadata);
    },

    selectedEngine: {
      get(): File | undefined {
        if (this.selectedEngineMetadata) {
          return new File([], this.selectedEngineMetadata.filePath);
        }

        return undefined;
      },
      async set(newEngine?: File): Promise<void> {
        if (newEngine) {
          this.setEngineMetadata(await GetMetadataFromEngine(newEngine.path));
        } else {
          this.setEngineMetadata(undefined);
        }
      }
    }
  },

  methods: {
    ...mapMutations([
      "setDarkMode",
      "setColor",
      "setBoardTheme",
      "setPieceTheme",
      "setEngineMetadata",
      "clearStorage"
    ]),

    updateEngineMetadata(): void {
      this.setEngineMetadata(this.selectedEngineMetadata);
    }
  }
});
