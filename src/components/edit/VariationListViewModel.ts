import _ from "lodash";
import { Vue, Component, Emit, Prop } from "vue-property-decorator";

import MoveDeleter from "@/components/edit/MoveDeleter.vue";
import {
  Variation,
  VariationMove
} from "@/store/repertoire/PositionCollection";

@Component({ components: { MoveDeleter } })
export default class VariationListViewModel extends Vue {
  @Prop({ required: true })
  variations!: Variation[];

  @Emit("onSelectMove")
  onSelectMove(fen: string): void {
    _.noop();
  }

  @Emit("onDeleteMove")
  onDeleteMove(move: VariationMove): void {
    this.$forceUpdate();
  }
}
