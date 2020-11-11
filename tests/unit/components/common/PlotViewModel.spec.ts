import { Wrapper, shallowMount } from "@vue/test-utils";
import Plotly, { PlotData, Layout } from "plotly.js";
import { Config } from "electron";
import _ from "lodash";

import PlotViewModel from "@/components/common/PlotViewModel";
import { PlotlyWhite } from "@/views/PlotlyLayouts";

describe("PlotViewModel", () => {
  let component: Wrapper<PlotViewModel>;
  let plotData: Partial<PlotData>[];
  let plotLayout: Partial<Layout>;
  let plotOptions: Partial<Config>;

  function mountComponent(dark = false) {
    return shallowMount(PlotViewModel, {
      render: jest.fn(),
      propsData: {
        options: plotOptions,
        data: plotData,
        layout: plotLayout,
        dark,
      },
    });
  }

  beforeEach(() => {
    (Plotly.react as jest.Mock).mockReset();
    (Plotly.purge as jest.Mock).mockReset();
    (Plotly.relayout as jest.Mock).mockReset();

    plotData = [{ type: "bar" }, { type: "pie" }];
    plotLayout = {};
    plotOptions = {};

    component = mountComponent();
  });

  describe("life cycle hooks", () => {
    describe("mounted", () => {
      it("should call Plotly.react", () => {
        expect(Plotly.react).toBeCalledWith(
          component.vm.$refs.container,
          _.map(plotData, entry => {
            return { ...entry, ...PlotlyWhite.data };
          }),
          { ...plotLayout, ...PlotlyWhite.layout },
          plotOptions
        );
      });
    });

    describe("beforeDestroy", () => {
      it("should call Plotly.purge ", () => {
        component.vm.$destroy();

        expect(Plotly.purge).toBeCalledWith(component.vm.$refs.container);
      });
    });
  });

  describe("data", () => {
    it("should trigger Ploty.react when changed", () => {
      (Plotly.react as jest.Mock).mockReset();

      component.vm.onDataChanged();

      expect(Plotly.react).toBeCalled();
    });
  });

  describe("layout", () => {
    it("should trigger Ploty.relayout when changed", () => {
      (Plotly.relayout as jest.Mock).mockReset();

      component.vm.onLayoutChanged();

      expect(Plotly.relayout).toBeCalledWith(component.vm.$refs.container, {
        ...plotLayout,
        ...PlotlyWhite.layout,
      });
    });
  });

  describe("options", () => {
    it("should trigger Ploty.react when changed", () => {
      (Plotly.react as jest.Mock).mockReset();

      component.vm.onOptionsChanged();

      expect(Plotly.react).toBeCalled();
    });
  });
});
