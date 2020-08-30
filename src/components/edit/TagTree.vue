<template lang="pug">
  v-treeview.float-left(:items="combinedTags", dense, open-on-click)
    template(v-slot:label="{ item }")
      div
        v-btn.original-case(@click="onSelect(item.position)", text, left) {{ item.name }}

        br.d-none.d-sm-flex.d-md-none

        div.float-right
          tag-importer(
            v-if="(item.id === 'whiteStart'|| item.id === 'blackStart')",
            :tag="item")

          tag-creator(
            :parentTag="item",
            :activePosition="activePosition",
            @onCreate="onCreate")

          tag-deleter(
            :tag="item",
            :disabled="(item.id === 'whiteStart'|| item.id === 'blackStart')",
            @onDelete="onDelete")

          tag-exporter(:tag="item")
</template>

<script lang="ts" src="./TagTreeViewModel.ts" />

<style lang="scss" scoped>
.v-btn.original-case {
  text-transform: none;
}
