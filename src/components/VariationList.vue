<template lang="pug">
  v-container(v-if="variations.length > 0")
    h2 Saved moves
    v-card.d-inline-block.pa-1(v-for="move in variations", outlined, tile)
      v-card-actions
        v-btn.original-case(
          @click="onSelectMove(move.position)",
          color="primary") {{ move.san }}
        move-deleter(:move="move", @onDelete="onDeleteMove")
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapMutations } from "vuex";

import MoveDeleter from "@/components/MoveDeleter.vue";
import { RepertoireTag } from "@/store/repertoireTag";
import { Turn } from "@/store/turn";
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
</script>

<style lang="scss" scoped>
.v-btn.original-case {
  text-transform: none;
}
</style>
