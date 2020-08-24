<template lang="pug">
  v-treeview(
    :items="combinedTags",
    dense,
    open-on-click)
    template(v-slot:label="item")
      v-btn.mr-12.original-case(@click="onSelect(item.item.position)", text) {{ item.item.name }}

    template(v-slot:append="item")
      tag-importer(
        v-if="(item.item.id === 'whiteStart'|| item.item.id === 'blackStart')",
        :tag="item.item")

      tag-creator(
        :parentTag="item.item",
        :activePosition="activePosition",
        @onCreate="onCreate")

      tag-deleter(
        :tag="item.item",
        :disabled="(item.item.id === 'whiteStart'|| item.item.id === 'blackStart')",
        @onDelete="onDelete")

      tag-exporter(
        :tag="item.item")
</template>

<script lang="ts">
import Vue from "vue";
import _ from "lodash";
import { mapState, mapMutations } from "vuex";
import { RepertoireTag } from "@/store/repertoireTag";
import TagDeleter from "@/components/TagDeleter.vue";
import TagCreator from "@/components/TagCreator.vue";
import TagExporter from "@/components/TagExporter.vue";
import TagImporter from "@/components/TagImporter.vue";
import { Repertoire } from "@/store/repertoire";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Side } from "@/store/side";

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
