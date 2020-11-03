import "reflect-metadata";
import { Vue, Component } from "vue-property-decorator";
import { State } from "vuex-class";
import _ from "lodash";

import Plot from "@/components/common/Plot.vue";
import { Config, Layout } from "plotly.js";
import { Repertoire } from "@/store/repertoire/Repertoire";
import { TagTree } from "@/store/repertoire/TagTree";

@Component({ name: "MovesPerTagReport", components: { Plot } })
export default class MovesPerTagViewModel extends Vue {
  options: Partial<Config> = { displayModeBar: false };
  layout: Partial<Layout> = { margin: { b: 125 } };

  @State
  whiteRepertoire!: Repertoire;

  @State
  blackRepertoire!: Repertoire;

  @State
  darkMode!: boolean;

  get showNoPositions(): boolean {
    return (
      _.isEmpty(this.whiteRepertoire.training.getMoves()) &&
      _.isEmpty(this.blackRepertoire.training.getMoves())
    );
  }

  get plotData() {
    const whiteTagCounts = this.getTagCounts(this.whiteRepertoire);
    const blackTagCounts = this.getTagCounts(this.blackRepertoire);

    return [
      {
        type: "sunburst",
        labels: _.concat(whiteTagCounts.labels, blackTagCounts.labels),
        parents: _.concat(whiteTagCounts.parents, blackTagCounts.parents),
        values: _.concat(whiteTagCounts.counts, blackTagCounts.counts),
        maxdepth: 3,
        // hoverinfo: "label+"
      },
    ];
  }

  private getTagCounts(
    repertoire: Repertoire
  ): { labels: string[]; parents: string[]; counts: number[] } {
    const labels: string[] = [];
    const parents: string[] = [];
    const counts: number[] = [];

    this.getTagCountsRecursive(
      repertoire,
      repertoire.tags,
      [],
      labels,
      parents,
      counts
    );

    return { labels, parents, counts };
  }

  private labelFromTagPath(path: string[]): string {
    return path.join(" / ");
  }

  private getTagCountsRecursive(
    repertoire: Repertoire,
    tag: TagTree,
    path: string[],
    labels: string[],
    parents: string[],
    counts: number[]
  ): void {
    path.push(tag.name);

    _.forEach(tag.children, childTag =>
      this.getTagCountsRecursive(
        repertoire,
        childTag,
        _.clone(path),
        labels,
        parents,
        counts
      )
    );

    const tagTrainings = repertoire.getTrainingForTags([tag]);

    labels.push(this.labelFromTagPath(path));
    parents.push(this.labelFromTagPath(_.initial(path)));
    counts.push(tagTrainings.length);
  }
}
