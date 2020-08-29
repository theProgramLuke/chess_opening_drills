import Vue from "vue";

import { RepertoirePosition } from "@/store/repertoirePosition";

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
    onSelectMove(position: RepertoirePosition) {
      this.$emit("onSelectMove", position);
    }
  }
});
