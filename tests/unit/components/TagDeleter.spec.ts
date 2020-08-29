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

  it("should default to not showing a delete dialog", () => {
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

    expect(component.vm.$data.showDialog).toBeFalsy();
  });

  it("should emit onDelete for the supplied tag", async () => {
    const tag = new RepertoireTag(
      Side.White,
      "tag name",
      new RepertoirePosition("", "", Side.White),
      "",
      []
    );
    const component = shallowMount(TagDeleter, {
      propsData: {
        tag: tag
      }
    });

    (component.vm as any & { onDelete: () => void }).onDelete();

    expect(component.emitted().onDelete).toEqual([[tag]]);
  });
});
