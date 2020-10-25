import _ from "lodash";
import { Vue, Component, Emit, Prop } from "vue-property-decorator";

import TagDeleter from "@/components/edit/TagDeleter.vue";
import TagCreator from "@/components/edit/TagCreator.vue";
import TagExporter from "@/components/edit/TagExporter.vue";
import TagImporter from "@/components/edit/TagImporter.vue";
import { TagTree } from "@/store/repertoire/TagTree";
import { Repertoire } from "@/store/repertoire/Repertoire";

@Component({
  components: { TagDeleter, TagCreator, TagExporter, TagImporter }
})
export default class TagTreeViewModel extends Vue {
  @Prop({ required: true })
  whiteRepertoire!: Repertoire;

  @Prop({ required: true })
  blackRepertoire!: Repertoire;

  @Prop({ required: true })
  activePosition!: string;

  // TODO view transformation

  @Emit("onCreate")
  onCreate(parent: TagTree, name: string): void {
    _.noop();
  }

  @Emit("onDelete")
  onDelete(tag: TagTree): void {
    _.noop();
  }

  @Emit("onSelect")
  onSelect(fen: string) {
    _.noop();
  }
}
