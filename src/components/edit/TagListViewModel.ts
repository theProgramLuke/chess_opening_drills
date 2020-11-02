import _ from "lodash";
import "reflect-metadata";
import { Vue, Component, Emit, Prop } from "vue-property-decorator";

import TagDeleter from "@/components/edit/TagDeleter.vue";
import TagCreator from "@/components/edit/TagCreator.vue";
import TagExporter from "@/components/edit/TagExporter.vue";
import TagImporter from "@/components/edit/TagImporter.vue";
import { Repertoire } from "@/store/repertoire/Repertoire";

@Component({
  components: { TagDeleter, TagCreator, TagExporter, TagImporter },
})
export default class TagListViewModel extends Vue {
  forceRender = 0;

  @Prop({ required: true })
  whiteRepertoire!: Repertoire;

  @Prop({ required: true })
  blackRepertoire!: Repertoire;

  @Prop({ required: true })
  activePosition!: string;

  get repertoires(): Repertoire[] {
    return [this.whiteRepertoire, this.blackRepertoire];
  }

  @Emit("onCreate")
  onCreate(): void {
    _.noop();
  }

  @Emit("onDelete")
  onDelete(): void {
    ++this.forceRender;
  }

  @Emit("onSelect")
  onSelect(_repertoire: Repertoire, _fen: string) {
    _.noop();
  }
}
