<template lang="pug">
  v-container.ma-0.px-0
    v-row.ma-0.px-0(align="stretch")
      v-col.ma-0.px-0(cols=3, v-if="showTree")
        tag-tree(
          :whiteRepertoire="whiteRepertoire",
          :blackRepertoire="blackRepertoire",
          :activePosition="activePosition",
          :showTree="showTree",
          @onSelect="updateBoard",
          @onDelete="removeRepertoireTag",
          @onCreate="addNewRepertoireTag")

      v-col(cols=6)
        v-container
          v-row.d-flex.justify-center(@wheel="onScroll")
            chessboard(
              v-if="activePosition.fen",
              :fen="activePosition.fen",
              :orientation="boardOrientation",
              @onMove="onBoardMove")

          v-row.mt-10
            v-textarea(v-model="activePosition.comment", outlined, no-resize)
            
      v-col(v-if="showMoves", cols=3)
        move-list(:turnLists="turnLists", @onSelectMove="updateBoard")

        variation-list(
          :variations="nextMoves",
          @onSelectMove="updateBoard",
          @onDeleteMove="removeRepertoireMove")
</template>

<script lang="ts">
import Vue from "vue";
import _ from "lodash";
import { mapState, mapMutations } from "vuex";

import chessboard from "@/components/common/chessboard.vue";
import { Threats } from "@/components/common/chessboard.vue";
import TagTree from "@/components/edit/TagTree.vue";
import MoveList from "@/components/edit/MoveList.vue";
import VariationList from "@/components/edit/VariationList.vue";
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
    },

    goToNextPosition() {
      if (!_.isEmpty(this.activePosition.children)) {
        this.updateBoard(this.activePosition.children[0].position);
      }
    },

    goToPreviousPosition() {
      if (!_.isEmpty(this.activePosition.parents)) {
        this.updateBoard(this.activePosition.parents[0]);
      }
    },

    onScroll(event: WheelEvent) {
      if (event.deltaY > 0) {
        this.goToNextPosition();
      } else {
        this.goToPreviousPosition();
      }
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
