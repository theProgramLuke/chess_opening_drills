import Vue from "vue";

import { VariationMove } from "@/store/repertoire/PositionCollection";

export default Vue.extend({
  data: () => ({
    pageIndex: 1
  }),

  props: {
    turnLists: {
      type: Array,
      required: true
    }
  },

  watch: {
    turnLists() {
      this.pageIndex = 1;
    }
  },

  methods: {
    onSelectMove(move: VariationMove) {
      this.$emit("onSelectMove", move);
    }
  }
});
