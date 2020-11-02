import { shallowMount } from "@vue/test-utils";

import ReportsViewModel from "@/views/ReportsViewModel.ts";

describe("ReportsViewModel", () => {
  const mountComponent = () =>
    shallowMount(ReportsViewModel, {
      render: jest.fn(),
    });

  it("should be render", () => {
    mountComponent();
  });
});
