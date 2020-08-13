<template lang="pug">
  v-container class="fill-height"
    v-row class="fill-height"
      v-col dense xs="3" sm="3" md="3" lg="3" xl="3"
        v-treeview
          :items="repertoireTags"
          @update:active="selectTag"
          activatable
          dense
          hoverable
      v-col>{{ position }}
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";
import { RepertoireTag } from "@/store/repertoireTag";
import { assert } from "console";

function _findTag(tag: RepertoireTag, id: number): RepertoireTag | null {
  if (tag["id"] === id) {
    return tag;
  }

  if (tag["children"].length === 0) {
    return null;
  }

  const mapped = tag["children"].map((child: RepertoireTag) =>
    _findTag(child, id)
  );
  const filtered = mapped.filter((child: RepertoireTag | null) => {
    return child != null;
  });

  return filtered[0];
}

function findTag(tags: Array<RepertoireTag>, id: number): RepertoireTag | null {
  const mapped = tags.map((child: RepertoireTag) => _findTag(child, id));
  const filtered = mapped.filter((child: RepertoireTag | null) => {
    return child != null;
  });

  // assert(filtered.length === 1, "Should only find one matching tag...");

  return filtered[0];
}

export default Vue.extend({
  data: () => ({
    position: ""
  }),
  computed: mapState(["repertoireTags"]),
  methods: {
    selectTag(activeIds: Array<number>) {
      const child =
        findTag(this.repertoireTags[0], activeIds[0]) ||
        findTag(this.repertoireTags[1], activeIds[0]);

      if (child) {
        this.position = child.position;
      }
    }
  }
});
</script>
