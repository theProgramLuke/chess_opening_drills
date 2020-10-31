<template lang="pug">
  v-container.ma-0.pa-0.fill-height(fluid)
    v-row.ma-0.pa-0.fill-height(align="stretch")
      v-col.ma-0.pa-0(cols="4")
        v-tabs(show-arrows, grow)
          v-tab(key=0, href="#tab-0") Repertoire
          v-tab(key=1, href="#tab-1") Moves
          v-tab(key=2, href="#tab-2") Notes
          v-tab(key=3, href="#tab-3") Engine

          v-tab-item(key=0, value="tab-0")
            tag-list(
              :whiteRepertoire="whiteRepertoire",
              :blackRepertoire="blackRepertoire",
              :activePosition="activePosition",
              @onSelect="onTagSelect",
              @onDelete="onRemoveTag",
              @onCreate="onCreateTag")
          
          v-tab-item.pa-2(key=1, value="tab-1")
            move-list(:variations="sourceVariations", @onSelectMove="onSelectMove")

            variation-list(
              :variations="nextMoves",
              @onSelectMove="onSelectMove",
              @onDeleteMove="onDeleteMove")

          v-tab-item.pa-2(key=2, value="tab-2")
            v-textarea(v-model="activePositionComments", outlined, no-resize)

          v-tab-item.pa-2(key=3, value="tab-3")
            engine-recommendations(:activePosition="activePosition")

      v-col.ma-0(cols="8", @wheel="onScroll")
        chessboard(
          v-if="activePositionLegalFen",
          :fen="activePositionLegalFen",
          :orientation="boardOrientation",
          :drawShapes="activePositionDrawings"
          @onMove="onBoardMove",
          @onDrawingsChanged="onDrawingsChanged")
</template>

<script lang="ts" src="./EditViewModel.ts" />
