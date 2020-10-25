import _ from "lodash";
import "reflect-metadata";
import { Vue, Component, Prop, Emit, Watch } from "vue-property-decorator";

import {
  Variation,
  VariationMove
} from "@/store/repertoire/PositionCollection";

@Component
export default class MoveListViewModel extends Vue {
  pageIndex = 1;

  @Prop({ required: true }) turnLists!: Variation[];

  @Watch("turnLists")
  onTurnListsChanged(): void {
    this.pageIndex = 1;
  }

  @Emit("onSelectMove")
  onSelectMove(move: VariationMove): void {
    _.noop();
  }
}
