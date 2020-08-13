<template lang="pug">
  v-container
    h1 Settings
    v-switch(@change="setDarkMode", v-model="darkMode")
      template(v-slot:label) Dark Mode
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapMutations } from "vuex";

export default Vue.extend({
  computed: mapState(["darkMode"]),
  methods: mapMutations(["setDarkMode"])
});
</script>
