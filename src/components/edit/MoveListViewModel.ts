import _ from "lodash";
import "reflect-metadata";
import { Vue, Component, Prop, Emit, Watch } from "vue-property-decorator";

import {
  Variation,
  VariationMove
} from "@/store/repertoire/PositionCollection";
import { Side } from "@/store/side";
import { sideFromFen } from "@/store/repertoire/chessHelpers";

type TurnMove = string | undefined;

interface Turn {
  turnNumber: number;
  whiteMove: TurnMove;
  blackMove: TurnMove;
}

@Component
export default class MoveListViewModel extends Vue {
  pageIndex = 1;

  @Prop({ required: true }) variations!: Variation[];

  @Watch("variations")
  onTurnListsChanged(): void {
    this.pageIndex = 1;
  }

  get turnLists(): Turn[][] {
    return _.map(this.variations, variation => {
      const sans: TurnMove[] = [];

      if (Side.Black === sideFromFen(variation[0].sourceFen)) {
        sans.push(undefined);
      }

      _.forEach(variation, move => sans.push(move.san));

      const turns: Turn[] = [];

      _.forEach(_.chunk(sans, 2), (turn: TurnMove[], index: number) => {
        turns.push({
          turnNumber: index + 1,
          whiteMove: turn[0],
          blackMove: turn[1]
        });
      });

      return turns;
    });
  }

  @Emit("onSelectMove")
  onSelectMove(_move: VariationMove): void {
    _.noop();
  }
}
