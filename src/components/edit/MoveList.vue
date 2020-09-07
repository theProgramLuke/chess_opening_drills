<template lang="pug">
  v-container
    v-window(:value="pageIndex-1")
      v-window-item(v-if="turnLists.length === 0")
        v-alert(type="info") Move list is empty

      v-window-item(v-for="(turnList, index) in turnLists", :key="index")
        v-simple-table
          tbody
            tr(v-for="(turn, turnNumber) in turnList")
              td {{ turnNumber + 1 }}
              td
                v-btn.original-case(@click="onSelectMove(turn.whiteMove.position)")
                  | {{ turn.whiteMove.san }}
              td(v-if="turn.blackMove !== undefined")
                v-btn.original-case(@click="onSelectMove(turn.blackMove.position)")
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
