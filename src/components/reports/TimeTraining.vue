<template lang="pug">
  v-container.fill-height.ma-0(fluid)
    v-row.fill-height
      v-col(cols=3)
        v-treeview(
          :items="combinedTags",
          v-model="selectedTags",
          selection-type="independent",
          return-object,
          dense,
          hoverable,
          selectable,
          open-on-click)
      
      v-col(cols=9)
        v-alert(v-if="showNoMoves", color="error") No trained moves are selected

        h1(v-else) {{ totalTrainingDuration }}
</template>

<script lang="ts" src="./TimeTrainingViewModel.ts" />
