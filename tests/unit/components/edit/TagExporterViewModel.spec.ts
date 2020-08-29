import { shallowMount } from "@vue/test-utils";

import TagExporterViewModel from "@/components/edit/TagExporterViewModel.ts";
import { RepertoireTag } from "@/store/repertoireTag";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Side } from "@/store/side";

describe("TagExporterViewModel", () => {
  let tag: RepertoireTag;

  beforeEach(() => {
    tag = new RepertoireTag(
      Side.White,
      "",
      new RepertoirePosition("", "", Side.White),
      "",
      []
    );
  });

  describe("showDialog", () => {
    it("should start by not showing the dialog", () => {
      const component = shallowMount(TagExporterViewModel, {
        render: jest.fn(),
        propsData: {
          tag: tag
        }
      });

      expect(component.vm.showDialog).toBeFalsy();
    });
  });
});
