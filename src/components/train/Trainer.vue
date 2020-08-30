<template lang="pug">
  v-container(v-if="!complete")
    v-row.d-flex.justify-center
      v-col(cols=6)
        chessboard(
          v-if="!previewing"
          ref="board",
          :fen="activePosition.fen",
          :orientation="boardOrientation",
          :drawShapes="mistakeArrow",
          @onMove="onBoardMove")
        chessboard.grayscale(
          v-else,
          :fen="previewPositionFen",
          :orientation="boardOrientation")

    v-progress-linear.mt-10(
      :value="completionPercent",
      height=25,
      color="primary")
        template(v-slot="value")
            strong {{ variationProgress }}
</template>

<script lang="ts" src="./TrainerViewModel.ts" />

<style lang="scss" scoped>
.grayscale {
  filter: grayscale(100%);
}
</style>
