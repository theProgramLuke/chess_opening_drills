import Vue from "vue";
import _ from "lodash";
import { mapState } from "vuex";

import Plot from "@/components/common/Plot.vue";
import { Repertoire } from "@/store/repertoire";
import { RepertoireTag } from "@/store/repertoireTag";

interface TagCounts {
  labels: string[];
  counts: number[];
  parents: string[];
}

function tagCountsRecursive(
  tag: RepertoireTag,
  labels: string[],
  counts: number[],
  parents: string[],
  parentLabel = ""
): void {
  labels.push(tag.name);
  parents.push(parentLabel);

  let childCount = 0;
  tag.position.VisitChildren(() => childCount++);
  counts.push(childCount);

  _.forEach(tag.children, child =>
    tagCountsRecursive(child, labels, counts, parents, tag.name)
  );
}

function tagCounts(repertoire: Repertoire): TagCounts {
  const labels: string[] = [];
  const counts: number[] = [];
  const parents: string[] = [];

  tagCountsRecursive(repertoire.tags[0], labels, counts, parents);

  return { labels, counts, parents };
}

function disambiguateCounts(
  whiteTagCounts: TagCounts,
  blackTagCounts: TagCounts
): { whiteTagCounts: TagCounts; blackTagCounts: TagCounts } {
  const needsDisambiguation = _.intersection(
    whiteTagCounts.labels,
    blackTagCounts.labels
  );

  _.forEach(needsDisambiguation, name => {
    whiteTagCounts.labels = _.map(
      whiteTagCounts.labels,
      _.partial(_.replace, _, name, `White / ${name}`)
    );
    whiteTagCounts.parents = _.map(
      whiteTagCounts.parents,
      _.partial(_.replace, _, name, `White / ${name}`)
    );
    blackTagCounts.parents = _.map(
      blackTagCounts.parents,
      _.partial(_.replace, _, name, `Black / ${name}`)
    );
    blackTagCounts.labels = _.map(
      blackTagCounts.labels,
      _.partial(_.replace, _, name, `Black / ${name}`)
    );
  });

  return { whiteTagCounts, blackTagCounts };
}

export default Vue.extend({
  name: "PositionsPerTagReport",

  data: () => ({
    options: { displayModeBar: false },
    layout: {}
  }),

  components: {
    Plot
  },

  computed: {
    ...mapState(["darkMode", "whiteRepertoire", "blackRepertoire"]),

    showNoPositions(): boolean {
      return (
        this.whiteRepertoire.positions.length === 1 &&
        this.blackRepertoire.positions.length === 1
      );
    },

    data() {
      const whiteTagCounts = tagCounts(this.whiteRepertoire);
      const blackTagCounts = tagCounts(this.blackRepertoire);
      const disambiguated = disambiguateCounts(whiteTagCounts, blackTagCounts);

      return [
        {
          type: "sunburst",
          labels: _.concat(
            disambiguated.whiteTagCounts.labels,
            disambiguated.blackTagCounts.labels
          ),
          parents: _.concat(
            disambiguated.whiteTagCounts.parents,
            disambiguated.blackTagCounts.parents
          ),
          values: _.concat(whiteTagCounts.counts, blackTagCounts.counts),
          maxdepth: 3
        }
      ];
    }
  }
});
