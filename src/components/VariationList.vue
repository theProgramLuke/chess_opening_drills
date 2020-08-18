<template lang="pug">
  v-container(v-if="variations.length > 0")
    h2 Saved moves
    v-btn.ma-2.original-case(
      v-for="move in variations",
      @click="onSelectMove(move.position)",
      color="primary") {{ move.san }}
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
    }
  }
});
</script>

<style lang="scss" scoped>
.v-btn.original-case {
  text-transform: none;
}
</style>
