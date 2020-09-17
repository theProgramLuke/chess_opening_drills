import { shallowMount } from "@vue/test-utils";
import _ from "lodash";

import TrainingModeSelectorViewModel, {
  TrainingOptions
} from "@/components/train/TrainingModeSelectorViewModel.ts";
import { Repertoire } from "@/store/repertoire";
import {
  GetTrainingMoveLists,
  GetTrainingPositions,
  RepertoireTag
} from "@/store/repertoireTag";
import { Side } from "@/store/side";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { TrainingMode } from "@/store/trainingMode";
import { Move } from "@/store/move";

jest.mock("@/store/repertoire");
jest.mock("@/store/repertoireTag");
jest.mock("@/store/repertoirePosition");

describe("TrainingModeSelectorViewModel", () => {
  const mockRepertoireTag = (name: number) =>
    new RepertoireTag(
      Side.White,
      name.toString(),
      new RepertoirePosition("", "", Side.White),
      "",
      []
    );

  const mountComponent = (
    whiteRepertoire = new Repertoire([], []),
    blackRepertoire = new Repertoire([], [])
  ) =>
    shallowMount(TrainingModeSelectorViewModel, {
      render: jest.fn(),
      propsData: {
        whiteRepertoire,
        blackRepertoire
      }
    });

  describe("combinedTags", () => {
    it("should concatenate the tags from the white and black repertoires", () => {
      const expectedTags = _.times(10, mockRepertoireTag);
      const component = mountComponent(
        new Repertoire([], _.slice(expectedTags, 0, 3)),
        new Repertoire([], _.slice(expectedTags, 3))
      );

      const actual = component.vm.combinedTags;

      expect(actual).toEqual(expectedTags);
    });
  });

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

  describe("trainingPositions", () => {
    it("should get the positions to be trained", () => {
      const component = mountComponent();
      const modes = [TrainingMode.Difficult, TrainingMode.Scheduled];
      const topics = _.times(10, mockRepertoireTag);
      const positions = [new RepertoirePosition("", "", Side.White)];
      component.vm.selectedModes = modes;
      component.vm.selectedTopics = topics;
      (GetTrainingPositions as jest.Mock).mockReturnValueOnce(positions);

      const actual = component.vm.trainingPositions;

      expect(GetTrainingPositions).toBeCalledWith(modes, topics, 1.6);
      expect(actual).toEqual(positions);
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
      (GetTrainingPositions as jest.Mock).mockReturnValueOnce(
        _.times(5, () => new RepertoirePosition("", "", Side.White))
      );

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
      const expectedTags = _.times(5, mockRepertoireTag);
      const expectedVariations = [
        [
          new Move("san0", new RepertoirePosition("", "", Side.White)),
          new Move("san1", new RepertoirePosition("", "", Side.White))
        ]
      ];
      component.vm.selectedTopics = expectedTags;
      (GetTrainingMoveLists as jest.Mock).mockReturnValueOnce(
        expectedVariations
      );

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
