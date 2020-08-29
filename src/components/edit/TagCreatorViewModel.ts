import Vue from "vue";

import { RepertoireTag } from "@/store/repertoireTag";
import { RepertoirePosition } from "@/store/repertoirePosition";

export default Vue.extend({
  data: () => ({
    showDialog: false,
    valid: false,
    name: "",
    nameRules: [(value: string) => !!value || "Name is required"]
  }),

  props: {
    parentTag: {
      type: RepertoireTag,
      required: true
    },

    activePosition: {
      type: RepertoirePosition,
      required: true
    }
  },

  computed: {
    disabled(): boolean {
      return !this.parentTag.position.IsChildPosition(this.activePosition);
    }
  },

  methods: {
    validate(): boolean {
      return (this.$refs.form as Vue & { validate: () => boolean }).validate();
    },

    onCreate(): void {
      if (this.validate()) {
        this.$emit("onCreate", this.parentTag, this.name);
        this.showDialog = false;
        this.name = "";
      }
    }
  }
});
