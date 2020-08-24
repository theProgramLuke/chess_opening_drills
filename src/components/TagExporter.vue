<template lang="pug">
  v-dialog(v-model="showDialog" max-width="750px")
    template(v-slot:activator="{on: dialog, attrs}")
      v-tooltip(bottom)
        template(v-slot:activator="{on: tooltip }")
          v-btn(v-bind="attrs", v-on="{ ...tooltip, ...dialog }", icon, color="info",)
            v-icon mdi-download

        span Export PGN

    v-card.pa-4
      v-card-title PGN of "{{ tag.name }}"
      v-form(@submit.prevent="save")
        v-textarea(:value="pgnText", outlined, no-resize)
        v-card-actions
          v-btn.ma-2(type="submit", color="primary")
            | Save
          v-btn.ma-2(@click="copy", color="primary")
            | Copy
          v-btn.ma-2(@click="showDialog=false", color="secondary")
            | Done
</template>

<script lang="ts">
import Vue from "vue";
import { saveAs } from "file-saver";
import { mapState, mapMutations } from "vuex";

import { RepertoireTag } from "@/store/repertoireTag";

export default Vue.extend({
  data: () => ({
    showDialog: false
  }),

  props: {
    tag: {
      type: RepertoireTag,
      required: true
    }
  },

  computed: {
    pgnText() {
      return this.tag.position.AsPgn();
    }
  },

  methods: {
    copy() {
      navigator.clipboard.writeText(this.pgnText);
    },

    save(): void {
      const pgnText = this.pgnText;
      saveAs(
        new Blob([this.pgnText], { type: "text/plain;charset=utf-8" }),
        `Exported ${this.tag.name}.pgn`
      );
    }
  }
});
</script>
