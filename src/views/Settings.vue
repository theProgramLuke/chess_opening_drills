<template lang="pug">
  v-container
    v-row
      v-expansion-panels(hover, popout)
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
