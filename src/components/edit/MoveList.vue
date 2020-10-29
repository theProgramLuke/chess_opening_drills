<template lang="pug">
  v-container
    v-window(:value="pageIndex-1")
      v-window-item(v-if="turnLists.length === 0")
        v-alert(type="info") Move list is empty

      v-window-item(v-for="(turnList, index) in turnLists", :key="index")
        v-simple-table
          tbody
            tr(v-for="(turn) in turnList")
              td {{ turn.turnNumber }}
              td
                v-btn.original-case(
                  v-if="turn.whiteMove !== undefined",
                  @click="onSelectMove(turn.whiteMove)")
                  | {{ turn.whiteMove.san }}
              td
                v-btn.original-case(
                  v-if="turn.blackMove !== undefined",
                  @click="onSelectMove(turn.blackMove)")
                  | {{ turn.blackMove.san }}
                  
    v-pagination(
      v-if="turnLists.length > 1",
      v-model="pageIndex",
      :length="turnLists.length")
</template>

<script lang="ts" src="./MoveListViewModel.ts" />

<style lang="scss" scoped>
.original-case {
  text-transform: none !important;
}
</style>
