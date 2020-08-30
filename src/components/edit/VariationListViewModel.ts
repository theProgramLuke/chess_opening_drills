import Vue from "vue";

import MoveDeleter from "@/components/edit/MoveDeleter.vue";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Move } from "@/store/move";

export default Vue.extend({
  props: {
    variations: {
      type: Array,
      required: true
    }
  },

  components: {
    MoveDeleter
  },

  methods: {
    onSelectMove(position: RepertoirePosition) {
      this.$emit("onSelectMove", position);
    },

    onDeleteMove(move: Move) {
      this.$emit("onDeleteMove", move);
      this.$forceUpdate();
    }
  }
});
