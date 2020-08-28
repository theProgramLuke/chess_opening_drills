import { shallowMount } from "@vue/test-utils";
import vuetify from "vuetify";
import Vue from "vue";

import TagDeleter from "@/components/TagDeleter.vue";
import { RepertoireTag } from "@/store/repertoireTag";
import { Side } from "@/store/side";
import { RepertoirePosition } from "@/store/repertoirePosition";

beforeEach(() => {
  Vue.use(vuetify);
});

describe("TagDeleter", () => {
  it("renders correctly", () => {
    const component = shallowMount(TagDeleter, {
      propsData: {
        tag: new RepertoireTag(
          Side.White,
          "tag name",
          new RepertoirePosition("", "", Side.White),
          "",
          []
        )
      }
    });

    expect(component.element).toMatchSnapshot();
  });
});
