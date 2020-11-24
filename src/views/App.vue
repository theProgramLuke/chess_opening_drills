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
            v-list-item-subtitle(v-if="item.subtitle") {{ item.subtitle }}

    v-app-bar(app, color="primary")
      v-app-bar-nav-icon(@click.stop="drawer = !drawer")
      v-toolbar-title Chess Opening Drills

    v-main
      v-container.fill-height.ma-0.pa-0(fluid)
        router-view
</template>

<script lang="ts" src="./AppViewModel.ts" />

<style lang="scss">
html {
  overflow-y: hidden !important;
}

.scrollable {
  overflow-y: auto !important;
}
</style>
