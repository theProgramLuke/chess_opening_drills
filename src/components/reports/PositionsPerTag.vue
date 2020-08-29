<template lang="pug">
  v-container.fill-height.ma-0(fluid)
    template(v-if="showNoPositions")
      v-alert(color="error") No positions have been entered

    plot(
      v-else,
      :data="data",
      :layout="layout",
      :options="options",
      :dark="darkMode")
</template>

<script lang="ts">
import Vue from "vue";
import _ from "lodash";
import { mapState } from "vuex";

import Plot from "@/components/common/Plot.vue";
import { Repertoire } from "@/store/repertoire";
import { RepertoireTag } from "@/store/repertoireTag";

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

function tagCounts(
  repertoire: Repertoire
): { labels: string[]; counts: number[]; parents: string[] } {
  const labels: string[] = [];
  const counts: number[] = [];
  const parents: string[] = [];

  tagCountsRecursive(repertoire.tags[0], labels, counts, parents);

  return { labels, counts, parents };
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

      return [
        {
          type: "sunburst",
          labels: _.concat(whiteTagCounts.labels, blackTagCounts.labels),
          parents: _.concat(whiteTagCounts.parents, blackTagCounts.parents),
          values: _.concat(whiteTagCounts.counts, blackTagCounts.counts)
        }
      ];
    }
  }
});
</script>
