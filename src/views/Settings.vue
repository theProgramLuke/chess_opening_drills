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
          v-expansion-panel-header Engine
          v-expansion-panel-content
            v-file-input(
              v-model="engine",
              label="Select an engine",
              prepend-icon="mdi-robot")

            v-container
              v-row(dense)
                v-col(cols=3, v-for="option in engineOptions")
                  v-slider(
                    v-if="option.type === 'spin'",
                    :label="option.name",
                    :min="option.min",
                    :max="option.max",
                    v-model="option.default",
                    thumb-label=true,
                    dense)
                  v-switch(
                    v-if="option.type === 'check'",
                    :label="option.name",
                    v-model="option.default"
                    dense)
                  v-select(
                    v-if="option.type === 'combo'"
                    :label="option.name",
                    :items="option.options",
                    v-model="option.default",
                    disable-lookup,
                    dense)
                  v-text-field(
                    v-if="option.type === 'string'"
                    :label="option.name",
                    v-model="option.default",
                    dense)

        v-expansion-panel
          v-expansion-panel-header Development
          v-expansion-panel-content.pa-2
            v-btn(@click="clearStorage", color="error")
             | Clear All Storage
</template>

<script lang="ts" src="./SettingsViewModel.ts" />
