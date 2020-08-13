<template>
  <v-container>
    <h1>Settings</h1>
    <v-switch @change="setDarkMode" v-model="darkMode">
      <template v-slot:label>
        Dark Mode
      </template>
    </v-switch>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapMutations } from "vuex";

export default Vue.extend({
  computed: mapState(["darkMode"]),
  methods: mapMutations(["setDarkMode"])
});
</script>
