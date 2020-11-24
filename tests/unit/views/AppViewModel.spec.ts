import { shallowMount, createLocalVue, Wrapper } from "@vue/test-utils";
import _ from "lodash";
import Vue from "vue";
import Vuex from "vuex";
import Vuetify from "vuetify";

import AppViewModel, { baseMenuItems } from "@/views/AppViewModel";
import { Repertoire } from "@/store/repertoire/Repertoire";
import { Side } from "@/store/side";
import { TrainingCollection } from "@/store/repertoire/TrainingCollection";

jest.mock("@/store/repertoire/Repertoire");
jest.mock("@/store/repertoire/TrainingCollection");

Vue.use(Vuetify);

describe("AppViewModel", () => {
  let component: Wrapper<AppViewModel>;
  let state: {
    whiteRepertoire: Repertoire;
    blackRepertoire: Repertoire;
    darkMode: boolean;
    primary: string;
    secondary: string;
    accent: string;
    error: string;
    warning: string;
    info: string;
    success: string;
  };
  const initialColorTheme = {
    primary: "#000",
    secondary: "#001",
    accent: "#002",
    error: "#003",
    warning: "#004",
    info: "#005",
    success: "#006",
  };
  const initialDarkMode = false;

  function mountComponent(): Wrapper<AppViewModel> {
    const localVue = createLocalVue();
    localVue.use(Vuex);

    const mutations = {
      addRepertoireMove: jest.fn(),
      removeRepertoireMove: jest.fn(),
      addPositionsFromPgn: jest.fn(),
      otherMutation: jest.fn(),
    };
    const store = new Vuex.Store({ state, mutations });

    return shallowMount(AppViewModel, {
      render: jest.fn(),
      localVue,
      store,
      vuetify: new Vuetify(),
    });
  }

  beforeEach(() => {
    const emptyRepertoire = {
      positions: {},
      training: {},
      tags: {
        name: "",
        id: "",
        fen: "",
        children: [],
        isRootTag: false,
      },
      sideToTrain: Side.White,
    };

    state = {
      whiteRepertoire: new Repertoire(emptyRepertoire),
      blackRepertoire: new Repertoire(emptyRepertoire),
      darkMode: initialDarkMode,
      ...initialColorTheme,
    };
    state.whiteRepertoire.training = new TrainingCollection();
    state.blackRepertoire.training = new TrainingCollection();

    component = mountComponent();
  });

  describe("onDarkModeChange", () => {
    it.each([true, false])("should set the vuetify dark mode %s", darkMode => {
      component.vm.onDarkModeChange(darkMode);
      const actual = component.vm.$vuetify.theme.dark;

      expect(actual).toEqual(darkMode);
    });
  });

  describe("onPrimaryColorChange", () => {
    it.each(["#000", "#FFF"])(
      "should set the vuetify primary color %s",
      color => {
        component.vm.onPrimaryColorChange(color);
        const actual = component.vm.$vuetify.theme.currentTheme.primary;

        expect(actual).toEqual(color);
      }
    );
  });

  describe("onSecondaryColorChange", () => {
    it.each(["#000", "#FFF"])(
      "should set the vuetify secondary color %s",
      color => {
        component.vm.onSecondaryColorChange(color);
        const actual = component.vm.$vuetify.theme.currentTheme.secondary;

        expect(actual).toEqual(color);
      }
    );
  });

  describe("onAccentColorChange", () => {
    it.each(["#000", "#FFF"])(
      "should set the vuetify accent color %s",
      color => {
        component.vm.onAccentColorChange(color);
        const actual = component.vm.$vuetify.theme.currentTheme.accent;

        expect(actual).toEqual(color);
      }
    );
  });

  describe("onErrorColorChange", () => {
    it.each(["#000", "#FFF"])(
      "should set the vuetify error color %s",
      color => {
        component.vm.onErrorColorChange(color);
        const actual = component.vm.$vuetify.theme.currentTheme.error;

        expect(actual).toEqual(color);
      }
    );
  });

  describe("onWarningColorChange", () => {
    it.each(["#000", "#FFF"])(
      "should set the vuetify warning color %s",
      color => {
        component.vm.onWarningColorChange(color);
        const actual = component.vm.$vuetify.theme.currentTheme.warning;

        expect(actual).toEqual(color);
      }
    );
  });

  describe("onInfoColorChange", () => {
    it.each(["#000", "#FFF"])("should set the vuetify info color %s", color => {
      component.vm.onInfoColorChange(color);
      const actual = component.vm.$vuetify.theme.currentTheme.info;

      expect(actual).toEqual(color);
    });
  });

  describe("onSuccessColorChange", () => {
    it.each(["#000", "#FFF"])(
      "should set the vuetify success color %s",
      color => {
        component.vm.onSuccessColorChange(color);
        const actual = component.vm.$vuetify.theme.currentTheme.success;

        expect(actual).toEqual(color);
      }
    );
  });

  describe("created", () => {
    it("should set all of the vuetify theme colors", () => {
      const actual = component.vm.$vuetify.theme.currentTheme;

      expect(actual).toEqual(initialColorTheme);
    });

    it("should set all of the vuetify theme colors", () => {
      const actual = component.vm.$vuetify.theme.dark;

      expect(actual).toEqual(initialDarkMode);
    });
  });

  describe("menuItems", () => {
    it("should be the base menu items if no positions have been trained", () => {
      const actual = component.vm.menuItems;

      expect(actual).toEqual(baseMenuItems);
    });

    it("should be the base menu items if no positions have been multiple moves to be trained", () => {
      (state.whiteRepertoire.training.getMoves as jest.Mock).mockReturnValue([
        { fen: "0", san: "" },
        { fen: "1", san: "" },
      ]);
      (state.blackRepertoire.training.getMoves as jest.Mock).mockReturnValue(
        []
      );

      const actual = component.vm.menuItems;

      expect(actual).toEqual(baseMenuItems);
    });

    it(`should add a subtitle to the repertoire health base menu item
        with the count of positions to train with multiple moves`, () => {
      (state.whiteRepertoire.training
        .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({
        "0": [
          { fen: "0", san: "0" },
          { fen: "0", san: "1" },
        ],
      });
      (state.blackRepertoire.training
        .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({
        "2": [
          { fen: "2", san: "3" },
          { fen: "2", san: "4" },
          { fen: "2", san: "5" },
        ],
      });
      const expected = _.cloneDeep(baseMenuItems);
      _.forEach(
        _.filter(expected, menuItem => menuItem.route === "/health"),
        menuItem => {
          menuItem.subtitle = "2 warnings";
        }
      );

      const actual = component.vm.menuItems;

      expect(actual).toEqual(expected);
    });

    it.each([
      "addRepertoireMove",
      "removeRepertoireMove",
      "addPositionsFromPgn",
    ])(
      `should update the subtitle when the repertoire positions change by %s`,
      mutationType => {
        const expected = component.vm.recomputeMenuItems + 1;

        component.vm.$store.commit(mutationType);
        const actual = component.vm.recomputeMenuItems;

        expect(actual).toEqual(expected);
      }
    );

    it(`should not update the subtitle for other mutations`, () => {
      const expected = component.vm.recomputeMenuItems;

      component.vm.$store.commit("otherMutation");
      const actual = component.vm.recomputeMenuItems;

      expect(actual).toEqual(expected);
    });
  });

  describe("onRouteChanged", () => {
    let htmlClassList: { add: jest.Mock; remove: jest.Mock };

    beforeEach(() => {
      htmlClassList = { add: jest.fn(), remove: jest.fn() };

      jest
        .spyOn(global.document, "children", "get")
        .mockReturnValue(([
          { classList: htmlClassList },
        ] as unknown) as HTMLCollection);
    });

    it.each(["Welcome", "Settings"])(
      "should add the scrollable class for the %s route",
      name => {
        component.vm.onRouteChange({ name });

        expect(htmlClassList.add).toBeCalledWith("scrollable");
      }
    );

    it("should remove the scrollable class for the other routes", () => {
      component.vm.onRouteChange({ name: "other" });

      expect(htmlClassList.remove).toBeCalledWith("scrollable");
    });

    it("should not call add or remove if the element is undefined", () => {
      jest
        .spyOn(global.document, "children", "get")
        .mockReturnValue(([] as unknown) as HTMLCollection);

      component.vm.onRouteChange({});

      expect(htmlClassList.add).not.toBeCalled();
      expect(htmlClassList.remove).not.toBeCalled();
    });
  });
});
