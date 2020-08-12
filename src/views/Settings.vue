<template>
  <v-container>
    <h1>Settings</h1>
    <v-switch @change="setDarkMode">
      <template v-slot:label>
        Dark Mode
      </template>
    </v-switch>
  </v-container>
</template>

<script lang="ts">
import { mapMutations } from "vuex";

export default {
  methods: mapMutations(["setDarkMode"])
};
</script>
