<template lang="pug">
  div.blue-tile.merida
    div.cg-board-wrap(ref="board")
    br
</template>

<script lang="ts">
import Vue from "vue";
import { PropType } from "vue";
import _ from "lodash";
import { Chessground } from "chessground";
import { Chess, Move, ChessInstance, Square, PieceType } from "chess.js";
import { Api } from "chessground/api";
import { DrawShape } from "chessground/draw";
import { Color, Dests, MoveMetadata, Key } from "chessground/types";

export declare type Threats = {
  history?: string[];
  fen?: string;
  turn?: Color;
  legal_white?: number;
  checks_white?: number;
  threat_white?: number;
  legal_black?: number;
  checks_black?: number;
  threat_black?: number;
};

class ChessBoardData {
  game: ChessInstance;
  board?: Api;
  promotions: Array<Move>;
  promoteTo: Exclude<PieceType, "p">;

  constructor(
    game: ChessInstance,
    promotions: Array<Move>,
    board?: Api,
    promoteTo?: Exclude<PieceType, "p">
  ) {
    this.game = game;
    this.board = board;
    this.promotions = promotions;
    this.promoteTo = promoteTo || "q";
  }
}

export default Vue.extend({
  name: "chessboard",
  props: {
    fen: {
      type: String,
      default: ""
    },
    free: {
      type: Boolean,
      default: false
    },
    showThreats: {
      type: Boolean,
      default: false
    },
    onPromotion: Object as PropType<Exclude<PieceType, "p">>,
    orientation: {
      type: String,
      default: ""
    }
  },
  watch: {
    fen: function(newFen: string) {
      this.loadPosition(newFen);
    },
    orientation: function(orientation) {
      this.loadPosition();
    },
    showThreats: function(st) {
      if (this.showThreats) {
        this.paintThreats();
      }
    }
  },
  methods: {
    possibleMoves(): Dests {
      const dests: Dests = new Map();
      this.game.SQUARES.forEach(s => {
        const ms = this.game.moves({ square: s, verbose: true });
        if (ms.length)
          dests.set(
            s,
            ms.map(m => m.to)
          );
      });
      return dests;
    },
    opponentMoves(): Array<Move> {
      const originalPGN = this.game.pgn();
      const tokens = this.game.fen().split(" ");
      tokens[1] = tokens[1] === "w" ? "b" : "w";
      const joinedTokens = tokens.join(" ");
      const valid = this.game.load(joinedTokens);
      if (valid) {
        const moves = this.game.moves({ verbose: true });
        this.game.load_pgn(originalPGN);
        return moves;
      } else {
        return [];
      }
    },
    toColor(): Color {
      return this.game.turn() === "w" ? "white" : "black";
    },
    paintThreats() {
      const moves = this.game.moves({ verbose: true });
      const threats: Array<DrawShape> = [];
      moves.forEach(function(move) {
        threats.push({ orig: move.to, brush: "yellow" });
        if (move["captured"]) {
          threats.push({ orig: move.from, dest: move.to, brush: "red" });
        }
        if (move["san"].includes("+")) {
          threats.push({ orig: move.from, dest: move.to, brush: "blue" });
        }
      });
      if (this.board) {
        this.board.setShapes(threats);
      }
    },
    calculatePromotions() {
      const moves = this.game.moves({ verbose: true });
      this.promotions = [];
      for (const move of moves) {
        if (move.promotion) {
          this.promotions.push(move);
        }
      }
    },
    isPromotion(orig: Key, dest: Key): boolean {
      const filteredPromotions = this.promotions.filter(
        (move: Move) => move.from === orig && move.to === dest
      );
      return filteredPromotions.length > 0; // The current movement is a promotion
    },
    changeTurn() {
      return (orig: Key, dest: Key, metadata: MoveMetadata): void => {
        if (this.isPromotion(orig, dest)) {
          this.promoteTo = this.onPromotion;
        }
        this.game.move({
          from: orig as Square,
          to: dest as Square,
          promotion: this.promoteTo
        }); // promote to queen for simplicity
        if (this.board) {
          this.board.set({
            fen: this.game.fen(),
            turnColor: this.toColor(),
            movable: {
              color: this.toColor(),
              dests: this.possibleMoves()
            }
          });
        }
        this.calculatePromotions();
        this.afterMove();
      };
    },
    afterMove() {
      if (this.showThreats) {
        this.paintThreats();
      }
      const threats: Threats = this.countThreats(this.toColor()) || {};
      threats["history"] = this.game.history();
      threats["fen"] = this.game.fen();

      this.$emit("onMove", threats);
    },
    countThreats(color: Color) {
      const threats: Threats = {};
      let captures = 0;
      let checks = 0;
      let moves = this.game.moves({ verbose: true });
      if (color !== this.toColor()) {
        moves = this.opponentMoves();
      }
      if (moves.length === 0) {
        return null; // It´s an invalid position
      }
      moves.forEach(function(move) {
        if (move["captured"]) {
          captures++;
        }
        if (move["san"].includes("+")) {
          checks++;
        }
      });
      const legal = _.uniq(moves.map(x => x.from + x.to)).length; // promotions count as 4 moves. This remove those duplicates moves.
      if ("white" === color) {
        threats["legal_white"] = legal;
        threats["checks_white"] = checks;
        threats["threat_white"] = captures;
      } else {
        threats["legal_black"] = legal;
        threats["checks_black"] = checks;
        threats["threat_black"] = captures;
      }
      threats[`turn`] = color;
      return threats;
    },
    loadPosition(fen?: string): void {
      if (fen === this.game.fen()) {
        return;
      }
      // set a default value for the configuration object itself to allow call to loadPosition()
      this.game.load(fen || this.fen);
      this.board = Chessground(this.$refs.board as HTMLElement, {
        fen: this.game.fen(),
        turnColor: this.toColor(),
        movable: {
          color: this.toColor(),
          free: this.free,
          dests: this.possibleMoves()
        },
        orientation: "white"
      });
      this.board.set({
        movable: { events: { after: this.changeTurn() } }
      });
      this.afterMove();
    }
  },
  mounted() {
    this.loadPosition();
  },
  data: function() {
    return new ChessBoardData(new Chess(""), []);
  }
});
</script>

<style src="@/assets/theme.css"></style>
