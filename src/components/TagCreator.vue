<template lang="pug">
  v-dialog(v-model="showDialog" max-width="750px")
    template(v-slot:activator="{on, attrs}")
      v-btn(v-bind="attrs", v-on="on", icon, color="info",)
        v-icon mdi-source-merge

    v-card.pa-4
      v-card-title Adding tag at current position as variation of "{{ parentTag.name }}".
      v-form(ref="form", v-model="valid")
        v-text-field(label="Name", autofocus, v-model="name", :rules="nameRules", required)
        v-btn.ma-2(@click="onCreate", color="primary") Add
        v-btn.ma-2(@click="showDialog=false", color="secondary", text, outlined) Cancel
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapMutations } from "vuex";
import { RepertoireTag } from "@/store/repertoireTag";

export default Vue.extend({
  data: () => ({
    showDialog: false,
    valid: false,
    name: "",
    nameRules: [(v: string) => !!v || "Name is required"]
  }),
  props: {
    parentTag: {
      type: RepertoireTag,
      required: true
    }
  },
  methods: {
    onCreate() {
      if (this.$refs.form.validate()) {
        this.$emit("onCreate", this.parentTag);
        this.showDialog = false;
      }
    }
  }
});
</script>
