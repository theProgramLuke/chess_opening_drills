<template lang="pug">
  v-window(show-arrows)
    v-window-item(v-if="turnLists.length === 0")
      v-alert(type="info") Move list is empty
    v-window-item(v-for="(turnList, index) in turnLists", :key="index")
      v-simple-table
        tbody
          tr(v-for="(turn, turnNumber) in turnList")
            td {{ turnNumber + 1 }}
            td
              v-btn.original-case(@click="onSelectMove(turn.whiteMove.position)" text) {{ turn.whiteMove.san }}
            td(v-if="turn.blackMove !== undefined")
              v-btn.original-case(@click="onSelectMove(turn.blackMove.position)" text) {{ turn.blackMove.san }}
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapMutations } from "vuex";
import { RepertoireTag } from "@/store/repertoireTag";
import { Turn } from "@/store/turn";
import { RepertoirePosition } from "@/store/repertoirePosition";

export default Vue.extend({
  props: {
    turnLists: {
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
