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
