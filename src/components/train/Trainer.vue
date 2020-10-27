<template lang="pug">
  v-container.fill-height.py-0.my-0(v-if="!complete")
    v-row.fill-height.py-0.my-0.align-center
      div.almost-fill-height
        chessboard(
          v-if="!previewing"
          ref="board",
          :fen="activePositionLegalFen",
          :orientation="boardOrientation",
          :drawShapes="mistakeArrow",
          @onMove="onBoardMove")

        chessboard.grayscale(
          v-else,
          :fen="previewPositionLegalFen",
          :orientation="boardOrientation")

      v-progress-linear(
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

.almost-fill-height {
  height: calc(100% - 50px);
  width: 100%;
}
</style>
