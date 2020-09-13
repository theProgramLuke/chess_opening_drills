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
          v-expansion-panel-header Backups
          v-expansion-panel-content.pa-2
            v-switch(
              v-model="selectedEnableBackups",
              label="Enable Backups")
            template(v-if="selectedEnableBackups")
              v-text-field(
                v-model="selectedBackupDirectory",
                label="Backup Folder",
                webkitdirectory,
                clearable)
              v-slider(
                v-model="selectedDailyBackupLimit",
                label="Daily backup count",
                min=0,
                max=99,
                thumb-label=true)
              v-slider(
                v-model="selectedMonthlyBackupLimit",
                label="Monthly backup count",
                min=0,
                max=99,
                thumb-label=true)
              v-slider(
                v-model="selectedYearlyBackupLimit",
                label="Yearly backup count",
                min=0,
                max=99,
                thumb-label=true)

        v-expansion-panel
          v-expansion-panel-header Engine
          v-expansion-panel-content
            v-file-input(
              v-model="selectedEngine",
              label="Select an engine",
              prepend-icon="mdi-robot",
              clearable)

            template(v-if="selectedEngineMetadata")
              h2 {{ selectedEngineMetadata.name }}
              v-container
                v-row(dense)  
                  v-col(
                    cols=3,
                    align-self="center",
                    v-for="option in selectedEngineMetadata.options")
                    v-card
                      v-responsive(:aspect-ratio="5/1")
                        v-card-actions.pa-2
                          v-slider.mt-4(
                            v-if="option.type === 'spin'",
                            @change="updateEngineMetadata",
                            :label="option.name",
                            :min="option.min",
                            :max="option.max",
                            v-model="option.value",
                            thumb-label=false,
                            hide-details,
                            dense)
                            template(v-slot:append)
                              v-text-field.my-0.py-0(
                                v-model="option.value",
                                @change="updateEngineMetadata",
                                type="number",
                                hide-details,
                                single-line)
                          v-switch(
                            v-if="option.type === 'check'",
                            @change="updateEngineMetadata",
                            :label="option.name",
                            v-model="option.value"
                            dense)
                          v-select.mt-4(
                            v-if="option.type === 'combo'"
                            @change="updateEngineMetadata",
                            :label="option.name",
                            :items="option.options",
                            v-model="option.value",
                            disable-lookup,
                            dense)
                          v-text-field.mt-4(
                            v-if="option.type === 'string'"
                            @change="updateEngineMetadata",
                            :label="option.name",
                            v-model="option.value",
                            hide-details,
                            dense)

        v-expansion-panel
          v-expansion-panel-header Development
          v-expansion-panel-content.pa-2
            v-btn(@click="clearStorage", color="error")
             | Clear All Storage
</template>

<script lang="ts" src="./SettingsViewModel.ts" />
