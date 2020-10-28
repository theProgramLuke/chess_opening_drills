<template lang="pug">
  div
    v-treeview.float-left(v-for="repertoire in repertoires", :items="[repertoire.tags]", dense, open-on-click)
      template(v-slot:label="{ item }")
        div
          v-btn.original-case(@click="onSelect(repertoire, item.fen)", text, left) {{ item.name }}

          br.d-none.d-sm-flex.d-md-none

          div.float-right
            tag-importer(
              v-if="item.isRootTag",
              :repertoire="repertoire",
              :tag="item")

            tag-creator(
              :repertoire="repertoire",
              :parentTag="item",
              :activePosition="activePosition",
              @onCreate="onCreate")

            tag-deleter(
              :repertoire="repertoire",
              :tag="item",
              :disabled="item.isRootTag",
              @onDelete="onDelete")

            tag-exporter(:repertoire="repertoire", :tag="item")
</template>

<script lang="ts" src="./TagListViewModel.ts" />

<style lang="scss" scoped>
.original-case {
  text-transform: none !important;
}
</style>
