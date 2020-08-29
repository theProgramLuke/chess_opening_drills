<template lang="pug">
  v-dialog(v-model="showDialog" max-width="750px")
    template(v-slot:activator="{on: dialog, attrs}")
      v-tooltip(bottom)
        template(v-slot:activator="{on: tooltip }")
          v-btn(v-bind="attrs", v-on="{ ...tooltip, ...dialog }", icon, color="error", :disabled="disabled")
            v-icon mdi-delete

        span Delete tag

    v-card.pa-4
      v-card-title Delete tag?
      v-card-subtitle The tag "{{ tag.name }}" and all of its child tags will be permanently deleted.
      v-form(@submit.prevent="onDelete")
        v-card-actions
          v-btn.ma-2(type="submit", color="error")
            | Delete
          v-btn.ma-2(@click="showDialog=false", color="secondary")
            | Cancel
</template>

<script lang="ts" src="./TagDeleterViewModel.ts" />
