<template lang="pug">
  v-container.fill-height
    v-row.fill-height
      v-col(cols=3, dense)
        v-treeview(
          :items="repertoire.tags",
          dense)
          template(v-slot:label="item")
            v-btn.original-case(@click="updateBoard(item.item.position)" text) {{ item.item.name }}
          template(v-slot:append="item")
            tag-creator(:parentTag="item.item" @onCreate="addRepertoireTag")
            tag-deleter(:tag="item.item" @onDelete="removeRepertoireTag", :disabled="item.item.id === 0 || item.item.id === 1")

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
import TagDeleter from "@/components/TagDeleter.vue";
import TagCreator from "@/components/TagCreator.vue";
import { Threats } from "@/components/chessboard.vue";
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
    showNewTagDialog: false,
    showDeleteTagDialog: false
  }),

  components: {
    chessboard,
    TagDeleter,
    TagCreator
  },

  computed: {
    ...mapState(["repertoire"]),

    turnLists(): Turn[][] {
      console.log(this.repertoire.positions);
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
    },

    addRepertoireTag(parentTag: RepertoireTag): void {
      alert(parentTag.name);
    },

    removeRepertoireTag(tag: RepertoireTag): void {
      alert(tag.name);
    }
  },
  created() {
    console.log("created", this.repertoire.positions[0].GetTurnLists);
    this.updateBoard(this.repertoire.tags[0].position);
  }
});
</script>

<style lang="scss" scoped>
.v-btn.original-case {
  text-transform: none;
}
</style>
