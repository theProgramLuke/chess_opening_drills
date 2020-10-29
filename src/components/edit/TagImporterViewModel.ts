import "reflect-metadata";
import { Vue, Component, Prop } from "vue-property-decorator";
import { Mutation } from "vuex-class";
import { InputValidationRules } from "vuetify";

import { TagTree } from "@/store/repertoire/TagTree";
import { Repertoire } from "@/store/repertoire/Repertoire";
import { AddMovesFromPgnPayload } from "@/store/MutationPayloads";

@Component
export default class TagImporterViewModel extends Vue {
  showDialog = false;
  inputFile: File = new File([], "");
  inputFileRules: InputValidationRules = [
    (value: string) => {
      return !!value || "Must specify a file to import.";
    }
  ];
  inputFileErrors: string | string[] = [];
  loading = false;
  valid = false;

  @Prop({ required: true })
  tag!: TagTree;

  @Prop({ required: true })
  repertoire!: Repertoire;

  @Mutation
  addPositionsFromPgn!: (payload: AddMovesFromPgnPayload) => void;

  async onImport() {
    // TODO handle no input file
    if (this.inputFile) {
      this.inputFile.text().then(pgn => {
        try {
          this.addPositionsFromPgn({
            repertoire: this.repertoire,
            pgn
          });
          this.showDialog = false;
        } catch (error) {
          this.inputFileErrors = [`Invalid PGN: ${error.message}`];
        } finally {
          this.loading = false;
        }
      });
    }
  }
}
