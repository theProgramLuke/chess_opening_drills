<template lang="pug">
  div.ma-10
    h1 Welcome to Chess Opening Drills v{{ version }}
    p.mb-12 Chess Opening Drills is a modern, cross platform tool for practicing an opening repertoire.

    v-list(nav)
      v-list-item(to="/edit", two-line)
        v-list-item-content
          v-list-item-title Edit
          v-list-item-subtitle Enter or view your repertoire.

      v-list-item(to="/train", two-line)
        v-list-item-content
          v-list-item-title Train
          v-list-item-subtitle Practice your repertoire.

      v-list-item(to="/schedule", two-line)
        v-list-item-content
          v-list-item-title Schedule
          v-list-item-subtitle See your upcoming training calendar.

      v-list-item(to="/reports", two-line)
        v-list-item-content
          v-list-item-title Reports
          v-list-item-subtitle Check your training results and analysis of your repertoire.

      v-list-item(to="/health", three-line)
        v-list-item-content
          v-list-item-title Repertoire Health
          v-list-item-subtitle Maintain the quality of your repertoire.
          v-list-item-subtitle Notifies you about conditions such as multiple moves from the same position.
</template>

<script lang="ts" src="./WelcomeViewModel.ts" />
