<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer" app>
      <v-list>
        <v-list-item
          v-for="item in menuItems"
          :to="item.route"
          :key="item.route"
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ item.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="blue">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Application</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container class="fill-height" fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { mapState } from "vuex";

export default {
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
        name: "Statistics",
        route: "/statistics",
        icon: "mdi-chart-bar"
      },
      {
        name: "Settings",
        route: "/settings",
        icon: "mdi-wrench"
      }
    ]
  }),
  computed: mapState(["darkMode"]),
  created() {
    this.$vuetify.theme.dark = this.darkMode;

    this.$store.subscribe((mutation, state) => {
      if (mutation.type === "setDarkMode") {
        this.$vuetify.theme.dark = state.darkMode;
      }
    });
  }
};
</script>

<style lang="scss">
html {
  overflow-y: hidden !important;
}
</style>
