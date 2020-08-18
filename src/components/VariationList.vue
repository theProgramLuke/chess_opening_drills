<template lang="pug">
  v-container(v-if="variations.length > 0")
    h2 Saved moves
    v-card.d-inline-block.pa-1(v-for="move in variations", outlined, tile)
      v-card-actions
        v-btn.original-case(
          @click="onSelectMove(move.position)",
          color="primary") {{ move.san }}
        v-btn(icon, color="error", @onDeleteMove="onDeleteMove(move.position)")
          v-icon mdi-delete
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapMutations } from "vuex";
import { RepertoireTag } from "@/store/repertoireTag";
import { Turn } from "@/store/turn";
import { RepertoirePosition } from "@/store/repertoirePosition";

export default Vue.extend({
  props: {
    variations: {
      type: Array,
      required: true
    }
  },

  methods: {
    onSelectMove(position: RepertoirePosition) {
      this.$emit("onSelectMove", position);
    },

    onDeleteMove(position: RepertoirePosition) {
      this.$emit("onDeleteMove", position);
    }
  }
});
</script>

<style lang="scss" scoped>
.v-btn.original-case {
  text-transform: none;
}
</style>
