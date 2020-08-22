<template lang="pug">
  v-dialog(v-model="showDialog" max-width="500px")
    template(v-slot:activator="{on, attrs}")
      v-btn(v-bind="attrs" v-on="on" icon, color="error")
        v-icon mdi-delete

    v-card.pa-4
      v-card-title Delete move?
      v-card-subtitle The move "{{ move.san }}", and all orphaned positions will be removed.
      v-btn.ma-2(@click="onDelete(); showDialog=false", color="error") Delete
      v-btn.ma-2(@click="showDialog=false", color="secondary", text, outlined) Cancel
</template>

<script lang="ts">
import Vue from "vue";

import { RepertoireTag } from "@/store/repertoireTag";
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
</script>
