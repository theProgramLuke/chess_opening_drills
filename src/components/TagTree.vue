<template lang="pug">
  v-treeview(:items="combinedTags", dense, open-on-click)
    template(v-slot:label="item")
      v-btn.original-case(@click="onSelect(item.item.position)", text) {{ item.item.name }}
    template(v-slot:append="item")
      tag-creator(
        :parentTag="item.item",
        @onCreate="onCreate")
      tag-deleter(
        :tag="item.item",
        @onDelete="onDelete",
        v-if="!(item.item.id === 'whiteStart'|| item.item.id === 'blackStart')")
</template>

<script lang="ts">
import Vue from "vue";
import _ from "lodash";
import { mapState, mapMutations } from "vuex";
import { RepertoireTag } from "@/store/repertoireTag";
import TagDeleter from "@/components/TagDeleter.vue";
import TagCreator from "@/components/TagCreator.vue";
import { Repertoire } from "@/store/repertoire";
import { RepertoirePosition } from "@/store/repertoirePosition";

export default Vue.extend({
  data: () => ({
    showDialog: false
  }),
  components: { TagDeleter, TagCreator },
  props: {
    whiteRepertoire: {
      type: Repertoire,
      required: true
    },
    blackRepertoire: {
      type: Repertoire,
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
