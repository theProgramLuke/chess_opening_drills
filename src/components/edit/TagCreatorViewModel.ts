import _ from "lodash";
import "reflect-metadata";
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { InputValidationRules } from "vuetify";

import { TagTree } from "@/store/repertoire/TagTree";
import { Repertoire } from "@/store/repertoire/Repertoire";

@Component
export default class TagCreatorViewModel extends Vue {
  showDialog = false;
  valid = false;
  name = "";
  nameRules: InputValidationRules = [
    (value: string) => !!value || "Name is required"
  ];

  @Prop({ required: true })
  parentTag!: TagTree;

  @Prop({ required: true })
  repertoire!: Repertoire;

  @Prop({ required: true })
  activePosition!: string;

  get disabled(): boolean {
    const descendants = this.repertoire.positions.descendantPositions(
      this.parentTag.fen
    );
    return !(
      this.activePosition === this.parentTag.fen ||
      _.includes(descendants, this.activePosition)
    );
  }

  validate(): boolean {
    return (this.$refs.form as Vue & { validate: () => boolean }).validate();
  }

  onCreate(): void {
    if (this.validate()) {
      this.$emit("onCreate", this.parentTag, this.name);
      this.showDialog = false;
      this.name = "";
    }
  }
}
