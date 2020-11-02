<template lang="pug">
  div
    div(v-if="activePosition !== undefined")
      div
        chessboard(:fen="activePosition")

      div(v-for="move in activePositionMoves")
        v-dialog(v-model="showDialog[move.san]" max-width="500px")
          template(v-slot:activator="{on, attrs}")
            v-btn(v-bind="attrs", v-on="on", color="primary")
              div {{ move.san }}
              v-icon mdi-delete

          v-card.pa-4
            v-card-title Delete move?
            v-card-subtitle The move "{{ move.san }}", and all orphaned positions will be removed.
            v-btn.ma-2(@click="onDeleteMove(); showDialog[move.san] = false", color="error") Delete
            v-btn.ma-2(@click="showDialog[move.san] = false", color="secondary", text, outlined) Cancel
          

      v-btn(@click="skipPosition") Skip

    div(v-else)
      | No positions to review.
</template>

<script lang="ts" src="./RepertoireHealthViewModel.ts" />

<style lang="scss" scoped>
.original-case {
  text-transform: none !important;
}
</style>
