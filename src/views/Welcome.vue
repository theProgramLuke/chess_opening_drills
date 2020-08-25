<template lang="pug">
  v-container
    h1.mb-5 Welcome to Chess Opening Drills!

    div This is a chess training tool for learning openings.
    div 
      span To get started, enter your repertoire in 
      a(href="/edit") Edit
      span , then start using the 
      a(href="/train") Train
      span  tool.
    div 
      span Once you have started training, see your study plan at 
      a(href="/schedule") Schedule
      span , and see your past results at 
      a(href="/reports") Reports
      span .
  
    div.mt-5
      div This is an early development version.
      div I recommend that you keep PGN backups of your repertoire until automatic backups are included.
      div
        span Please report problems or make suggestions at 
        a(href="https://github.com/theProgramLuke/chess_opening_drills/issues") https://github.com/theProgramLuke/chess_opening_drills/issues
        span .
</template>
