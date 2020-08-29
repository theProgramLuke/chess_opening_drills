<template lang="pug">
  v-treeview.float-left(:items="combinedTags", dense, open-on-click)
    template(v-slot:label="{ item }")
      div
        v-btn.original-case(@click="onSelect(item.position)", text, left) {{ item.name }}

        br.d-none.d-sm-flex.d-md-none

        tag-importer(
          v-if="(item.id === 'whiteStart'|| item.id === 'blackStart')",
          :tag="item")

        tag-creator(
          :parentTag="item",
          :activePosition="activePosition",
          @onCreate="onCreate")

        tag-deleter(
          :tag="item",
          :disabled="(item.id === 'whiteStart'|| item.id === 'blackStart')",
          @onDelete="onDelete")

        tag-exporter(:tag="item")
</template>

<script lang="ts">
import Vue from "vue";
import _ from "lodash";

import TagDeleter from "@/components/edit/TagDeleter.vue";
import TagCreator from "@/components/edit/TagCreator.vue";
import TagExporter from "@/components/edit/TagExporter.vue";
import TagImporter from "@/components/edit/TagImporter.vue";
import { RepertoireTag } from "@/store/repertoireTag";
import { Repertoire } from "@/store/repertoire";
import { RepertoirePosition } from "@/store/repertoirePosition";

export default Vue.extend({
  components: { TagDeleter, TagCreator, TagExporter, TagImporter },

  props: {
    whiteRepertoire: {
      type: Repertoire,
      required: true
    },

    blackRepertoire: {
      type: Repertoire,
      required: true
    },

    activePosition: {
      type: RepertoirePosition,
      required: true
    }
  },

  computed: {
    combinedTags() {
      return _.concat(this.whiteRepertoire.tags, this.blackRepertoire.tags);
    }
  },

  methods: {
    onCreate(parent: RepertoireTag, name: string): void {
      this.$emit("onCreate", parent, name);
    },

    onDelete(tag: RepertoireTag): void {
      this.$emit("onDelete", tag);
    },

    onSelect(position: RepertoirePosition) {
      this.$emit("onSelect", position);
    }
  }
});
</script>

<style lang="scss" scoped>
.v-btn.original-case {
  text-transform: none;
}
</style>
