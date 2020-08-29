import Vue from "vue";

import { Move } from "@/store/move";

export default Vue.extend({
  data: () => ({
    showDialog: false
  }),

  props: {
    move: {
      type: Move,
      required: true
    }
  },

  methods: {
    onDelete() {
      this.$emit("onDelete", this.move);
    }
  }
});
