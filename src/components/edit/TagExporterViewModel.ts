import Vue from "vue";
import { saveAs } from "file-saver";

import { RepertoireTag } from "@/store/repertoireTag";

export default Vue.extend({
  data: () => ({
    showDialog: false
  }),

  props: {
    tag: {
      type: RepertoireTag,
      required: true
    }
  },

  computed: {
    pgnText(): string {
      return this.tag.position.AsPgn();
    }
  },

  methods: {
    copy(): void {
      navigator.clipboard.writeText(this.pgnText);
    },

    save(): void {
      saveAs(
        new Blob([this.pgnText], { type: "text/plain;charset=utf-8" }),
        `Exported ${this.tag.name}.pgn`
      );
    }
  }
});
