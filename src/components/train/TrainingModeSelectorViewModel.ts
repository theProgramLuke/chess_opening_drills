import "reflect-metadata";
import { Vue, Component, Prop, Emit } from "vue-property-decorator";
import _ from "lodash";
import shuffle from "lodash/shuffle";

import { Repertoire } from "@/store/repertoire/Repertoire";
import { TagTree } from "@/store/repertoire/TagTree";
import { TrainingMode } from "@/store/trainingMode";
import {
  TrainingOptions,
  TrainingVariation,
} from "@/components/train/TrainingOptions";
import { sideFromFen } from "@/store/repertoire/chessHelpers";

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
    TrainingMode.Difficult,
  ];
  selectedModes: TrainingMode[] = [TrainingMode.Scheduled];
  previewNewVariations = true;
  entireVariations = true;
  playbackSpeedSlideValue = 10;
  difficultyModeLimit = 15;
  shouldShuffle = false;

  @Prop({ required: true })
  whiteRepertoire!: Repertoire;

  @Prop({ required: true })
  blackRepertoire!: Repertoire;

  get combinedTags(): TagTree[] {
    return [this.whiteRepertoire.tags, this.blackRepertoire.tags];
  }

  get showPreviewInput(): boolean {
    const anyNewMoves = _.some(
      _.map([this.whiteRepertoire, this.blackRepertoire], repertoire =>
        repertoire.getTrainingVariations(
          this.selectedTopics,
          [TrainingMode.New],
          this.entireVariations,
          this.coercedDifficultyModeLimit
        )
      )
    );

    return _.includes(this.selectedModes, TrainingMode.New) || anyNewMoves;
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
      this.blackRepertoire,
    ];

    const trainingVariations: TrainingVariation[] = [];

    _.forEach(repertoires, repertoire => {
      const variations = repertoire.getTrainingVariations(
        this.selectedTopics,
        this.selectedModes,
        this.entireVariations,
        this.coercedDifficultyModeLimit
      );

      _.forEach(variations, variation => {
        trainingVariations.push({
          repertoire,
          variation,
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
    let moveCount = 0;

    _.forEach(this.trainingVariations, trainingVariation => {
      const sideToTrain = trainingVariation.repertoire.sideToTrain;
      _.forEach(trainingVariation.variation, move => {
        const sideOfMove = sideFromFen(move.sourceFen);
        if (sideOfMove === sideToTrain) {
          ++moveCount;
        }
      });
    });

    return `Start Training (${moveCount} moves)`;
  }

  get difficultyModeLimitLabel(): string {
    const difficulty = Number(this.coercedDifficultyModeLimit).toFixed(2);
    return `Difficulty Limit (${difficulty})`;
  }

  @Emit("onStartTraining")
  onStartTraining(): TrainingOptions {
    return new TrainingOptions(
      this.selectedTopics,
      this.maybeShuffledTrainingVariations,
      this.previewNewVariations,
      this.entireVariations,
      this.coercedPlaybackSpeed,
      this.coercedDifficultyModeLimit
    );
  }

  private get maybeShuffledTrainingVariations(): TrainingVariation[] {
    if (this.shouldShuffle) {
      const shuffled = shuffle(this.trainingVariations);
      return shuffled;
    } else {
      return this.trainingVariations;
    }
  }
}
