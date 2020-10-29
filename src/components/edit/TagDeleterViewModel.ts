import "reflect-metadata";
import { Vue, Component, Prop, Emit } from "vue-property-decorator";
import { TagTree } from "@/store/repertoire/TagTree";
import { RemoveRepertoireTagPayload } from "@/store/MutationPayloads";

@Component
export default class TagDeleterViewModel extends Vue {
  showDialog = false;

  @Prop({ required: true })
  tag!: TagTree;

  @Prop({ required: false, default: false })
  disabled!: boolean;

  @Emit("onDelete")
  onDelete(): Pick<RemoveRepertoireTagPayload, "id"> {
    this.showDialog = false;
    return { id: this.tag.id };
  }
}
