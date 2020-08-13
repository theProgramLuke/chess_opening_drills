<template lang="pug">
  v-container.fill-height
    v-row.fill-height
      v-col(cols=3, dense)
        v-treeview(
          :items="repertoireTags",
          @update:active="selectTag",
          activatable,
          dense,
          hoverable)

      v-divider(vertical)
      v-col
        v-chip {{position}}

      v-divider(vertical)
      v-col(cols=3)
        v-window(v-model="moveListIndex")
          v-window-item(v-for="(moveList, index) in moveLists", :key="index")
            v-simple-table
              tbody
                tr(v-for="(moves, turnNumber) in moveList")
                  td {{ turnNumber + 1 }}
                  td {{ moves.whiteMove.san }}
                  td(v-if="moves.blackMove !== undefined") {{ moves.blackMove.san }}
        
        v-if(v-if="moveLists.length > 1")
          v-btn(large @click="moveListIndex--" :disabled="doNotAllowMoveListPrevious")
            v-icon mdi-chevron-left
            div Previous

          v-btn(large @click="moveListIndex++" :disabled="doNotAllowMoveListNext")
            div Next
            v-icon mdi-chevron-right
</template>

<script lang="ts">
import Vue from "vue";
import _ from "lodash";

import { mapState } from "vuex";

import { FindRepertoireTag } from "@/store/repertoireTag";
import { Position } from "@/store/position";
import { Turn } from "@/store/turn";
import { Move } from "@/store/move";

export default Vue.extend({
  data: () => ({
    position: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    moveListIndex: 0
  }),
  computed: {
    ...mapState(["repertoireTags", "repertoirePositions"]),
    moveLists(): Array<Array<Turn>> {
      const repertoirePosition = this.repertoirePositions.find(
        (repertoirePosition: Position) => {
          return this.position === repertoirePosition.fen;
        },
        this
      );

      const paths = repertoirePosition.rootPaths();

      const moveLists: Array<Array<Turn>> = [];

      _.forEach(paths, (path: Array<Move>) => {
        const turns: Array<Turn> = [];

        _.forEach(_.range(0, path.length, 2), (i: number) => {
          const whiteMove = path[i];

          if (path.length === i) {
            turns.push(new Turn(whiteMove));
          } else {
            const blackMove = path[i + 1];
            turns.push(new Turn(whiteMove, blackMove));
          }
        });

        moveLists.push(turns);
      });

      return moveLists;
    },
    doNotAllowMoveListPrevious(): boolean {
      return this.moveListIndex === 0;
    },
    doNotAllowMoveListNext(): boolean {
      return this.moveListIndex === this.moveLists.length - 1;
    }
  },
  methods: {
    selectTag(activeIds: Array<number>): void {
      const child = FindRepertoireTag(this.repertoireTags, activeIds[0]);

      if (child) {
        this.updatePosition(child.position);
      }
    },
    updatePosition(newPosition: string): void {
      this.moveListIndex = 0;
      this.position = newPosition;
    }
  }
});
</script>
