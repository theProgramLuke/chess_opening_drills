<template lang="pug">
  v-dialog(v-model="showDialog" max-width="750px")
    template(v-slot:activator="{on: dialog, attrs}")
      v-tooltip(bottom)
        template(v-slot:activator="{on: tooltip }")
          v-btn(
            :disabled="disabled",
            v-bind="attrs",
            v-on="{ ...tooltip, ...dialog }",
            icon,
            color="info")
            v-icon mdi-source-merge
        
        span Tag position

    v-card.pa-4
      v-card-title Adding tag at current position as variation of "{{ parentTag.name }}".
      v-form(ref="form", v-model="valid", @submit.prevent="onCreate")
        v-text-field(
          label="Name",
          autofocus,
          v-model="name",
          :rules="nameRules",
          required)
        v-btn.ma-2(
          type="submit"
          color="primary",
          :disabled="!valid")
          | Add
        v-btn.ma-2(
          @click="showDialog=false; name=''",
          color="secondary")
          | Cancel
</template>

<script lang="ts">
import Vue from "vue";

import { RepertoireTag } from "@/store/repertoireTag";
import { RepertoirePosition } from "@/store/repertoirePosition";

export default Vue.extend({
  data: () => ({
    showDialog: false,
    valid: false,
    name: "",
    nameRules: [(value: string) => !!value || "Name is required"]
  }),

  props: {
    parentTag: {
      type: RepertoireTag,
      required: true
    },

    activePosition: {
      type: RepertoirePosition,
      required: true
    }
  },

  computed: {
    disabled(): boolean {
      let isChildPosition = false;

      this.parentTag.position.VisitChildren(child => {
        isChildPosition = isChildPosition || child === this.activePosition;
      });

      return !isChildPosition;
    }
  },

  methods: {
    onCreate(): void {
      if ((this.$refs.form as Vue & { validate: () => boolean }).validate()) {
        this.$emit("onCreate", this.parentTag, this.name);
        this.showDialog = false;
        this.name = "";
      }
    }
  }
});
</script>
