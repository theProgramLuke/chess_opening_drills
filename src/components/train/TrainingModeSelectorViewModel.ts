import { Vue, Component, Prop, Emit } from "vue-property-decorator";
import _ from "lodash";

import { Repertoire } from "@/store/repertoire/Repertoire";
import { TagTree } from "@/store/repertoire/TagTree";
import { TrainingMode } from "@/store/trainingMode";
import {
  TrainingOptions,
  TrainingVariation
} from "@/components/train/TrainingOptions";

const minPlaybackSpeed = 0.2;
const maxPlaybackSpeed = 5;

const minDifficulty = 1;
const maxDifficulty = 5;

@Component
export default class TrainingModeSelectorViewModel extends Vue {
  selectedTopics: TagTree[] = [];
  modes: TrainingMode[] = [
    TrainingMode.Scheduled,
    TrainingMode.New,
    TrainingMode.Cram,
    TrainingMode.Difficult
  ];
  selectedModes: TrainingMode[] = [TrainingMode.Scheduled];
  previewNewVariations = true;
  entireVariations = true;
  playbackSpeedSlideValue = 10;
  difficultyModeLimit = 15;

  @Prop({ required: true })
  whiteRepertoire!: Repertoire;

  @Prop({ required: true })
  blackRepertoire!: Repertoire;

  get combinedTags(): TagTree[] {
    return [this.whiteRepertoire.tags, this.blackRepertoire.tags];
  }

  get showPreviewInput(): boolean {
    return _.includes(this.selectedModes, TrainingMode.New);
  }

  get showDifficultyModeInput(): boolean {
    return _.includes(this.selectedModes, TrainingMode.Difficult);
  }

  get coercedPlaybackSpeed(): number {
    const normalized = this.playbackSpeedSlideValue / 100;
    return (
      minPlaybackSpeed + (maxPlaybackSpeed - minPlaybackSpeed) * normalized
    );
  }

  get coercedDifficultyModeLimit(): number {
    const normalized = this.difficultyModeLimit / 100;
    return minDifficulty + (maxDifficulty - minDifficulty) * normalized;
  }

  get trainingVariations(): TrainingVariation[] {
    const repertoires: Repertoire[] = [
      this.whiteRepertoire,
      this.blackRepertoire
    ];

    const trainingVariations: TrainingVariation[] = [];

    _.forEach(repertoires, repertoire => {
      const variations = repertoire.getTrainingVariations(
        this.selectedTopics,
        this.selectedModes
      );

      _.forEach(variations, variation => {
        trainingVariations.push({
          repertoire,
          variation
        });
      });
    });

    return trainingVariations;
  }

  get playbackSpeedLabel(): string {
    const speed = Number(this.coercedPlaybackSpeed).toFixed(1);
    return `Playback speed (${speed} seconds per move)`;
  }

  get startTrainingLabel(): string {
    const moveCount = 5; // TODO
    return `Start Training (${moveCount} positions)`;
  }

  get difficultyModeLimitLabel(): string {
    const difficulty = Number(this.coercedDifficultyModeLimit).toFixed(2);
    return `Difficulty Limit (${difficulty})`;
  }

  @Emit("onStartTraining")
  onStartTraining(): TrainingOptions {
    return new TrainingOptions(
      this.selectedTopics,
      this.trainingVariations,
      this.previewNewVariations,
      this.entireVariations,
      this.coercedPlaybackSpeed,
      this.coercedDifficultyModeLimit
    );
  }
}
