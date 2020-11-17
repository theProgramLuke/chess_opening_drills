<template lang="pug">
  div.ma-10
    h1 Welcome to Chess Opening Drills v{{ version }}
    p.mb-12 Chess Opening Drills is a modern, cross platform tool for practicing an opening repertoire.

    h2 #[a(href="/edit") Edit]
    p Enter or view your repertoire.

    h2 #[a(href="/train") Train]
    p Practice your repertoire.

    h2 #[a(href="/schedule") Schedule]
    p See your upcoming training calendar.

    h2 #[a(href="/reports") Reports]
    p Check your training results and analysis of your repertoire.

    h2 #[a(href="/health") Repertoire Health]
    p Maintain the quality of your repertoire. Notifies you about conditions such as multiple moves from the same position.
</template>

<script lang="ts" src="./WelcomeViewModel.ts" />
