import { shallowMount, createLocalVue, Wrapper } from "@vue/test-utils";
import _ from "lodash";
import Vue from "vue";
import Vuex from "vuex";
import Vuetify from "vuetify";

import AppViewModel, { baseMenuItems } from "@/views/AppViewModel.ts";
import { Repertoire } from "@/store/repertoire/Repertoire";
import { Side } from "@/store/side";

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

    const store = new Vuex.Store({ state });

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
  });
});
