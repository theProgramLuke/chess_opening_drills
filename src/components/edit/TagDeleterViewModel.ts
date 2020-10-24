import "reflect-metadata";
import { Vue, Component, Prop, Emit } from "vue-property-decorator";
import { TagTree } from "@/store/repertoire/TagTree";

@Component
export default class TagDeleterViewModel extends Vue {
  showDialog = false;

  @Prop({ required: true })
  tag!: TagTree;

  @Prop({ required: false, default: false })
  disabled!: boolean;

  @Emit("onDelete")
  onDelete() {
    this.showDialog = false;
    return this.tag;
  }
}
