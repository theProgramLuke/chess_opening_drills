import Vue from "vue";
import _ from "lodash";
import { Repertoire } from "@/store/repertoire";
import {
  RepertoireTag,
  GetTrainingPositions,
  GetTrainingMoveLists
} from "@/store/repertoireTag";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { TrainingMode } from "@/store/trainingMode";
import { Move } from "@/store/move";

const minPlaybackSpeed = 0.2;
const maxPlaybackSpeed = 5;

const minDifficulty = 1;
const maxDifficulty = 5;

export class TrainingOptions {
  topics: RepertoireTag[];
  variations: Move[][];
  previewNewVariations: boolean;
  entireVariations: boolean;
  playbackSpeed: number;
  difficultyModeLimit: number;

  constructor(
    topics: RepertoireTag[],
    variations: Move[][],
    previewNewVariations: boolean,
    entireVariations: boolean,
    playbackSpeed: number,
    difficultyModeLimit: number
  ) {
    this.topics = topics;
    (this.variations = variations),
      (this.previewNewVariations = previewNewVariations);
    this.entireVariations = entireVariations;
    this.playbackSpeed = playbackSpeed;
    this.difficultyModeLimit = difficultyModeLimit;
  }
}

export default Vue.extend({
  data: () => ({
    selectedTopics: [] as RepertoireTag[],
    modes: [
      TrainingMode.Scheduled,
      TrainingMode.New,
      TrainingMode.Cram,
      TrainingMode.Difficult
    ],
    selectedModes: [TrainingMode.Scheduled],
    previewNewVariations: true,
    entireVariations: true,
    playbackSpeedSlideValue: 10,
    difficultyModeLimit: 15
  }),

  props: {
    whiteRepertoire: {
      type: Repertoire,
      required: true
    },

    blackRepertoire: {
      type: Repertoire,
      required: true
    }
  },

  computed: {
    combinedTags(): RepertoireTag[] {
      return _.concat(this.whiteRepertoire.tags, this.blackRepertoire.tags);
    },

    showPreviewInput(): boolean {
      return _.includes(this.selectedModes, TrainingMode.New);
    },

    showDifficultyModeInput(): boolean {
      return _.includes(this.selectedModes, TrainingMode.Difficult);
    },

    coercedPlaybackSpeed(): number {
      const normalized = this.playbackSpeedSlideValue / 100;
      return (
        minPlaybackSpeed + (maxPlaybackSpeed - minPlaybackSpeed) * normalized
      );
    },

    coercedDifficultyModeLimit(): number {
      const normalized = this.difficultyModeLimit / 100;
      return minDifficulty + (maxDifficulty - minDifficulty) * normalized;
    },

    trainingPositions(): RepertoirePosition[] {
      return GetTrainingPositions(
        this.selectedModes,
        this.selectedTopics,
        this.coercedDifficultyModeLimit
      );
    },

    playbackSpeedLabel(): string {
      const speed = Number(this.coercedPlaybackSpeed).toFixed(1);
      return "Playback speed (" + speed + " seconds per move)";
    },

    startTrainingLabel(): string {
      return "Start Training (" + this.trainingPositions.length + " positions)";
    },

    difficultyModeLimitLabel(): string {
      const difficulty = Number(this.coercedDifficultyModeLimit).toFixed(2);
      return "Difficulty Limit (" + difficulty + ")";
    }
  },

  methods: {
    onStartTraining() {
      this.$emit(
        "onStartTraining",
        new TrainingOptions(
          this.selectedTopics,
          GetTrainingMoveLists(
            this.selectedModes,
            this.selectedTopics,
            this.coercedDifficultyModeLimit,
            this.entireVariations
          ),
          this.previewNewVariations,
          this.entireVariations,
          this.coercedPlaybackSpeed,
          this.coercedDifficultyModeLimit
        )
      );
    }
  }
});
