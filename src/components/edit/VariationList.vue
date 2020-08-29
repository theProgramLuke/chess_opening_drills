<template lang="pug">
  v-container(v-if="variations.length > 0")
    h2 Saved moves
    v-card.d-inline-block.pa-1(v-for="move in variations", outlined, tile)
      v-card-actions
        v-btn.original-case(
          @click="onSelectMove(move.position)",
          color="primary") {{ move.san }}
        move-deleter(:move="move", @onDelete="onDeleteMove")
</template>

<script lang="ts" src="./VariationListViewModel.ts" />

<style lang="scss" scoped>
.v-btn.original-case {
  text-transform: none;
}
</style>
