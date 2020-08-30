<template lang="pug">
  v-container.fill-height.ma-0(fluid)
    template(v-if="showNoPositions")
      v-alert(color="error") No positions have been entered

    plot(
      v-else,
      :data="data",
      :layout="layout",
      :options="options",
      :dark="darkMode")
</template>

<script lang="ts" src="./PositionsPerTagViewModel.ts" />
