import "reflect-metadata";
import { Vue, Component, Emit, Prop } from "vue-property-decorator";

import { VariationMove } from "@/store/repertoire/PositionCollection";

@Component
export default class MoveDeleterViewModel extends Vue {
  showDialog = false;

  @Prop({ required: true })
  move!: VariationMove;

  @Emit("onDelete")
  onDelete() {
    return this.move;
  }
}
