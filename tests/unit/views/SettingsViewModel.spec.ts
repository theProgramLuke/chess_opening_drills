import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vue from "vue";
import Vuex from "vuex";
import Vuetify from "vuetify";

import SettingsViewModel from "@/views/SettingsViewModel.ts";
import { EngineMetadata } from "@/store/EngineHelpers";

const state = {
  darkMode: true,
  boardTheme: "some board theme",
  pieceTheme: "some piece theme",
  engineMetadata: undefined as EngineMetadata | undefined
};
const mutations = {
  setDarkMode: jest.fn(),
  setColor: jest.fn(),
  setBoardTheme: jest.fn(),
  setPieceTheme: jest.fn(),
  setEngineMetadata: jest.fn(),
  clearStorage: jest.fn()
};

Vue.use(Vuetify);

const localVue = createLocalVue();
localVue.use(Vuex);
const store = new Vuex.Store({ state, mutations });

beforeEach(() => {
  mutations.setDarkMode.mockReset();
  mutations.setColor.mockReset();
  mutations.setBoardTheme.mockReset();
  mutations.setPieceTheme.mockReset();
  mutations.setEngineMetadata.mockReset();
  mutations.clearStorage.mockReset();
});

describe("SettingsViewModel", () => {
  describe("selectedDarkMode", () => {
    it.each([true, false])("should get the state darkMode %s", darkMode => {
      store.state.darkMode = darkMode;
      const component = shallowMount(SettingsViewModel, {
        localVue,
        store,
        render: jest.fn()
      });

      expect(component.vm.selectedDarkMode).toBe(darkMode);
    });

    it.each([true, false])("should set the state darkMode %s", darkMode => {
      const component = shallowMount(SettingsViewModel, {
        localVue,
        store,
        render: jest.fn()
      });
      component.vm.selectedDarkMode = darkMode;

      expect(mutations.setDarkMode).toBeCalledWith(state, darkMode);
    });
  });

  describe("selectedColorValue", () => {
    it("should get the color for the current theme", () => {
      const component = shallowMount(SettingsViewModel, {
        localVue,
        store,
        vuetify: new Vuetify(),
        render: jest.fn()
      });
      const color = "primary";
      const colorValue = "#000000";
      component.vm.selectedColor = color;
      component.vm.$vuetify.theme.currentTheme[color] = colorValue;

      expect(component.vm.selectedColorValue).toBe(colorValue);
    });

    it("should get the color for the current theme", () => {
      const component = shallowMount(SettingsViewModel, {
        localVue,
        store,
        render: jest.fn()
      });
      const color = "primary";
      const colorValue = "red";
      component.vm.selectedColor = color;

      component.vm.selectedColorValue = colorValue;

      expect(mutations.setColor).toBeCalledWith(state, {
        colorToSet: color,
        color: colorValue
      });
    });
  });

  describe("selectedBoardTheme", () => {
    it.each(["brown", "maple"])(
      "should get the state board theme %s",
      boardTheme => {
        store.state.boardTheme = boardTheme;
        const component = shallowMount(SettingsViewModel, {
          localVue,
          store,
          render: jest.fn()
        });

        expect(component.vm.selectedBoardTheme).toBe(boardTheme);
      }
    );

    it.each(["brown", "maple"])(
      "should set the state board theme %s",
      boardTheme => {
        const component = shallowMount(SettingsViewModel, {
          localVue,
          store,
          render: jest.fn()
        });
        component.vm.selectedBoardTheme = boardTheme;

        expect(mutations.setBoardTheme).toBeCalledWith(state, boardTheme);
      }
    );
  });

  describe("selectedPieceTheme", () => {
    it.each(["brown", "maple"])(
      "should get the state board theme %s",
      pieceTheme => {
        store.state.pieceTheme = pieceTheme;
        const component = shallowMount(SettingsViewModel, {
          localVue,
          store,
          render: jest.fn()
        });

        expect(component.vm.selectedPieceTheme).toBe(pieceTheme);
      }
    );

    it.each(["brown", "maple"])(
      "should set the state board theme %s",
      pieceTheme => {
        const component = shallowMount(SettingsViewModel, {
          localVue,
          store,
          render: jest.fn()
        });
        component.vm.selectedPieceTheme = pieceTheme;

        expect(mutations.setPieceTheme).toBeCalledWith(state, pieceTheme);
      }
    );
  });

  describe("selectedEngine", () => {
    it("should get undefined if engine metadata is undefined", () => {
      store.state.engineMetadata = undefined;
      const component = shallowMount(SettingsViewModel, {
        localVue,
        store,
        render: jest.fn()
      });

      expect(component.vm.selectedEngine).toBeUndefined();
    });

    it("should get a file with the metadata file path", () => {
      const filePath = "path";
      store.state.engineMetadata = { name: "", filePath, options: [] };
      const component = shallowMount(SettingsViewModel, {
        localVue,
        store,
        render: jest.fn()
      });

      expect(component.vm.selectedEngine).toEqual(new File([], filePath));
    });

    it("should set undefined if the new engine is undefined", async () => {
      const component = shallowMount(SettingsViewModel, {
        localVue,
        store,
        render: jest.fn()
      });

      component.vm.selectedEngine = undefined;

      expect(mutations.setEngineMetadata).toBeCalledWith(state, undefined);
    });

    it("should set the engine metadata from the file path", async () => {
      const component = shallowMount(SettingsViewModel, {
        localVue,
        store,
        render: jest.fn()
      });
      const filePath = "path";
      const metadata = { name: "name", filePath: "filePath", options: [] };
      component.vm.getMetadataFromEngine = jest.fn(async () => metadata);

      await (component.vm.selectedEngine = new File([], filePath));

      expect(mutations.setEngineMetadata).toBeCalledWith(state, metadata);
    });
  });

  describe("selectedEngineMetadata", () => {
    it("should get a clone of the engine metadata", () => {
      store.state.engineMetadata = {
        name: "",
        filePath: "path",
        options: []
      };
      const component = shallowMount(SettingsViewModel, {
        localVue,
        store,
        render: jest.fn()
      });

      const actual = component.vm.selectedEngineMetadata;

      expect(actual).toEqual(store.state.engineMetadata);
      expect(actual).not.toBe(store.state.engineMetadata);
    });
  });

  describe("updateEngineMetadata", () => {
    it("should set the engine metadata", () => {
      store.state.engineMetadata = {
        name: "",
        filePath: "path",
        options: []
      };
      const component = shallowMount(SettingsViewModel, {
        localVue,
        store,
        render: jest.fn()
      });

      component.vm.updateEngineMetadata();

      expect(mutations.setEngineMetadata).toBeCalledWith(
        state,
        store.state.engineMetadata
      );
    });
  });
});