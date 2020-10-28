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
        v-alert(v-if="showNoPositions", color="error") No moves have been selected or entered

        plot(
          v-else,
          :data="plotData",
          :options="options",
          :layout="layout",
          :dark="darkMode")
</template>

<script lang="ts" src="./LearnedViewModel.ts" />
