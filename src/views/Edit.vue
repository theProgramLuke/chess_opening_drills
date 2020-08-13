<template lang="pug">
  v-container.fill-height
    v-row.fill-height
      v-col(cols=3, dense)
        v-treeview(
          :items="repertoireTags",
          @update:active="selectTag",
          activatable,
          dense,
          hoverable)
      v-col
        div {{position}}
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";
import { RepertoireTag } from "@/store/repertoireTag";

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
      const child = findTag(this.repertoireTags, activeIds[0]);

      if (child) {
        this.position = child.position;
      }
    }
  }
});
</script>
