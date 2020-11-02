import "reflect-metadata";
import { Vue, Component, Watch } from "vue-property-decorator";
import { State, Mutation } from "vuex-class";
import _ from "lodash";

import chessboard from "@/components/common/chessboard.vue";
import { BoardThemes, PieceThemes } from "@/views/ChessgroundThemes";
import { GetMetadataFromEngine, EngineMetadata } from "@/store/EngineHelpers";
import {
  SetBackupDirectoryPayload,
  SetBackupLimitPayload,
  SetEnableBackupsPayload,
  SetBoardThemePayload,
  SetColorPayload,
  SetDarkModePayload,
  SetEngineMetadataPayload,
  SetPieceThemePayload,
  SetMoveAnimationSpeedPayload,
  ColorName,
} from "@/store/MutationPayloads";

@Component({ components: { chessboard } })
export default class SettingsViewModel extends Vue {
  readonly colorOptions: ColorName[] = [
    "primary",
    "secondary",
    "accent",
    "error",
    "warning",
    "info",
    "success",
  ];
  readonly boardThemes = BoardThemes;
  readonly pieceThemes = PieceThemes;
  selectedColor: ColorName | "" = "";
  // hack so that this will be reactive https://github.com/vuejs/vue-class-component/issues/211
  selectedEngineMetadata?: EngineMetadata = (null as unknown) as EngineMetadata;

  mounted(): void {
    this.selectedEngineMetadata = _.cloneDeep(this.engineMetadata);
  }

  @State
  private darkMode!: boolean;

  @State
  private boardTheme!: string;

  @State
  private pieceTheme!: string;

  @State
  private engineMetadata?: EngineMetadata;

  @State
  private backupDirectory?: string;

  @State
  private dailyBackupLimit!: number;

  @State
  private monthlyBackupLimit!: number;

  @State
  private yearlyBackupLimit!: number;

  @State
  private enableBackups!: boolean;

  @State
  private moveAnimationSpeed!: number;

  @Mutation
  setDarkMode!: (payload: SetDarkModePayload) => void;

  @Mutation
  setColor!: (payload: SetColorPayload) => void;

  @Mutation
  setBoardTheme!: (payload: SetBoardThemePayload) => void;

  @Mutation
  setPieceTheme!: (payload: SetPieceThemePayload) => void;

  @Mutation
  setEngineMetadata!: (payload: SetEngineMetadataPayload) => void;

  @Mutation
  setBackupDirectory!: (payload: SetBackupDirectoryPayload) => void;

  @Mutation
  setDailyBackupLimit!: (payload: SetBackupLimitPayload) => void;

  @Mutation
  setMonthlyBackupLimit!: (payload: SetBackupLimitPayload) => void;

  @Mutation
  setYearlyBackupLimit!: (payload: SetBackupLimitPayload) => void;

  @Mutation
  setEnableBackups!: (payload: SetEnableBackupsPayload) => void;

  @Mutation
  setMoveAnimationSpeed!: (payload: SetMoveAnimationSpeedPayload) => void;

  @Mutation
  clearStorage!: () => void;

  @Watch("selectedEngineMetadata", { deep: true })
  setSelectedEngineMetadata(metadata: SetEngineMetadataPayload): void {
    this.setEngineMetadata(_.cloneDeep(metadata));
  }

  get selectedDarkMode(): boolean {
    return this.darkMode;
  }

  set selectedDarkMode(darkMode: boolean) {
    this.setDarkMode(darkMode);
  }

  get selectedColorValue(): string {
    return this.$vuetify.theme.currentTheme[this.selectedColor] as string;
  }

  set selectedColorValue(value: string) {
    if (this.selectedColor !== "")
      this.setColor({
        colorToSet: this.selectedColor,
        value,
      });
  }

  get selectedBoardTheme() {
    return this.boardTheme;
  }

  set selectedBoardTheme(boardTheme: string) {
    this.setBoardTheme(boardTheme);
  }

  get selectedPieceTheme(): string {
    return this.pieceTheme;
  }

  set selectedPieceTheme(pieceTheme: string) {
    this.setPieceTheme(pieceTheme);
  }

  get selectedEngine(): File | undefined {
    if (this.selectedEngineMetadata) {
      const engineFile = new File([], this.selectedEngineMetadata.filePath);
      return engineFile;
    }

    return undefined;
  }

  set selectedEngine(newEngine: File | undefined) {
    this.setSelectedEngineAsync(newEngine);
  }

  async setSelectedEngineAsync(newEngine: File | undefined) {
    if (newEngine) {
      const path = newEngine.path || newEngine.name;
      await GetMetadataFromEngine(path).then(metadata => {
        this.setEngineMetadata(metadata);
        this.selectedEngineMetadata = metadata;
      });
    } else {
      this.setEngineMetadata(undefined);
      this.selectedEngineMetadata = undefined;
    }
  }

  get selectedBackupDirectory(): string | undefined {
    return this.backupDirectory;
  }

  set selectedBackupDirectory(backupDirectory: string | undefined) {
    this.setBackupDirectory(backupDirectory);
  }

  get selectedDailyBackupLimit(): number {
    return this.dailyBackupLimit;
  }

  set selectedDailyBackupLimit(limit: number) {
    this.setDailyBackupLimit(limit);
  }

  get selectedMonthlyBackupLimit(): number {
    return this.monthlyBackupLimit;
  }

  set selectedMonthlyBackupLimit(limit: number) {
    this.setMonthlyBackupLimit(limit);
  }

  get selectedYearlyBackupLimit(): number {
    return this.yearlyBackupLimit;
  }

  set selectedYearlyBackupLimit(limit: number) {
    this.setYearlyBackupLimit(limit);
  }

  get selectedEnableBackups(): boolean {
    return this.enableBackups;
  }

  set selectedEnableBackups(enable: boolean) {
    this.setEnableBackups(enable);
  }

  get selectedMoveAnimationSpeed(): number {
    return this.moveAnimationSpeed;
  }

  set selectedMoveAnimationSpeed(speed: number) {
    this.setMoveAnimationSpeed(speed);
  }
}
