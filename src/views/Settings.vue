<template lang="pug">
  v-container
    v-row
      v-expansion-panels(hover, popout, v-model="panels")
        v-expansion-panel
          v-expansion-panel-header Appearance
          v-expansion-panel-content.pa-2
            v-switch(@change="setDarkMode", label="Dark Mode", v-model="darkMode")

            br

            v-select(
              label="Colors",
              :items="colorOptions",
              v-model="selectedColor",
              solo)

            v-color-picker(
              v-if="selectedColor",
              v-model="selectedColorValue")

            v-btn(color="warning") Reset Appearance

        v-expansion-panel
          v-expansion-panel-header Development
          v-expansion-panel-content.pa-2
            v-btn(@click="clearStorage", color="error") Clear All Storage
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapMutations } from "vuex";

export default Vue.extend({
  data: () => ({
    panels: [],
    colorPanels: [],
    colorOptions: [
      "primary",
      "secondary",
      "accent",
      "error",
      "warning",
      "info",
      "success"
    ],
    selectedColor: "",
    darkModeInput: false
  }),

  computed: {
    ...mapState(["darkMode"]),

    selectedColorValue: {
      get() {
        return this.$vuetify.theme.currentTheme[this.selectedColor] as string;
      },
      set(color: string) {
        this.setColor({
          colorToSet: this.selectedColor,
          color: color
        });
      }
    }
  },

  methods: mapMutations(["setDarkMode", "clearStorage", "setColor"]),

  created() {
    this.darkModeInput = this.darkMode;
  }
});
</script>
