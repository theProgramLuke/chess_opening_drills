<template lang="pug">
  v-container.ma-0.pa-0.fill-height
    v-row.ma-0.pa-0.fill-height(align="stretch")
      v-col.ma-0.pa-0(cols=4)
        v-tabs
          v-tab(key=0, href="#tab-0") Repertoire
          v-tab(key=1, href="#tab-1") Variations
          v-tab(key=2, href="#tab-2") Comment

          v-tab-item(key=0, value="tab-0")
            tag-tree(
              :whiteRepertoire="whiteRepertoire",
              :blackRepertoire="blackRepertoire",
              :activePosition="activePosition",
              @onSelect="updateBoard",
              @onDelete="removeRepertoireTag",
              @onCreate="addNewRepertoireTag")
          
          v-tab-item(key=1, value="tab-1")
            move-list(:turnLists="turnLists", @onSelectMove="updateBoard")

            variation-list(
              :variations="nextMoves",
              @onSelectMove="updateBoard",
              @onDeleteMove="removeRepertoireMove")

          
          v-tab-item(key=2, value="tab-2")
            v-textarea(v-model="activePosition.comment", outlined, no-resize)

      v-col.ma-0.py-0(cols=8, @wheel="onScroll")
        chessboard(
          v-if="activePosition.fen",
          :fen="activePosition.fen",
          :orientation="boardOrientation",
          @onMove="onBoardMove")
</template>

<script lang="ts" src="./EditViewModel.ts" />

<style lang="scss" scoped>
.v-btn.original-case {
  text-transform: none;
}
</style>
