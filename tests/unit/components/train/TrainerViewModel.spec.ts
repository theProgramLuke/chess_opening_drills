import { shallowMount, createLocalVue } from "@vue/test-utils";
import _ from "lodash";
import Vuex from "vuex";

import TrainerViewModel from "@/components/train/TrainerViewModel.ts";
import { TrainingOptions } from "@/components/train/TrainingModeSelectorViewModel";
import { Move } from "@/store/move";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Side } from "@/store/side";

jest.mock("@/store/repertoirePosition");
jest.mock("@/store/TrainingEvent");
jest.useFakeTimers();

const mutations = {
  addTrainingEvent: jest.fn()
};

const localVue = createLocalVue();
localVue.use(Vuex);
const store = new Vuex.Store({ mutations });

describe("TrainerViewModel", () => {
  const mountComponent = (
    options = new TrainingOptions([], [], false, false, 0, 0)
  ) => {
    const component = shallowMount(TrainerViewModel, {
      render: jest.fn(),
      propsData: {
        options
      },
      localVue,
      store
    });
    component.vm.reloadPosition = jest.fn();
    return component;
  };

  beforeEach(() => {
    _.forEach(mutations, mutation => mutation.mockReset());
  });

  const makeVariation = (sans: string[], side = Side.White) =>
    _.map(sans, san => new Move(san, new RepertoirePosition("", "", side)));

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

  describe("activePosition", () => {
    it("should be the active variation move at the ply count", () => {
      const variation = makeVariation(["e4", "e5"]);
      variation[0].position.parents = [variation[0].position]; // fake previous move
      const component = mountComponent(
        new TrainingOptions([], [variation], false, false, 0, 0)
      );
      component.vm.variationIndex = 0;
      component.vm.plyCount = 2;

      const actual = component.vm.activePosition;

      expect(actual).toBe(variation[1].position);
    });
  });

  describe("expectedMove", () => {
    it("should be the next move in the active variation", () => {
      const variation = makeVariation(["e4", "e5"]);
      variation[0].position.parents = [variation[0].position]; // fake previous move
      const component = mountComponent(
        new TrainingOptions([], [variation], false, false, 0, 0)
      );
      component.vm.variationIndex = 0;
      component.vm.plyCount = 0;

      const actual = component.vm.expectedMove;

      expect(actual).toBe(variation[0]);
    });

    it("should be the next move in the active variation offset by 1 for black", () => {
      const variation = makeVariation(["e4", "e5"], Side.Black);
      variation[0].position.parents = [variation[0].position]; // fake previous move
      const component = mountComponent(
        new TrainingOptions([], [variation], false, false, 0, 0)
      );
      component.vm.variationIndex = 0;
      component.vm.plyCount = 0;

      const actual = component.vm.expectedMove;

      expect(actual).toBe(variation[1]);
    });
  });

  describe("boardOrientation", () => {
    it.each([Side.White, Side.Black])(
      "should be the orientation %s of the active position",
      side => {
        const variation = makeVariation(["e4"], side);
        variation[0].position.parents = [variation[0].position]; // fake previous move
        const component = mountComponent(
          new TrainingOptions([], [variation], false, false, 0, 0)
        );
        component.vm.variationIndex = 0;
        component.vm.plyCount = 0;

        const actual = component.vm.boardOrientation;

        expect(actual).toBe(side);
      }
    );
  });

  describe("complete", () => {
    it("should be true if all the variations have been trained", () => {
      const variation = makeVariation(["e4"]);
      variation[0].position.parents = [variation[0].position]; // fake previous move
      const component = mountComponent(
        new TrainingOptions([], [variation], false, false, 0, 0)
      );
      component.vm.variationIndex = 1;

      const actual = component.vm.complete;

      expect(actual).toBeTruthy();
    });

    it("should be false if not all the variations have been trained", () => {
      const variation = makeVariation(["e4"]);
      variation[0].position.parents = [variation[0].position]; // fake previous move
      const component = mountComponent(
        new TrainingOptions([], [variation], false, false, 0, 0)
      );
      component.vm.variationIndex = 0;

      const actual = component.vm.complete;

      expect(actual).toBeFalsy();
    });
  });

  describe("completionPercent", () => {
    it("should be the variation index / the count of variations", () => {
      const variation = makeVariation(["e4"]);
      variation[0].position.parents = [variation[0].position]; // fake previous move
      const component = mountComponent(
        new TrainingOptions(
          [],
          [variation, variation, variation],
          false,
          false,
          0,
          0
        )
      );
      component.vm.variationIndex = 1;

      const actual = component.vm.completionPercent;

      expect(actual).toEqual((100 * 1) / 3);
    });
  });

  describe("previewPlaybackDelay", () => {
    it("should be the playback speed as seconds", () => {
      const playbackSpeed = 10;
      const component = mountComponent(
        new TrainingOptions([], [], false, false, playbackSpeed, 0)
      );

      const actual = component.vm.previewPlaybackDelay;

      expect(actual).toEqual(1000 * playbackSpeed);
    });
  });

  describe("showMistakeArrow", () => {
    it.each([3, 4])(
      "should be true if the max attempts is met or exceeded with %s",
      attempts => {
        const component = mountComponent();
        component.vm.attempts = attempts;

        const actual = component.vm.showMistakeArrow;

        expect(actual).toBeTruthy();
      }
    );

    it.each([0, 1, 2])(
      "should be false if the attempts are less than the max attempts",
      attempts => {
        const component = mountComponent();
        component.vm.attempts = attempts;

        const actual = component.vm.showMistakeArrow;

        expect(actual).toBeFalsy();
      }
    );
  });

  describe("mistakeArrow", () => {
    it("should be an empty list if not showing te mistake arrow", () => {
      const component = mountComponent();
      component.vm.attempts = 0;

      const actual = component.vm.mistakeArrow;

      expect(actual).toEqual([]);
    });

    it("should be a red chessground brush for the next move", () => {
      const move = { orig: "e2", dest: "e4", brush: "red" };
      const variation = makeVariation(["e4"]);
      variation[0].position.parents = [variation[0].position]; // fake previous move
      variation[0].position.fen =
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      const component = mountComponent(
        new TrainingOptions([], [variation], false, false, 0, 0)
      );
      component.vm.attempts = 3;

      const actual = component.vm.mistakeArrow;

      expect(actual).toEqual([move]);
    });
  });

  describe("onBoardMove", () => {
    let component = mountComponent();
    let variation = makeVariation(["e4"]);

    beforeEach(() => {
      variation = makeVariation(["e4"]);
      variation[0].position.parents = [variation[0].position]; // fake previous move
      component = mountComponent(
        new TrainingOptions([], [variation], false, false, 0, 0)
      );
    });

    describe("incorrect move", () => {
      beforeEach(() => {
        component.vm.moveIsCorrect = jest.fn(() => false);
      });

      it("should increment the attempts count", () => {
        component.vm.onBoardMove({ fen: "fen" });
        const actualAttempts = component.vm.attempts;

        expect(actualAttempts).toEqual(1);
      });

      it("should not advance the training position", () => {
        component.vm.nextTrainingPosition = jest.fn();

        component.vm.onBoardMove({ fen: "fen" });

        expect(component.vm.nextTrainingPosition).not.toBeCalled();
      });

      it("should mark that there was a mistake", () => {
        component.vm.mistakeInVariation = false;

        component.vm.onBoardMove({ fen: "fen" });

        expect(component.vm.mistakeInVariation).toBeTruthy();
      });

      it("should reload the position to train", () => {
        component.vm.reloadPosition = jest.fn();

        component.vm.onBoardMove({ fen: "fen" });

        expect(component.vm.reloadPosition).toBeCalled();
      });
    });

    describe("correct move", () => {
      beforeEach(() => {
        component.vm.moveIsCorrect = jest.fn(() => true);
      });

      it("should not increment the attempts count", () => {
        component.vm.onBoardMove({ fen: "fen" });
        const actualAttempts = component.vm.attempts;

        expect(actualAttempts).toEqual(0);
      });

      it("should add a training event", () => {
        const elapsed = 10;
        component.vm.getElapsedSeconds = jest.fn(() => elapsed);

        component.vm.onBoardMove({ fen: "fen" });

        expect(mutations.addTrainingEvent).toBeCalledWith(expect.anything(), {
          event: {
            attempts: 1,
            responseTimeSeconds: elapsed,
            timestamp: 9001
          },
          position: variation[0].position
        });
      });

      it("should advance the training position", () => {
        component.vm.nextTrainingPosition = jest.fn();

        component.vm.onBoardMove({ fen: "fen" });

        expect(component.vm.nextTrainingPosition).toBeCalled();
      });
    });
  });

  describe("moveIsCorrect", () => {
    it("should be true if the fen matches the expected move", () => {
      const fen = "some fen";
      const variation = makeVariation(["e4", "e5"]);
      variation[0].position.parents = [variation[0].position]; // fake previous move
      variation[0].position.fen = fen;
      const component = mountComponent(
        new TrainingOptions([], [variation], false, false, 0, 0)
      );
      component.vm.variationIndex = 0;
      component.vm.plyCount = 0;

      const correct = component.vm.moveIsCorrect(fen);

      expect(correct).toBeTruthy();
    });

    it("should be false if the fen matches the expected move", () => {
      const variation = makeVariation(["e4", "e5"]);
      variation[0].position.parents = [variation[0].position]; // fake previous move
      variation[0].position.fen = "some fen";
      const component = mountComponent(
        new TrainingOptions([], [variation], false, false, 0, 0)
      );
      component.vm.variationIndex = 0;
      component.vm.plyCount = 0;

      const correct = component.vm.moveIsCorrect("other fen");

      expect(correct).toBeFalsy();
    });
  });

  describe("nextTrainingPosition", () => {
    let component = mountComponent();
    let variation = makeVariation([]);

    beforeEach(() => {
      variation = makeVariation(["e4", "e5", "Nf3", "Nf6", "Bc5"]);
      variation[0].position.parents = [variation[0].position]; // fake previous move
      variation[0].position.myTurn = true;
      variation[1].position.myTurn = false;
      variation[2].position.myTurn = true;
      variation[3].position.myTurn = false;
      variation[4].position.myTurn = true;
      component = mountComponent(
        new TrainingOptions(
          [],
          [variation, _.cloneDeep(variation)],
          false,
          false,
          0,
          0
        )
      );
      component.vm.nextVariation = jest.fn();
    });

    it("should reset the attempts", () => {
      component.vm.attempts = 4;

      component.vm.nextTrainingPosition();

      expect(component.vm.attempts).toEqual(0);
    });

    it("should advance the ply count to the next position index for my turn", () => {
      component.vm.plyCount = 1;

      component.vm.nextTrainingPosition();

      expect(component.vm.plyCount).toEqual(3);
    });

    it("should go to the next variation when the active one is completed", () => {
      component.vm.plyCount = variation.length - 1;

      component.vm.nextTrainingPosition();

      expect(component.vm.nextVariation).toBeCalled();
    });

    it("should mark the current time as the start of training", () => {
      const before = _.now();

      component.vm.nextTrainingPosition();
      const after = _.now();

      expect(component.vm.startTime).toBeGreaterThanOrEqual(before);
      expect(component.vm.startTime).toBeLessThanOrEqual(after);
    });
  });
});
