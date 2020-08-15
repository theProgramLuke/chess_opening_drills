<template lang="pug">
  v-container.fill-height
    v-row.fill-height
      v-col(cols=3, dense)
        v-treeview(
          :items="repertoire.tags",
          dense,
          hoverable)
          template(v-slot:label="item")
            a(@click="updateBoard(item.item.position)") {{ item.item.name }}

      v-divider(vertical)
      v-col
        div(v-if="activePosition.fen")
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
import { RepertoireTag } from "@/store/repertoireTag";

class EditData {
  moveListIndex: number;
  activePosition: RepertoirePosition;

  constructor() {
    this.moveListIndex = 0;
    this.activePosition = new RepertoirePosition(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      true,
      "",
      Side.White
    );
  }
}

export default Vue.extend({
  data: () => new EditData(),

  components: {
    chessboard
  },

  computed: {
    ...mapState(["repertoire"]),

    moveLists(): Array<Array<Turn>> {
      return this.activePosition.GetTurnLists();
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

    updateBoard(position: RepertoirePosition): void {
      this.moveListIndex = 0;

      this.activePosition = position;
    },

    onBoardMove(threats: Threats) {
      const lastMoveSan = _.last(threats.history) || "SAN";

      if (threats.fen && threats.fen !== this.activePosition.fen) {
        const position = new RepertoirePosition(
          threats.fen,
          true,
          "",
          Side.White
        );

        this.addRepertoirePosition({
          parent: this.activePosition,
          newMove: new Move(lastMoveSan, position)
        });

        this.updateBoard(position);
      }
    }
  },
  created() {
    this.updateBoard(this.repertoire.tags[0].position);
  }
});
</script>
