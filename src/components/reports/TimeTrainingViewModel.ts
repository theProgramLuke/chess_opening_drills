import { Component, Vue } from "vue-property-decorator";
import { State } from "vuex-class";
import _ from "lodash";
import humanizeDuration from "humanize-duration";

import { Repertoire } from "@/store/repertoire/Repertoire";
import { TagTree } from "@/store/repertoire/TagTree";
import { RepetitionTraining } from "@/store/repertoire/RepetitionTraining";

@Component({ name: "TimeTrainingReport" })
export default class TimeTrainingViewModel extends Vue {
  selectedTags: TagTree[] = [];

  @State
  whiteRepertoire!: Repertoire;

  @State
  blackRepertoire!: Repertoire;

  get combinedTags(): TagTree[] {
    return [this.whiteRepertoire.tags, this.blackRepertoire.tags];
  }

  get showNoMoves(): boolean {
    return _.isEmpty(this.trainingHistory);
  }

  get totalTrainingDuration(): string {
    return humanizeDuration(this.totalTrainingDurationMilliseconds, {
      round: true,
    });
  }

  private get totalTrainingDurationMilliseconds(): number {
    let total = 0;

    _.forEach(this.trainingHistory, training =>
      _.forEach(training.history, entry => (total += entry.elapsedMilliseconds))
    );

    return total;
  }

  private get trainingHistory(): RepetitionTraining[] {
    return _.concat(
      this.trainingHistoryFromRepertoire(this.whiteRepertoire),
      this.trainingHistoryFromRepertoire(this.blackRepertoire)
    );
  }

  private trainingHistoryFromRepertoire(
    repertoire: Repertoire
  ): RepetitionTraining[] {
    return _.filter(
      repertoire.getTrainingForTags(this.selectedTags),
      training => !_.isEmpty(training.history)
    );
  }
}
