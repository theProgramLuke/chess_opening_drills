<template lang="pug">
  div.chessboard(:class="boardTheme")
    div(:class="pieceTheme")
      div.cg-board.is2d(ref="board")
</template>

<script lang="ts" src="./chessboardViewModel.ts" />

<style lang="scss" src="@/assets/chessground/chessground.scss"></style>
