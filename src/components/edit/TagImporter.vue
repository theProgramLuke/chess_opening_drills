<template lang="pug">
  v-dialog(v-model="showDialog" max-width="750px", :persistent="loading")
    template(v-slot:activator="{on: dialog, attrs}")
      v-tooltip(bottom)
        template(v-slot:activator="{on: tooltip }")
          v-btn(v-bind="attrs", v-on="{ ...tooltip, ...dialog }", icon, color="info")
            v-icon mdi-upload

        span Import PGN

    v-card.pa-4
      v-card-title Import PGN for {{ tag.name }}
      v-form(ref="form", v-model="valid", @submit.prevent="loading = true; onImport()")
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
            type="submit"
            :disabled="!valid",
            :loading="loading",
            color="primary")
            | Import

          v-btn.ma-2(
            @click="showDialog=false",
            color="secondary")
            | Cancel
</template>

<script lang="ts" src="./TagImporterViewModel.ts" />
