<template lang="pug">
  v-dialog(v-model="showDialog" max-width="750px")
    template(v-slot:activator="{on, attrs}")
      v-btn(v-bind="attrs", v-on="on", icon, color="info",)
        v-icon mdi-source-merge

    v-card.pa-4
      v-card-title Adding tag at current position as variation of "{{ parentTag.name }}".
      v-form
        v-text-field(label="Name" autofocus)
        v-btn.ma-2(@click="onCreate(); showDialog=false", color="primary") Add
        v-btn.ma-2(@click="showDialog=false", color="secondary", text, outlined) Cancel
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapMutations } from "vuex";
import { RepertoireTag } from "@/store/repertoireTag";

export default Vue.extend({
  data: () => ({
    showDialog: false
  }),
  props: {
    parentTag: {
      type: RepertoireTag,
      required: true
    }
  },
  methods: {
    onCreate() {
      this.$emit("onCreate", this.parentTag);
    }
  }
});
</script>
