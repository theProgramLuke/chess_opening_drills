<template lang="pug">
  v-dialog(v-model="showDialog" max-width="750px")
    template(v-slot:activator="{on, attrs}")
      v-btn(v-bind="attrs", v-on="on", icon, color="info",)
        v-icon mdi-upload

    v-card.pa-4
      v-card-title Import PGN for {{ tag.name }}
      v-form(ref="form", v-model="valid")
        v-file-input(
          v-model="inputFile",
          :rules="inputFileRules",
          :error-messages="inputFileErrors",
          accept=".pgn,.txt",
          @change="inputFileErrors=[]",
          label="PGN",
          placeholder="Select a PGN file",
          prepend-icon="mdi-file-document")

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
import _ from "lodash";
import { saveAs } from "file-saver";
import { mapMutations } from "vuex";

import { parsePgn, PgnGame } from "@/store/pgnParser";
import { RepertoireTag } from "@/store/repertoireTag";
import { RepertoirePosition } from "@/store/repertoirePosition";

declare interface ImporterComponentData {
  showDialog: boolean;
  inputFile?: File;
  inputFileRules: ((value: File) => true | string)[];
  inputFileErrors: string | string[];
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
      inputFileErrors: [],
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
    ...mapMutations(["addPositionsFromGame"]),

    async onImport() {
      if (this.inputFile) {
        this.loading = true;
        this.inputFile.text().then(pgnText => {
          try {
            const pgn = parsePgn(pgnText);
            _.forEach(pgn, game =>
              this.addPositionsFromGame({
                forSide: this.tag.forSide,
                game: game
              })
            );
            this.showDialog = false;
          } catch (error) {
            this.inputFileErrors = [`Invalid PGN: ${error.message}`];
          } finally {
            this.loading = false;
          }
        });
      }
    }
  }
});
</script>
