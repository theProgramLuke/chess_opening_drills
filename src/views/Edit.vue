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
        v-window(show-arrows)
          v-window-item(v-if="turnLists.length === 0")
            v-alert(type="info") Move list is empty
          v-window-item(v-for="(turnList, index) in turnLists", :key="index")
            v-simple-table
              tbody
                tr(v-for="(turn, turnNumber) in turnList")
                  td {{ turnNumber + 1 }}
                  td
                    v-btn.move(@click="updateBoard(turn.whiteMove.position)") {{ turn.whiteMove.san }}
                  td(v-if="turn.blackMove !== undefined")
                    v-btn.move(@click="updateBoard(turn.blackMove.position)") {{ turn.blackMove.san }}

        v-btn.ma-2.move(v-for="move in nextMoves", @click="updateBoard(move.position)", color="primary") {{ move.san }}
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
import { Side } from "@/store/side";

export default Vue.extend({
  data: () => ({
    activePosition: new RepertoirePosition(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      true,
      "",
      Side.White
    )
  }),

  components: {
    chessboard
  },

  computed: {
    ...mapState(["repertoire"]),

    turnLists(): Array<Array<Turn>> {
      return this.activePosition.GetTurnLists() || [[]];
    },

    nextMoves(): Array<Move> {
      return this.activePosition.children;
    }
  },

  methods: {
    ...mapMutations(["addRepertoirePosition"]),

    updateBoard(position: RepertoirePosition): void {
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

        const move = new Move(lastMoveSan, position);

        this.addRepertoirePosition({
          parent: this.activePosition,
          newMove: move
        });

        this.updateBoard(move.position);
      }
    }
  },
  created() {
    this.updateBoard(this.repertoire.tags[0].position);
  }
});
</script>

<style lang="scss" scoped>
.v-btn.move {
  text-transform: none;
}
</style>
