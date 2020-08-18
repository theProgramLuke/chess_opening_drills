<template lang="pug">
  v-container.fill-height
    v-row.fill-height
      v-col(cols=3, dense)
        tag-tree(
          :whiteRepertoire="whiteRepertoire",
          :blackRepertoire="blackRepertoire",
          @onSelect="updateBoard"
          @onDelete="removeRepertoireTag",
          @onCreate="addNewRepertoireTag")

      v-divider(vertical)
      v-col
        div(v-if="activePosition.fen")
          chessboard(:fen="activePosition.fen" :orientation="boardOrientation" @onMove="onBoardMove")

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
                    v-btn.original-case(@click="updateBoard(turn.whiteMove.position)" text) {{ turn.whiteMove.san }}
                  td(v-if="turn.blackMove !== undefined")
                    v-btn.original-case(@click="updateBoard(turn.blackMove.position)" text) {{ turn.blackMove.san }}

        v-btn.ma-2.original-case(v-for="move in nextMoves", @click="updateBoard(move.position)", color="primary") {{ move.san }}
</template>

<script lang="ts">
import Vue from "vue";
import _ from "lodash";
import { mapState, mapMutations } from "vuex";

import chessboard from "@/components/chessboard.vue";
import { Threats } from "@/components/chessboard.vue";
import TagTree from "@/components/TagTree.vue";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Turn } from "@/store/turn";
import { Move } from "@/store/move";
import { Side } from "@/store/side";
import { RepertoireTag } from "@/store/repertoireTag";

export default Vue.extend({
  data: () => ({
    activePosition: new RepertoirePosition(
      "8/8/8/8/8/8/8/8 w KQkq - 0 1",
      true,
      "",
      Side.White
    ),
    boardOrientation: Side.White
  }),

  components: {
    chessboard,
    TagTree
  },

  computed: {
    ...mapState(["whiteRepertoire", "blackRepertoire"]),

    turnLists(): Turn[][] {
      return this.activePosition.GetTurnLists() || [[]];
    },

    nextMoves(): Array<Move> {
      return this.activePosition.children;
    }
  },

  methods: {
    ...mapMutations([
      "addRepertoirePosition",
      "addRepertoireTag",
      "removeRepertoireTag"
    ]),

    updateBoard(position: RepertoirePosition): void {
      this.activePosition = position;
      this.boardOrientation = position.forSide;
    },

    onBoardMove(threats: Threats) {
      const lastMoveSan = _.last(threats.history) || "SAN";

      if (threats.fen && threats.fen !== this.activePosition.fen) {
        const position = new RepertoirePosition(
          threats.fen,
          true,
          "",
          this.activePosition.forSide
        );

        const move = new Move(lastMoveSan, position);

        this.addRepertoirePosition({
          parent: this.activePosition,
          newMove: move
        });

        this.updateBoard(move.position);
      }
    },

    addNewRepertoireTag(parent: RepertoireTag, name: string): void {
      this.addRepertoireTag({
        parent: parent,
        tag: new RepertoireTag(
          parent.forSide,
          name,
          this.activePosition,
          this.activePosition.fen,
          []
        )
      });
    }
  },
  created() {
    this.updateBoard(this.whiteRepertoire.tags[0].position);
  }
});
</script>

<style lang="scss" scoped>
.v-btn.original-case {
  text-transform: none;
}
</style>
