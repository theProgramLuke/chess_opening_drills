import { shallowMount, createLocalVue, Wrapper } from "@vue/test-utils";
import Vue from "vue";
import Vuex from "vuex";
import Vuetify from "vuetify";
import _ from "lodash";

import SettingsViewModel from "@/views/SettingsViewModel.ts";
import { EngineMetadata } from "@/store/EngineHelpers";
import { SetColorPayload } from "@/store/MutationPayloads";
import { GetMetadataFromEngine } from "@/store/EngineHelpers";

jest.mock("fs");
jest.mock("@/store/EngineHelpers");

Vue.use(Vuetify);

describe("SettingsViewModel", () => {
  let state: {
    darkMode: boolean;
    boardTheme: string;
    pieceTheme: string;
    engineMetadata?: EngineMetadata;
    backupDirectory?: string;
    dailyBackupLimit: number;
    monthlyBackupLimit: number;
    yearlyBackupLimit: number;
    enableBackups: boolean;
    moveAnimationSpeed: number;
  };

  const mutations = {
    setDarkMode: jest.fn(),
    setColor: jest.fn(),
    setBoardTheme: jest.fn(),
    setPieceTheme: jest.fn(),
    setEngineMetadata: jest.fn(),
    setBackupDirectory: jest.fn(),
    setDailyBackupLimit: jest.fn(),
    setMonthlyBackupLimit: jest.fn(),
    setYearlyBackupLimit: jest.fn(),
    setEnableBackups: jest.fn(),
    setMoveAnimationSpeed: jest.fn(),
    clearStorage: jest.fn(),
  };

  let component: Wrapper<SettingsViewModel>;

  function mountComponent(): Wrapper<SettingsViewModel> {
    const localVue = createLocalVue();
    localVue.use(Vuex);

    const store = new Vuex.Store({ state, mutations });

    return shallowMount(SettingsViewModel, {
      localVue,
      store,
      render: jest.fn(),
    });
  }

  beforeEach(() => {
    _.forEach(mutations, mutation => mutation.mockReset());

    state = {
      darkMode: true,
      boardTheme: "some board theme",
      pieceTheme: "some piece theme",
      engineMetadata: undefined as EngineMetadata | undefined,
      backupDirectory: undefined as string | undefined,
      dailyBackupLimit: 0,
      monthlyBackupLimit: 0,
      yearlyBackupLimit: 0,
      enableBackups: false,
      moveAnimationSpeed: 0,
    };

    component = mountComponent();

    component.vm.$vuetify.theme = {
      dark: expect.anything(),
      disable: expect.anything(),
      default: expect.anything(),
      options: expect.anything(),
      themes: expect.anything(),
      currentTheme: {},
    };
  });

  describe("selectedDarkMode", () => {
    it.each([true, false])("should get the state darkMode %s", darkMode => {
      state.darkMode = darkMode;

      expect(component.vm.selectedDarkMode).toBe(darkMode);
    });

    it.each([true, false])("should set the state darkMode %s", darkMode => {
      component.vm.selectedDarkMode = darkMode;

      expect(mutations.setDarkMode).toBeCalledWith(state, darkMode);
    });
  });

  describe("selectedColorValue", () => {
    it("should get the color for the current theme", () => {
      const color = "primary";
      const expected = "#000000";
      component.vm.selectedColor = color;
      component.vm.$vuetify.theme.currentTheme[color] = expected;

      const actual = component.vm.selectedColorValue;

      expect(actual).toBe(expected);
    });

    it("should get the color for the current theme", () => {
      const color = "primary";
      const colorValue = "red";
      component.vm.selectedColor = color;

      component.vm.selectedColorValue = colorValue;

      const expected: SetColorPayload = {
        colorToSet: color,
        value: colorValue,
      };
      expect(mutations.setColor).toBeCalledWith(state, expected);
    });
  });

  describe("selectedBoardTheme", () => {
    it.each(["brown", "maple"])(
      "should get the state board theme %s",
      boardTheme => {
        state.boardTheme = boardTheme;

        expect(component.vm.selectedBoardTheme).toBe(boardTheme);
      }
    );

    it.each(["brown", "maple"])(
      "should set the state board theme %s",
      boardTheme => {
        component.vm.selectedBoardTheme = boardTheme;

        expect(mutations.setBoardTheme).toBeCalledWith(state, boardTheme);
      }
    );
  });

  describe("selectedPieceTheme", () => {
    it.each(["brown", "maple"])(
      "should get the state board theme %s",
      pieceTheme => {
        state.pieceTheme = pieceTheme;

        expect(component.vm.selectedPieceTheme).toBe(pieceTheme);
      }
    );

    it.each(["brown", "maple"])(
      "should set the state board theme %s",
      pieceTheme => {
        component.vm.selectedPieceTheme = pieceTheme;

        expect(mutations.setPieceTheme).toBeCalledWith(state, pieceTheme);
      }
    );
  });

  describe("selectedEngine", () => {
    it("should get undefined if engine metadata is undefined", () => {
      state.engineMetadata = undefined;

      expect(component.vm.selectedEngine).toBeUndefined();
    });

    it("should get a file with the metadata file path", () => {
      const filePath = "path";
      state.engineMetadata = { name: "", filePath, options: [] };
      const component = mountComponent();

      expect(component.vm.selectedEngine).toEqual(new File([], filePath));
    });

    it("should set undefined if the new engine is undefined", async () => {
      component.vm.selectedEngine = undefined;

      expect(mutations.setEngineMetadata).toBeCalledWith(state, undefined);
    });

    it("should set the engine metadata from the file path", async () => {
      const expected = new File([], "");
      // const expected = { name: "name", filePath: "filePath", options: [] };
      // (GetMetadataFromEngine as jest.Mock).mockReturnValue(expected);
      component.vm.setSelectedEngineAsync = jest.fn();

      component.vm.selectedEngine = expected;

      expect(component.vm.setSelectedEngineAsync).toBeCalledWith(expected);
    });
  });

  describe("setSelectedEngineAsync", () => {
    it("should set the engine metadata from the file path", async () => {
      const expected = { name: "name", filePath: "filePath", options: [] };
      (GetMetadataFromEngine as jest.Mock).mockResolvedValue(expected);

      await component.vm.setSelectedEngineAsync(new File([], ""));

      expect(mutations.setEngineMetadata).toBeCalledWith(state, expected);
      expect(component.vm.selectedEngineMetadata).toBe(expected);
    });

    it("should set the engine metadata as undefined when the file is undefined", async () => {
      await component.vm.setSelectedEngineAsync(undefined);

      expect(mutations.setEngineMetadata).toBeCalledWith(state, undefined);
      expect(component.vm.selectedEngineMetadata).toBe(undefined);
    });
  });

  describe("selectedEngineMetadata", () => {
    it("should set the engine metadata to be a clone of the state engine on mount", () => {
      const expected = { name: "name", filePath: "path", options: [] };
      state.engineMetadata = expected;
      const component = mountComponent();

      expect(component.vm.selectedEngineMetadata).toEqual(expected);
      expect(component.vm.selectedEngineMetadata).not.toBe(expected);
    });
  });

  describe("selectedBackupDirectory", () => {
    it("should get the state backup directory", () => {
      const backupDirectory = "backups";

      state.backupDirectory = backupDirectory;

      expect(component.vm.selectedBackupDirectory).toBe(backupDirectory);
    });

    it("should set the state backup directory", () => {
      const backupDirectory = "backups";

      component.vm.selectedBackupDirectory = backupDirectory;

      expect(mutations.setBackupDirectory).toBeCalledWith(
        state,
        backupDirectory
      );
    });
  });

  describe("selectedDailyBackupLimit", () => {
    it("should get the state daily backup limit", () => {
      const limit = 5;
      state.dailyBackupLimit = limit;

      expect(component.vm.selectedDailyBackupLimit).toBe(limit);
    });

    it("should set the state daily backup limit", () => {
      const limit = 5;

      component.vm.selectedDailyBackupLimit = limit;

      expect(mutations.setDailyBackupLimit).toBeCalledWith(state, limit);
    });
  });

  describe("selectedMonthlyBackupLimit", () => {
    it("should get the state monthly backup limit", () => {
      const limit = 5;
      state.monthlyBackupLimit = limit;

      expect(component.vm.selectedMonthlyBackupLimit).toBe(limit);
    });

    it("should set the state monthly backup limit", () => {
      const limit = 5;

      component.vm.selectedMonthlyBackupLimit = limit;

      expect(mutations.setMonthlyBackupLimit).toBeCalledWith(state, limit);
    });
  });

  describe("selectedYearlyBackupLimit", () => {
    it("should get the state yearly backup limit", () => {
      const limit = 5;
      state.yearlyBackupLimit = limit;

      expect(component.vm.selectedYearlyBackupLimit).toBe(limit);
    });

    it("should set the state yearly backup limit", () => {
      const limit = 5;

      component.vm.selectedYearlyBackupLimit = limit;

      expect(mutations.setYearlyBackupLimit).toBeCalledWith(state, limit);
    });
  });

  describe("selectedEnableBackups", () => {
    it.each([true, false])("should get the state enable backups %s", enable => {
      state.enableBackups = enable;

      expect(component.vm.selectedEnableBackups).toBe(enable);
    });

    it.each([true, false])("should set the state enable backups %s", enable => {
      component.vm.selectedEnableBackups = enable;

      expect(mutations.setEnableBackups).toBeCalledWith(state, enable);
    });
  });

  describe("selectedMoveAnimationSpeed", () => {
    it.each([100, 200])(
      "should get the state move animation speed %s",
      speed => {
        state.moveAnimationSpeed = speed;
        expect(component.vm.selectedMoveAnimationSpeed).toBe(speed);
      }
    );

    it.each([100, 200])("should set the state move animation speed", speed => {
      component.vm.selectedMoveAnimationSpeed = speed;

      expect(mutations.setMoveAnimationSpeed).toBeCalledWith(state, speed);
    });
  });
});
