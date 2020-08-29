import Vue from "vue";

import { RepertoireTag } from "@/store/repertoireTag";

export default Vue.extend({
  data: () => ({
    showDialog: false
  }),

  props: {
    tag: {
      type: RepertoireTag,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    onDelete() {
      this.showDialog = false;
      this.$emit("onDelete", this.tag);
    }
  }
});
