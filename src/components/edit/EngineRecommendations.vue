<template lang="pug">
    v-container
        v-switch(v-model="activeEngine", label="Enable engine", @change="activateEngine")
        v-progress-circular(
            v-if="activeEngine && sortedEngineRecommendations.length === 0",
            indeterminate)
        p(v-for="recommendation in sortedEngineRecommendations")
            | {{ recommendation.evaluation }}
            | {{ recommendation.variation[0] }}
            | Depth {{ recommendation.depth }}
</template>

<script lang="ts" src="./EngineRecommendationsViewModel.ts" />
