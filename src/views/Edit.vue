<template lang="pug">
  v-container.fill-height.ma-0(fluid)
    v-row.fill-height(no-gutters)
      v-col(cols="auto", v-if="showTree")
        tag-tree(
          :whiteRepertoire="whiteRepertoire",
          :blackRepertoire="blackRepertoire",
          :showTree="showTree",
          @onSelect="updateBoard"
          @onDelete="removeRepertoireTag",
          @onCreate="addNewRepertoireTag")

      v-col(cols="auto")
        v-btn(v-if="!showTree", @click="showTree = true", icon)
          v-icon mdi-chevron-double-right
        v-btn(v-if="showTree", @click="showTree = false", icon)
          v-icon mdi-chevron-double-left

      v-col
        div.d-flex.justify-center(v-if="activePosition.fen")
          chessboard(
            :fen="activePosition.fen",
            :orientation="boardOrientation",
            @onMove="onBoardMove")

      v-col(cols="auto")
        v-btn(v-if="!showMoves", @click="showMoves = true", icon)
          v-icon mdi-chevron-double-left
        v-btn(v-if="showMoves", @click="showMoves = false", icon)
          v-icon mdi-chevron-double-right

      v-col(v-if="showMoves", cols=3)
        move-list(:turnLists="turnLists", @onSelectMove="updateBoard")

        variation-list(
          :variations="nextMoves",
          @onSelectMove="updateBoard",
          @onDeleteMove="removeRepertoireMove")

        br
        div(v-if="activePosition.trainingHistory.length > 0")
            div Next repetition scheduled for {{ nextScheduled }}
            div Training difficulty: {{ easiness }}
</template>

<script lang="ts">
import Vue from "vue";
import _ from "lodash";
import { mapState, mapMutations } from "vuex";

import chessboard from "@/components/chessboard.vue";
import { Threats } from "@/components/chessboard.vue";
import TagTree from "@/components/TagTree.vue";
import MoveList from "@/components/MoveList.vue";
import VariationList from "@/components/VariationList.vue";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Turn } from "@/store/turn";
import { Move } from "@/store/move";
import { Side } from "@/store/side";
import { RepertoireTag } from "@/store/repertoireTag";

export default Vue.extend({
  data: () => ({
    activePosition: new RepertoirePosition(
      "8/8/8/8/8/8/8/8 w KQkq - 0 1",
      "",
      Side.White
    ),
    boardOrientation: Side.White,
    showTree: true,
    showMoves: true
  }),

  components: {
    chessboard,
    TagTree,
    MoveList,
    VariationList
  },

  computed: {
    ...mapState(["whiteRepertoire", "blackRepertoire"]),

    turnLists(): Turn[][] {
      return this.activePosition.GetTurnLists() || [[]];
    },

    nextScheduled(): string | undefined {
      if (this.activePosition.nextRepetitionTimestamp) {
        return new Date(
          this.activePosition.nextRepetitionTimestamp
        ).toLocaleDateString();
      }

      return undefined;
    },

    easiness(): number {
      return _.round(this.activePosition.easinessFactor, 3);
    },

    nextMoves(): Array<Move> {
      return this.activePosition.children;
    }
  },

  methods: {
    ...mapMutations([
      "addRepertoirePosition",
      "addRepertoireTag",
      "removeRepertoireTag",
      "removeRepertoireMove"
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
