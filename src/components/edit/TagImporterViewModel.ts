import Vue from "vue";
import _ from "lodash";
import { mapMutations } from "vuex";

import { parsePgn, PgnGame } from "@/store/pgnParser";
import { RepertoireTag } from "@/store/repertoireTag";

declare interface ImporterComponentData {
  showDialog: boolean;
  inputFile?: File;
  inputFileRules: ((value: File) => true | string)[];
  inputFileErrors: string | string[];
  loading: boolean;
  valid: boolean;
  pgnParser: (pgnText: string) => PgnGame[];
}

export default Vue.extend({
  data(): ImporterComponentData {
    return {
      showDialog: false,
      inputFile: undefined,
      inputFileRules: [
        value => {
          return !!value || "Must specify a file to import.";
        }
      ],
      inputFileErrors: [],
      loading: false,
      valid: false,
      pgnParser: parsePgn
    };
  },

  props: {
    tag: {
      type: RepertoireTag,
      required: true
    }
  },

  methods: {
    ...mapMutations(["addPositionsFromGame"]),

    async onImport() {
      if (this.inputFile) {
        this.inputFile.text().then(pgnText => {
          try {
            const pgn = this.pgnParser(pgnText);
            _.forEach(pgn, game => {
              console.log("adding");
              this.addPositionsFromGame({
                forSide: this.tag.forSide,
                game: game
              });
            });
            this.showDialog = false;
          } catch (error) {
            this.inputFileErrors = [`Invalid PGN: ${error.message}`];
            console.log(error);
          } finally {
            this.loading = false;
          }
        });
      }
    }
  }
});
