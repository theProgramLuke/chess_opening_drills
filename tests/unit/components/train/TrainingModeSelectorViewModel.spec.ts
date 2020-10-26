import { shallowMount } from "@vue/test-utils";
import _ from "lodash";

import TrainingModeSelectorViewModel from "@/components/train/TrainingModeSelectorViewModel.ts";
import {
  TrainingOptions,
  TrainingVariation
} from "@/components/train/TrainingOptions";
import { Repertoire, SavedRepertoire } from "@/store/repertoire/Repertoire";
import { TagTree } from "@/store/repertoire/TagTree";
import { TrainingMode } from "@/store/trainingMode";
import { Side } from "@/store/side";
import { Variation } from "@/store/repertoire/PositionCollection";

jest.mock("@/store/repertoire/Repertoire");
jest.mock("@/store/repertoire/TagTree");

describe("TrainingModeSelectorViewModel", () => {
  const emptySavedRepertoire: SavedRepertoire = {
    positions: {},
    training: {},
    tags: { name: "", fen: "", id: "", children: [] },
    sideToTrain: Side.White
  };

  const mountComponent = (
    whiteRepertoire = new Repertoire(emptySavedRepertoire),
    blackRepertoire = new Repertoire(emptySavedRepertoire)
  ) =>
    shallowMount(TrainingModeSelectorViewModel, {
      render: jest.fn(),
      propsData: {
        whiteRepertoire,
        blackRepertoire
      }
    });

  function mockTag(name: number): TagTree {
    const tag = new TagTree("", "", "", []);
    tag.name = `${name}`;
    return tag;
  }

  function makeVariation(sans: string[]): Variation {
    return _.map(sans, san => {
      return { san, resultingFen: "", sourceFen: "" };
    });
  }

  describe("showPreviewInput", () => {
    it("should be true if the new training mode is selected", () => {
      const component = mountComponent();
      component.vm.selectedModes = [TrainingMode.New];

      const actual = component.vm.showPreviewInput;

      expect(actual).toBeTruthy();
    });

    it("should be false if the new training mode is not selected", () => {
      const component = mountComponent();
      component.vm.selectedModes = [];

      const actual = component.vm.showPreviewInput;

      expect(actual).toBeFalsy();
    });
  });

  describe("showDifficultyModeInput", () => {
    it("should be true if the difficult training mode is selected", () => {
      const component = mountComponent();
      component.vm.selectedModes = [TrainingMode.Difficult];

      const actual = component.vm.showDifficultyModeInput;

      expect(actual).toBeTruthy();
    });

    it("should be false if the difficult training mode is not selected", () => {
      const component = mountComponent();
      component.vm.selectedModes = [];

      const actual = component.vm.showDifficultyModeInput;

      expect(actual).toBeFalsy();
    });
  });

  describe("coercedPlaybackSpeed", () => {
    it.each([
      [0, 0.2],
      [50, 2.6],
      [100, 5]
    ])("should convert %s to %s", (input, expected) => {
      const component = mountComponent();
      component.vm.playbackSpeedSlideValue = input;

      const actual = component.vm.coercedPlaybackSpeed;

      expect(actual).toEqual(expected);
    });
  });

  describe("coercedDifficultyModeLimit", () => {
    it.each([
      [0, 1],
      [50, 3],
      [100, 5]
    ])("should convert %s to %s", (input, expected) => {
      const component = mountComponent();
      component.vm.difficultyModeLimit = input;

      const actual = component.vm.coercedDifficultyModeLimit;

      expect(actual).toEqual(expected);
    });
  });

  describe("trainingVariations", () => {
    it("should get the positions to be trained", () => {
      const component = mountComponent();
      const whiteVariations: Variation[] = [makeVariation(["e4", "e5"])];
      const blackVariations: Variation[] = [makeVariation(["e4", "e6"])];
      const expected: TrainingVariation[] = [
        {
          repertoire: component.vm.whiteRepertoire,
          variation: whiteVariations[0]
        },
        {
          repertoire: component.vm.blackRepertoire,
          variation: blackVariations[0]
        }
      ];
      const modes = [TrainingMode.Difficult, TrainingMode.Scheduled];
      const topics = _.times(10, mockTag);
      component.vm.selectedModes = modes;
      component.vm.selectedTopics = topics;
      (component.vm.whiteRepertoire
        .getTrainingVariations as jest.Mock).mockReturnValue(whiteVariations);
      (component.vm.blackRepertoire
        .getTrainingVariations as jest.Mock).mockReturnValue(blackVariations);

      const actual = component.vm.trainingVariations;

      expect(actual).toEqual(expected);
      expect(component.vm.whiteRepertoire.getTrainingVariations).toBeCalledWith(
        topics,
        modes
        // TODO 1.6
      );
      expect(component.vm.whiteRepertoire.getTrainingVariations).toBeCalledWith(
        topics,
        modes
        // TODO 1.6
      );
    });
  });

  describe("playbackSpeedLabel", () => {
    it("should format the playback speed", () => {
      const component = mountComponent();
      component.vm.playbackSpeedSlideValue = 50;

      const actual = component.vm.playbackSpeedLabel;

      expect(actual).toEqual("Playback speed (2.6 seconds per move)");
    });
  });

  describe("startTrainingLabel", () => {
    it("should format the playback speed", () => {
      const component = mountComponent();
      (component.vm.whiteRepertoire
        .getTrainingVariations as jest.Mock).mockReturnValue([
        makeVariation(["e4", "e5", "Nc3", "Nf6", "f4"])
      ]);

      const actual = component.vm.startTrainingLabel;

      expect(actual).toEqual("Start Training (5 positions)");
    });
  });

  describe("difficultyModeLimitLabel", () => {
    it("should format the difficulty limit", () => {
      const component = mountComponent();
      component.vm.difficultyModeLimit = 50;

      const actual = component.vm.difficultyModeLimitLabel;

      expect(actual).toEqual("Difficulty Limit (3.00)");
    });
  });

  describe("onStartTraining", () => {
    it("should emit onStartTraining with training options", () => {
      const component = mountComponent();
      const expectedTags = _.times(5, mockTag);
      const variations = [makeVariation(["d4", "Nf6"])];
      const expectedVariations: TrainingVariation[] = [
        {
          repertoire: component.vm.whiteRepertoire,
          variation: variations[0]
        }
      ];
      component.vm.selectedTopics = expectedTags;
      (component.vm.whiteRepertoire
        .getTrainingVariations as jest.Mock).mockReturnValue(variations);

      component.vm.onStartTraining();

      expect(component.emitted()).toEqual({
        onStartTraining: [
          [
            new TrainingOptions(
              expectedTags,
              expectedVariations,
              true,
              true,
              0.6799999999999999,
              1.6
            )
          ]
        ]
      });
    });
  });
});
