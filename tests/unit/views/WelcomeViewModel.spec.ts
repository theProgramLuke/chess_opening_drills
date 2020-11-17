import { Wrapper, shallowMount } from "@vue/test-utils";

import WelcomeViewModel from "@/views/WelcomeViewModel";
import { remote } from "electron";

jest.mock("electron");

describe("WelcomeViewModel", () => {
  let component: Wrapper<WelcomeViewModel>;

  function mountComponent(): Wrapper<WelcomeViewModel> {
    return shallowMount(WelcomeViewModel, {
      render: jest.fn(),
    });
  }

  beforeEach(() => {
    component = mountComponent();
  });

  describe("version", () => {
    it("should be the app version from electron", () => {
      const expected = "mock version";
      (remote.app.getVersion as jest.Mock).mockReturnValue(expected);

      const actual = component.vm.version;

      expect(actual).toEqual(expected);
    });
  });
});
