<template lang="pug">
  v-container.fill-height.ma-0.pa-0(fluid)
    training-mode-selector(
      v-if="isSelecting"
      :whiteRepertoire="whiteRepertoire", 
      :blackRepertoire="blackRepertoire",
      @onStartTraining="startTraining")
    
    trainer(
      v-if="isTraining",
      :options="trainingOptions",
      @onCompleted="onCompleted")

    v-overlay(v-model="isComplete", :darkMode="darkMode")
      v-card.pa-4(min-width="550px")
        v-card-title Training Complete!
        v-card-actions
          v-btn(@click="reset", color="success") Train different positions
</template>

<script lang="ts" src="./TrainViewModel.ts" />
