import { shallowMount } from "@vue/test-utils";
import _ from "lodash";

jest.useFakeTimers();

import TrainerViewModel from "@/components/train/TrainerViewModel.ts";
import { TrainingOptions } from "@/components/train/TrainingModeSelectorViewModel";
import { Move } from "@/store/move";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Side } from "@/store/side";

jest.mock("@/store/repertoirePosition");

describe("TrainerViewModel", () => {
  const mountComponent = (
    options = new TrainingOptions([], [], false, false, 0, 0)
  ) =>
    shallowMount(TrainerViewModel, {
      render: jest.fn(),
      propsData: {
        options
      }
    });

  const makeVariation = (sans: string[]) =>
    _.map(
      sans,
      san => new Move(san, new RepertoirePosition("", "", Side.White))
    );

  describe("activeVariation", () => {
    it("should be training option move list at the current index", () => {
      const variation = makeVariation(["e4"]);
      variation[0].position.parents = [variation[0].position]; // fake previous move
      const component = mountComponent(
        new TrainingOptions([], [variation], false, false, 0, 0)
      );
      component.vm.variationIndex = 0;

      const actual = component.vm.activeVariation;

      expect(actual).toBe(variation);
    });
  });

  describe("previewing", () => {
    it("should be true if previewing is enabled and there are new moves on my turn in the active variation", () => {
      const variation = makeVariation(["e4"]);
      variation[0].position.parents = [variation[0].position]; // fake previous move
      variation[0].position.IncludeForTrainingMode = () => true;
      variation[0].position.myTurn = true;
      const options = new TrainingOptions([], [variation], true, false, 0, 0);
      const component = mountComponent(options);
      component.vm.variationIndex = 0;
      component.vm.previewedVariations = [];

      const actual = component.vm.previewing;

      expect(actual).toBeTruthy();
    });

    it("should be false if not previewing", () => {
      const variation = makeVariation(["e4"]);
      variation[0].position.parents = [variation[0].position]; // fake previous move
      variation[0].position.IncludeForTrainingMode = () => true;
      variation[0].position.myTurn = true;
      const options = new TrainingOptions([], [variation], false, false, 0, 0);
      const component = mountComponent(options);

      const actual = component.vm.previewing;

      expect(actual).toBeFalsy();
    });

    it("should be false if previewing and already previewed the variation", () => {
      const variation = makeVariation(["e4"]);
      variation[0].position.parents = [variation[0].position]; // fake previous move
      variation[0].position.IncludeForTrainingMode = () => true;
      variation[0].position.myTurn = true;
      const options = new TrainingOptions([], [variation], true, false, 0, 0);
      const component = mountComponent(options);
      component.vm.variationIndex = 0;
      component.vm.previewedVariations = [0];

      const actual = component.vm.previewing;

      expect(actual).toBeFalsy();
    });
  });

  describe("previewPositionFen", () => {
    it("should be the fen of the position to preview", () => {
      const fen = "some fen";
      const variation = makeVariation(["e4"]);
      variation[0].position.parents = [variation[0].position]; // fake previous move
      variation[0].position.fen = fen;
      const options = new TrainingOptions([], [variation], true, false, 0, 0);
      const component = mountComponent(options);
      component.vm.variationIndex = 0;
      component.vm.previewIndex = 0;

      const actual = component.vm.previewPositionFen;

      expect(actual).toEqual(fen);
    });
  });

  describe("variationProgress", () => {
    it("should format the index and variations length", () => {
      const index = 1;
      const variationsLength = 5;
      const variation = makeVariation(["e4"]);
      variation[0].position.parents = [variation[0].position]; // fake previous move
      variation[0].position.IncludeForTrainingMode = () => true;
      variation[0].position.myTurn = true;
      const component = mountComponent(
        new TrainingOptions(
          [],
          _.times(variationsLength, () => variation),
          false,
          false,
          0,
          0
        )
      );
      component.vm.variationIndex = index;

      const actual = component.vm.variationProgress;

      expect(actual).toEqual(`${index} / ${variationsLength}`);
    });
  });
});
