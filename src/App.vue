<template lang="pug">
  v-app
    v-navigation-drawer(app, v-model="drawer")
      v-list
        v-list-item(
          v-for="item in menuItems",
          :to="item.route",
          :key="item.route")
          v-list-item-action
            v-icon {{ item.icon }}
          v-list-item-content
            v-list-item-title {{ item.name }}

    v-app-bar(app, color="primary")
      v-app-bar-nav-icon(@click.stop="drawer = !drawer")
      v-toolbar-title Chess Opening Drills

    v-main
      v-container.fill-height.ma-0.pa-0(fluid)
        router-view
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";

export default Vue.extend({
  props: {
    source: String
  },

  data: () => ({
    drawer: null,
    menuItems: [
      {
        name: "Edit",
        route: "/edit",
        icon: "mdi-file-tree"
      },
      {
        name: "Train",
        route: "/train",
        icon: "mdi-play"
      },
      {
        name: "Schedule",
        route: "/schedule",
        icon: "mdi-calendar"
      },
      {
        name: "Reports",
        route: "/reports",
        icon: "mdi-chart-bar"
      },
      {
        name: "Settings",
        route: "/settings",
        icon: "mdi-wrench"
      }
    ]
  }),

  computed: mapState([
    "darkMode",
    "primary",
    "secondary",
    "accent",
    "error",
    "warning",
    "info",
    "success"
  ]),

  methods: {
    setThemeColors() {
      this.$vuetify.theme.currentTheme.primary = this.primary;
      this.$vuetify.theme.currentTheme.secondary = this.secondary;
      this.$vuetify.theme.currentTheme.accent = this.accent;
      this.$vuetify.theme.currentTheme.error = this.error;
      this.$vuetify.theme.currentTheme.warning = this.warning;
      this.$vuetify.theme.currentTheme.info = this.info;
      this.$vuetify.theme.currentTheme.success = this.success;
    }
  },

  created() {
    this.$vuetify.theme.dark = this.darkMode;
    this.setThemeColors();

    this.$store.subscribe((mutation, state) => {
      switch (mutation.type) {
        case "setDarkMode": {
          this.$vuetify.theme.dark = state.darkMode;
          break;
        }

        case "setColor": {
          this.setThemeColors();
          break;
        }
      }
    });
  }
});
</script>

<style lang="scss">
html {
  overflow-y: hidden !important;
}
</style>
