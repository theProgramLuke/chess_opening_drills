import "reflect-metadata";
import { Vue, Component, Prop } from "vue-property-decorator";
import { saveAs } from "file-saver";

import { TagTree } from "@/store/repertoire/TagTree";
import { Repertoire } from "@/store/repertoire/Repertoire";

@Component
export default class TagExporterViewModel extends Vue {
  showDialog = false;

  @Prop({ required: true })
  repertoire!: Repertoire;

  @Prop({ required: true })
  tag!: TagTree;

  get pgnText(): string {
    return this.repertoire.positions.asPgn(this.tag.fen);
  }

  copy(): void {
    navigator.clipboard.writeText(this.pgnText);
  }

  save(): void {
    saveAs(
      new Blob([this.pgnText], { type: "text/plain;charset=utf-8" }),
      `Exported ${this.tag.name}.pgn`
    );
  }
}
