<template lang="pug">
  v-dialog(v-model="showDialog" max-width="750px")
    template(v-slot:activator="{on, attrs}")
      v-btn(v-bind="attrs", v-on="on", icon, color="info",)
        v-icon mdi-upload

    v-card.pa-4
      v-card-title Import PGN for {{ tag.name }}
      v-form(ref="form", v-model="valid")
        v-file-input(
          label="PGN",
          placeholder="Select a PGN file"
          v-model="inputFile",
          :rules="inputFileRules",
          accept=".pgn,.txt")
          
        v-card-actions
          v-btn.ma-2(
            @click="onImport",
            :disabled="!valid",
            :loading="loading",
            color="primary")
            | Import

          v-btn.ma-2(
            @click="showDialog=false",
            color="secondary",
            text,
            outlined)
            | Cancel
</template>

<script lang="ts">
import Vue from "vue";
import { saveAs } from "file-saver";
import { mapState, mapMutations } from "vuex";

import { RepertoireTag } from "@/store/repertoireTag";

declare interface ImporterComponentData {
  showDialog: boolean;
  inputFile?: File;
  inputFileRules: ((value: File) => true | string)[];
  loading: boolean;
  valid: boolean;
}

export default Vue.extend({
  data(): ImporterComponentData {
    return {
      showDialog: false,
      inputFile: undefined,
      inputFileRules: [
        value => {
          return !!value || "Must specify a file to import.";
        }
      ],
      loading: false,
      valid: false
    };
  },

  props: {
    tag: {
      type: RepertoireTag,
      required: true
    }
  },

  methods: {
    onImport(): void {
      if (this.inputFile) {
        this.loading = true;
        this.inputFile.text().then(pgnText => {
          console.log(pgnText);
          this.loading = false;
        });
      }
    }
  }
});
</script>
