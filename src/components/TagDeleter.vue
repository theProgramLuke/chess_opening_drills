<template lang="pug">
  v-dialog(v-model="showDialog" max-width="500px")
    template(v-slot:activator="{on, attrs}")
      v-btn(v-bind="attrs" v-on="on" icon, color="error", :disabled="disabled")
        v-icon mdi-delete

    v-card.pa-4
      v-card-title Delete?
      v-card-subtitle The tag "{{ tag.name }}" and all of its child tags will be permanently deleted.
      v-btn.ma-2(@click="onDelete(), showDialog=false", color="error") Delete
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
    tag: {
      type: RepertoireTag,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onDelete() {
      this.$emit("onDelete", this.tag);
    }
  }
});
</script>
