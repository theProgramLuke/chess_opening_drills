<template lang="pug">
  v-container.ma-0.px-0
    v-row.ma-0.px-0(align="stretch")
      v-col.ma-0.px-0(cols=3, v-if="showTree")
        tag-tree(
          :whiteRepertoire="whiteRepertoire",
          :blackRepertoire="blackRepertoire",
          :activePosition="activePosition",
          :showTree="showTree",
          @onSelect="updateBoard",
          @onDelete="removeRepertoireTag",
          @onCreate="addNewRepertoireTag")

      v-col(cols=6)
        v-container
          v-row.d-flex.justify-center(@wheel="onScroll")
            chessboard(
              v-if="activePosition.fen",
              :fen="activePosition.fen",
              :orientation="boardOrientation",
              @onMove="onBoardMove")

          v-row.mt-10
            v-textarea(v-model="activePosition.comment", outlined, no-resize)
            
      v-col(v-if="showMoves", cols=3)
        move-list(:turnLists="turnLists", @onSelectMove="updateBoard")

        variation-list(
          :variations="nextMoves",
          @onSelectMove="updateBoard",
          @onDeleteMove="removeRepertoireMove")
</template>

<script lang="ts" src="./EditViewModel.ts" />

<style lang="scss" scoped>
.v-btn.original-case {
  text-transform: none;
}
</style>
