<template lang="pug">
  v-container
    v-row(cols=6, justify="center")
      v-expansion-panels(hover)
        v-expansion-panel
          v-expansion-panel-header Appearance
          v-expansion-panel-content
            v-switch(@change="setDarkMode", v-model="darkMode" label="Dark Mode")
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapMutations } from "vuex";

export default Vue.extend({
  data: () => ({
    panel: []
  }),
  computed: mapState(["darkMode"]),
  methods: mapMutations(["setDarkMode"])
});
</script>
