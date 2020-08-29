<template lang="pug">
  v-container
    v-row
      v-expansion-panels(v-model="panels", hover, popout)
        v-expansion-panel
          v-expansion-panel-header Application Appearance
          v-expansion-panel-content.pa-2
            v-switch(v-model="selectedDarkMode", label="Dark Mode")

            v-select(
              v-model="selectedColor",
              :items="colorOptions",
              label="Colors",
              solo)

            v-color-picker(
              v-if="selectedColor",
              v-model="selectedColorValue")

            v-btn(v-if="false", color="warning")
              | Reset Appearance

        v-expansion-panel
          v-expansion-panel-header Board Appearance
          v-expansion-panel-content.pa-2
            v-select(
              v-model="selectedBoardTheme",
              :items="boardThemes",
              label="Board",
              solo)
            v-select(
              v-model="selectedPieceTheme",
              :items="pieceThemes",
              label="Pieces",
              solo)

            v-col(cols=4)
              chessboard(fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")

        v-expansion-panel
          v-expansion-panel-header Development
          v-expansion-panel-content.pa-2
            v-btn(@click="clearStorage", color="error")
             | Clear All Storage
</template>

<script lang="ts" src="./SettingsViewModel.ts" />
