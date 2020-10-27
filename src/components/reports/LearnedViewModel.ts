import "reflect-metadata";
import { Vue, Component } from "vue-property-decorator";
import { State } from "vuex-class";
import _ from "lodash";

import Plot from "@/components/common/Plot.vue";
import { Repertoire } from "@/store/repertoire/Repertoire";
import { TagTree } from "@/store/repertoire/TagTree";
import { PlotData } from "plotly.js";
import { RepetitionTraining } from "@/store/repertoire/RepetitionTraining";
import { TrainingMode } from "@/store/trainingMode";
import { sideFromFen } from "@/store/repertoire/chessHelpers";
import { VariationMove } from "@/store/repertoire/PositionCollection";

@Component({ name: "LearnedReport", components: { Plot } })
export default class LearnedViewModel extends Vue {
  selectedTags: TagTree[] = [];

  @State
  whiteRepertoire!: Repertoire;

  @State
  blackRepertoire!: Repertoire;

  get combinedTags(): TagTree[] {
    return [this.whiteRepertoire.tags, this.blackRepertoire.tags];
  }

  get showNoPositions(): boolean {
    return (
      _.isEmpty(this.whiteRepertoire.training.getMoves()) &&
      _.isEmpty(this.blackRepertoire.training.getMoves())
    );
  }

  get plotData(): Partial<PlotData>[] {
    let learnedTrainingCount = 0;
    let newTrainingCount = 0;

    const repertoires = [this.whiteRepertoire, this.blackRepertoire];

    _.forEach(repertoires, repertoire => {
      const filteredTraining = this.getFilteredTraining(repertoire);

      _.forEach(filteredTraining, training => {
        if (training.includeForTrainingMode(TrainingMode.New)) {
          ++newTrainingCount;
        } else {
          ++learnedTrainingCount;
        }
      });
    });

    return [
      {
        type: "pie",
        hole: 0.7,
        labels: ["Learned", "New"],
        values: [learnedTrainingCount, newTrainingCount]
      }
    ];
  }

  private getFilteredTraining(repertoire: Repertoire): RepetitionTraining[] {
    const filteredTraining: RepetitionTraining[] = [];

    const variations = repertoire.getTrainingVariations(this.selectedTags, [
      TrainingMode.Cram
    ]); // Get all descendant variations

    let filteredMoves: VariationMove[] = [];

    _.forEach(variations, variation => {
      _.forEach(variation, move => {
        filteredMoves.push(move);
      });
    });

    filteredMoves = _.uniqWith(filteredMoves, _.isEqual);

    _.forEach(filteredMoves, move => {
      if (repertoire.sideToTrain === sideFromFen(move.sourceFen)) {
        const moveTraining = repertoire.training.getTrainingForMove(
          move.sourceFen,
          move.san
        );

        if (moveTraining) {
          filteredTraining.push(moveTraining);
        }
      }
    });

    return filteredTraining;
  }

  // data: () => ({
  //   options: { displayModeBar: false },
  //   layout: {},
  //   selectedTags: [] as RepertoireTag[]
  // }),
  // computed: {
  //   ...mapState(["darkMode", "whiteRepertoire", "blackRepertoire"]),
  //   // TODO
  //   // combinedTags(): RepertoireTag[] {
  //   //   return _.concat(this.whiteRepertoire.tags, this.blackRepertoire.tags);
  //   // },
  //   showNoPositions(): boolean {
  //     return (
  //       this.whiteRepertoire.positions.length === 1 &&
  //       this.blackRepertoire.positions.length === 1
  //     );
  //   },
  //   selectedPositions(): RepertoirePosition[] {
  //     const positions: RepertoirePosition[] = [];
  //     _.forEach(this.selectedTags, tag =>
  //       tag.position.VisitChildren(position => {
  //         if (position.myTurn) {
  //           positions.push(position);
  //         }
  //       })
  //     );
  //     return _.uniq(positions);
  //   },
  //   plotData() {
  //     let trainedPositions = 0;
  //     let newPositions = 0;
  //     _.forEach(this.selectedPositions, position => {
  //       if (position.IncludeForTrainingMode(TrainingMode.New)) {
  //         ++newPositions;
  //       } else {
  //         ++trainedPositions;
  //       }
  //     });
  //     return [
  //       {
  //         type: "pie",
  //         hole: 0.7,
  //         labels: ["Trained", "New"],
  //         values: [trainedPositions, newPositions]
  //       }
  //     ];
  //   }
  // }
}
