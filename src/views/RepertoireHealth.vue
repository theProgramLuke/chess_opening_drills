<template lang="pug">
  v-container.ma-0.pa-0.fill-height(v-if="activePosition !== undefined", fluid)
    v-row.ma-0.pa-0.fill-height(align="stretch")
      v-col(cols="8")
        chessboard(:fen="activePosition", :orientation="boardOrientation")

      v-col(cols="4")
        v-row
          template(v-for="move in activePositionMoves")
            v-dialog(v-model="showDialog[move.san]" max-width="500px")
              template(v-slot:activator="{on, attrs}")
                v-btn.ma-2.d-inline-block(v-bind="attrs", v-on="on", color="primary")
                  div.original-case {{ move.san }}
                  v-icon mdi-delete

              v-card.pa-4
                v-card-title Delete move?
                v-card-subtitle The move "{{ move.san }}", and all orphaned positions will be removed.
                v-btn.ma-2(@click="onDeleteMove(move); showDialog[move.san] = false", color="error") Delete
                v-btn.ma-2(@click="showDialog[move.san] = false", color="secondary", text, outlined) Cancel

        v-row
          v-btn.mt-10(@click="skipPosition") Skip

  v-overlay(v-else)
    v-card.pa-4(min-width="550px")
      v-card-title No positions to review.
</template>

<script lang="ts" src="./RepertoireHealthViewModel.ts" />

<style lang="scss" scoped>
.original-case {
  text-transform: none !important;
}
</style>
