<template lang="pug">
  v-container.fill-height
    v-row.fill-height
      v-col(cols=3, dense)
        v-treeview(
          :items="repertoire.tags",
          @update:active="selectTag",
          activatable,
          dense,
          hoverable)

      v-divider(vertical)
      v-col
        chessboard(:fen="activePosition.fen" orientation="white" @onMove="onBoardMove")
        v-chip {{ activePosition.fen }}

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
        
        div(v-if="moveLists.length > 1")
          v-btn(large @click="moveListIndex--" :disabled="doNotAllowMoveListPrevious")
            v-icon mdi-chevron-left
            div Previous

          v-btn(large @click="moveListIndex++" :disabled="doNotAllowMoveListNext")
            div Next
            v-icon mdi-chevron-right

        div(v-for="position in repertoire.positions") {{ position.fen }}
</template>

<script lang="ts">
import Vue from "vue";
import _ from "lodash";
import { mapState, mapMutations } from "vuex";

import { RepertoirePosition } from "@/store/repertoirePosition";
import { Turn } from "@/store/turn";
import { Move } from "@/store/move";

import chessboard from "@/components/chessboard.vue";
import { Threats } from "@/components/chessboard.vue";
import { FEN } from "chessground/types";
import { Side } from "@/store/side";

class EditData {
  moveListIndex: number;
  activePosition?: RepertoirePosition;

  constructor() {
    this.moveListIndex = 0;
  }
}

function getMoveLists(
  currentPosition: RepertoirePosition | undefined
): Array<Array<Turn>> {
  const moveLists: Array<Array<Turn>> = [];

  if (currentPosition) {
    const paths = currentPosition.rootPaths();

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
  }

  return moveLists;
}

export default Vue.extend({
  data: () => new EditData(),

  components: {
    chessboard
  },

  computed: {
    ...mapState(["repertoire"]),

    moveLists(): Array<Array<Turn>> {
      return getMoveLists(this.activePosition);
    },

    doNotAllowMoveListPrevious(): boolean {
      return this.moveListIndex === 0;
    },

    doNotAllowMoveListNext(): boolean {
      return this.moveListIndex === this.moveLists.length - 1;
    }
  },

  methods: {
    ...mapMutations(["addRepertoirePosition"]),

    selectTag(activeIds: Array<number>): void {
      const child = this.repertoire.LookupRepertoireTag(activeIds[0]);

      if (child) {
        this.updatePosition(child.position);
      }
    },

    updatePosition(position: RepertoirePosition): void {
      this.moveListIndex = 0;

      this.addRepertoirePosition({
        parent: this.activePosition,
        newMove: new Move("", position)
      });

      this.activePosition = position;
    },

    onBoardMove(threats: Threats) {
      if (threats.fen) {
        this.updatePosition(
          new RepertoirePosition(threats.fen, true, "", Side.White)
        );
      }
    }
  },
  created() {
    this.activePosition = this.repertoire.tags[0].position;
  }
});
</script>
