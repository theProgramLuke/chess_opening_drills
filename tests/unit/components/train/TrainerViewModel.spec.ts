import { shallowMount, createLocalVue, Wrapper } from "@vue/test-utils";
import _ from "lodash";
import Vuex from "vuex";
import { DrawShape } from "chessground/draw";

import TrainerViewModel from "@/components/train/TrainerViewModel.ts";
import {
  TrainingOptions,
  TrainingVariation,
} from "@/components/train/TrainingOptions";
import { Side } from "@/store/side";
import { Repertoire } from "@/store/repertoire/Repertoire";
import { AddTrainingEventPayload } from "@/store/MutationPayloads";
import { TrainingCollection } from "@/store/repertoire/TrainingCollection";
import { RepetitionTraining } from "@/store/repertoire/RepetitionTraining";
import { TrainingMode } from "@/store/trainingMode";
import { TagTree } from "@/store/repertoire/TagTree";

jest.mock("@/store/repertoire/Repertoire");
jest.mock("@/store/repertoire/TrainingCollection");
jest.mock("@/store/repertoire/RepetitionTraining");
jest.useFakeTimers();

const mutations = {
  addTrainingEvent: jest.fn(),
};

const localVue = createLocalVue();
localVue.use(Vuex);
const store = new Vuex.Store({ mutations });

describe("TrainerViewModel", () => {
  const emptyOptions = new TrainingOptions([], [], false, false, 999, 999);
  const emptySavedRepertoire = {
    name: "",
    positions: {},
    tags: new TagTree("", "", []),
    training: {},
    sideToTrain: Side.White,
  };
  const loadPosition = jest.fn();

  let emptyRepertoire: Repertoire;
  let training: RepetitionTraining;

  function mountComponent(
    options: TrainingOptions = emptyOptions
  ): Wrapper<TrainerViewModel> {
    const component = shallowMount(TrainerViewModel, {
      render: jest.fn(),
      propsData: {
        options,
      },
      localVue,
      store,
    });
    loadPosition.mockReset();
    component.vm.$refs["board"] = ({ loadPosition } as unknown) as Vue;
    return component;
  }

  function makeTrainingVariation(
    sans: string[],
    repertoire: Repertoire = emptyRepertoire
  ): TrainingVariation {
    const variation = _.map(sans, san => {
      return { san, resultingFen: "", sourceFen: "" };
    });

    return { repertoire, variation };
  }

  beforeEach(() => {
    _.forEach(mutations, mutation => mutation.mockReset());

    emptyRepertoire = new Repertoire(emptySavedRepertoire);
    emptyRepertoire.sideToTrain = Side.White;
    training = new RepetitionTraining();
    emptyRepertoire.training = new TrainingCollection();
    (emptyRepertoire.training.getTrainingForMove as jest.Mock).mockReturnValue(
      training
    );
  });

  describe("activeVariation", () => {
    it("should be the training option variation at the current index", () => {
      const trainingVariation = makeTrainingVariation(["e4"]);
      const options = new TrainingOptions(
        [],
        [trainingVariation],
        false,
        false,
        0,
        0
      );
      const component = mountComponent(options);
      component.vm.variationIndex = 0;

      const actual = component.vm.activeVariation;

      expect(actual).toBe(trainingVariation);
    });
  });

  describe("activeVariationPositions", () => {
    it("should be the be an empty array if the active variation is undefined", () => {
      const component = mountComponent();
      jest
        .spyOn(component.vm, "activeVariation", "get")
        .mockReturnValue(undefined);

      const actual = component.vm.activeVariationPositions;

      expect(actual).toEqual([]);
    });
  });

  describe("previewing", () => {
    it("should be true if previewing is enabled and there are new moves on my turn in the active variation", () => {
      const trainingVariation = makeTrainingVariation(["e4", "e5"]);
      const options = new TrainingOptions(
        [],
        [trainingVariation],
        true,
        false,
        0,
        0
      );
      (training.includeForTrainingMode as jest.Mock).mockImplementation(
        (mode: TrainingMode) => mode === TrainingMode.New
      );
      const component = mountComponent(options);
      component.vm.variationIndex = 0;
      component.vm.previewedVariations = [];

      const actual = component.vm.previewing;

      expect(actual).toBeTruthy();
    });

    it("should be false if previewing is enabled and there are no stored trained moves in the active variation", () => {
      const trainingVariation = makeTrainingVariation(["e4", "e5"]);
      const options = new TrainingOptions(
        [],
        [trainingVariation],
        true,
        false,
        0,
        0
      );
      (trainingVariation.repertoire.training
        .getTrainingForMove as jest.Mock).mockReturnValue(undefined);
      const component = mountComponent(options);
      component.vm.variationIndex = 0;
      component.vm.previewedVariations = [];

      const actual = component.vm.previewing;

      expect(actual).toBeFalsy();
    });

    it("should be false if not previewing", () => {
      const variation = makeTrainingVariation(["e4"]);
      const options = new TrainingOptions([], [variation], false, false, 0, 0);
      const component = mountComponent(options);

      const actual = component.vm.previewing;

      expect(actual).toBeFalsy();
    });

    it("should be false if previewing and already previewed the variation", () => {
      const options = new TrainingOptions(
        [],
        [makeTrainingVariation(["e4"])],
        true,
        false,
        0,
        0
      );
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
      const options = new TrainingOptions(
        [],
        [makeTrainingVariation(["e4"])],
        true,
        false,
        0,
        0
      );
      options.variations[0].variation[0].sourceFen = fen;
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
      const component = mountComponent(
        new TrainingOptions(
          [],
          _.times(variationsLength, () => makeTrainingVariation(["e4", "e5"])),
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
      const trainingVariation = makeTrainingVariation(["e4", "e5"]);
      const component = mountComponent(
        new TrainingOptions([], [trainingVariation], false, false, 0, 0)
      );
      component.vm.variationIndex = 0;
      component.vm.plyCount = 2;

      const actual = component.vm.activePosition;

      expect(actual).toBe(trainingVariation.variation[1].sourceFen);
    });
  });

  describe("expectedMove", () => {
    it("should be the next move in the active variation", () => {
      const trainingVariation = makeTrainingVariation(["e4", "e5"]);
      const component = mountComponent(
        new TrainingOptions([], [trainingVariation], false, false, 0, 0)
      );
      component.vm.variationIndex = 0;
      component.vm.plyCount = 0;

      const actual = component.vm.expectedMove;

      expect(actual).toBe(trainingVariation.variation[0]);
    });

    it("should be undefined if the active variation is not defined", () => {
      const component = mountComponent();
      jest
        .spyOn(component.vm, "activeVariation", "get")
        .mockReturnValue(undefined);

      const actual = component.vm.expectedMove;

      expect(actual).toBeUndefined();
    });
  });

  describe("boardOrientation", () => {
    it.each([Side.White, Side.Black])(
      "should be the orientation %s of the active variation repertoire side to train",
      side => {
        emptyRepertoire.sideToTrain = side;
        const variation = makeTrainingVariation(["e4"], emptyRepertoire);
        const component = mountComponent(
          new TrainingOptions([], [variation], false, false, 0, 0)
        );
        component.vm.variationIndex = 0;
        component.vm.plyCount = 0;

        const actual = component.vm.boardOrientation;

        expect(actual).toBe(side);
      }
    );

    it("should be white if the active variation is not defined", () => {
      const component = mountComponent();
      jest
        .spyOn(component.vm, "activeVariation", "get")
        .mockReturnValue(undefined);

      const actual = component.vm.boardOrientation;

      expect(actual).toEqual(Side.White);
    });
  });

  describe("complete", () => {
    it("should be true if all the variations have been trained", () => {
      const variation = makeTrainingVariation(["e4"]);
      const component = mountComponent(
        new TrainingOptions([], [variation], false, false, 0, 0)
      );
      component.vm.variationIndex = 1;

      const actual = component.vm.complete;

      expect(actual).toBeTruthy();
    });

    it("should be false if not all the variations have been trained", () => {
      const variation = makeTrainingVariation(["e4"]);
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
      const variation = makeTrainingVariation(["e4"]);
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
        component.vm.attempts = _.times(attempts, () => "");

        const actual = component.vm.showMistakeArrow;

        expect(actual).toBeTruthy();
      }
    );

    it.each([0, 1, 2])(
      "should be false if the attempts are less than the max attempts",
      attempts => {
        const component = mountComponent();
        component.vm.attempts = _.times(attempts, () => "");

        const actual = component.vm.showMistakeArrow;

        expect(actual).toBeFalsy();
      }
    );
  });

  describe("mistakeArrow", () => {
    it("should be an empty list if not showing the mistake arrow", () => {
      const component = mountComponent();
      component.vm.attempts = [];

      const actual = component.vm.mistakeArrow;

      expect(actual).toEqual([]);
    });

    it("should be a red brush for the next move", () => {
      const expected: DrawShape[] = [{ orig: "e2", dest: "e4", brush: "red" }];
      const trainingVariation = makeTrainingVariation(["e4"]);
      trainingVariation.variation[0].sourceFen =
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -";
      const component = mountComponent(
        new TrainingOptions([], [trainingVariation], false, false, 0, 0)
      );
      component.vm.attempts = ["", "", ""];

      const actual = component.vm.mistakeArrow;

      expect(actual).toEqual(expected);
    });
  });

  describe("onBoardMove", () => {
    let component = mountComponent();
    let trainingVariation = makeTrainingVariation(["e4"]);

    beforeEach(() => {
      trainingVariation = makeTrainingVariation(["e4"]);
      component = mountComponent(
        new TrainingOptions([], [trainingVariation], false, false, 0, 0)
      );
    });

    describe("incorrect move", () => {
      beforeEach(() => {
        component.vm.moveIsCorrect = jest.fn(() => false);
      });

      it("should increment the attempts count", () => {
        component.vm.onBoardMove({ fen: "fen" });
        const actualAttempts = component.vm.attempts;

        expect(actualAttempts.length).toEqual(1);
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

        expect(actualAttempts).toEqual([]);
      });

      it("should add a training event", () => {
        const elapsed = 10;
        component.vm.getElapsedSeconds = jest.fn(() => elapsed);
        const san = "san";
        const expected: AddTrainingEventPayload = {
          event: {
            attemptedMoves: [san],
            elapsedMilliseconds: elapsed,
          },
          fen: trainingVariation.variation[0].sourceFen,
          san: trainingVariation.variation[0].san,
          repertoire: trainingVariation.repertoire,
        };

        component.vm.onBoardMove({ fen: "fen", history: ["not the san", san] });

        expect(mutations.addTrainingEvent).toBeCalledWith(
          expect.anything(),
          expected
        );
      });

      it("should track the attempted moves for the training event", () => {
        const elapsed = 10;
        component.vm.getElapsedSeconds = jest.fn(() => elapsed);
        const expected: AddTrainingEventPayload = {
          event: {
            attemptedMoves: ["e3", "d4"],
            elapsedMilliseconds: elapsed,
          },
          fen: trainingVariation.variation[0].sourceFen,
          san: trainingVariation.variation[0].san,
          repertoire: trainingVariation.repertoire,
        };
        component.vm.attempts = expected.event.attemptedMoves;

        component.vm.onBoardMove({ fen: "fen" });

        expect(mutations.addTrainingEvent).toBeCalledWith(
          expect.anything(),
          expected
        );
      });

      it("should advance the training position", () => {
        component.vm.nextTrainingPosition = jest.fn();

        component.vm.onBoardMove({ fen: "fen" });

        expect(component.vm.nextTrainingPosition).toBeCalled();
      });
    });
  });

  describe("moveIsCorrect", () => {
    it("should be true if the normalized fen matches the expected resulting fen", () => {
      const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -";
      const trainingVariation = makeTrainingVariation(["e4", "e5"]);
      trainingVariation.variation[0].resultingFen = fen;
      const component = mountComponent(
        new TrainingOptions([], [trainingVariation], false, false, 0, 0)
      );
      component.vm.variationIndex = 0;
      component.vm.plyCount = 0;

      const actual = component.vm.moveIsCorrect(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      );

      expect(actual).toBeTruthy();
    });

    it("should be false if the fen matches the expected move", () => {
      const variation = makeTrainingVariation(["e4", "e5"]);
      const component = mountComponent(
        new TrainingOptions([], [variation], false, false, 0, 0)
      );
      component.vm.variationIndex = 0;
      component.vm.plyCount = 0;

      const actual = component.vm.moveIsCorrect("other fen");

      expect(actual).toBeFalsy();
    });

    it("should be false if the expected move is undefined", () => {
      const component = mountComponent();
      jest
        .spyOn(component.vm, "activeVariation", "get")
        .mockReturnValue(undefined);

      const actual = component.vm.moveIsCorrect("fen");

      expect(actual).toBeFalsy();
    });
  });

  describe("nextTrainingPosition", () => {
    let component = mountComponent();
    let trainingVariation = makeTrainingVariation([]);

    beforeEach(() => {
      trainingVariation = makeTrainingVariation([
        "e4",
        "e5",
        "Nf3",
        "Nf6",
        "Bc5",
      ]);
      trainingVariation.repertoire.sideToTrain = Side.White;
      trainingVariation.variation[0].sourceFen = " w ";
      trainingVariation.variation[1].sourceFen = " b ";
      trainingVariation.variation[2].sourceFen = " w ";
      trainingVariation.variation[3].sourceFen = " b ";
      trainingVariation.variation[4].sourceFen = " w ";
      component = mountComponent(
        new TrainingOptions(
          [],
          [trainingVariation, _.cloneDeep(trainingVariation)],
          false,
          false,
          0,
          0
        )
      );
      component.vm.nextVariation = jest.fn();
    });

    it("should reset the attempts", () => {
      component.vm.attempts = ["", "", "", ""];

      component.vm.nextTrainingPosition();

      expect(component.vm.attempts).toEqual([]);
    });

    it("should advance the ply count to the next position index for my turn", () => {
      component.vm.plyCount = 1;

      component.vm.nextTrainingPosition();

      expect(component.vm.plyCount).toEqual(2);
    });

    it("should go to the next variation when the active one is completed", () => {
      component.vm.plyCount = trainingVariation.variation.length - 1;

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

  describe("advancePreview", () => {
    const delay = 10;
    let trainingVariation: TrainingVariation;

    beforeEach(() => {
      trainingVariation = makeTrainingVariation(["e4", "e5", "Nf3"]);

      jest.clearAllTimers();
    });

    it("should advance to the next position after a delay", () => {
      const component = mountComponent(
        new TrainingOptions([], [trainingVariation], false, false, delay, 0)
      );
      const nextAdvance = jest.fn();
      component.vm.advancePreview();
      component.vm.advancePreview = nextAdvance;

      jest.advanceTimersByTime(delay * 1000);

      expect(nextAdvance).toBeCalled();
    });

    it("should not advance again before the delay finishes", () => {
      const component = mountComponent(
        new TrainingOptions([], [trainingVariation], false, false, delay, 0)
      );
      const nextAdvance = jest.fn();
      component.vm.advancePreview();
      component.vm.advancePreview = nextAdvance;

      jest.advanceTimersByTime(delay * 1000 - 1);

      expect(nextAdvance).not.toBeCalled();
    });

    it("should be called after a delay on mount if previewing", () => {
      (training.includeForTrainingMode as jest.Mock).mockImplementation(
        (mode: TrainingMode) => mode === TrainingMode.New
      );
      const component = mountComponent(
        new TrainingOptions([], [trainingVariation], true, false, delay, 0)
      );

      jest.advanceTimersByTime(delay * 2 * 1000);
      const index = component.vm.previewIndex;

      expect(index).toEqual(1);
    });

    it("should not be called before a delay on mount if previewing", () => {
      (training.includeForTrainingMode as jest.Mock).mockImplementation(
        (mode: TrainingMode) => mode === TrainingMode.New
      );
      const component = mountComponent(
        new TrainingOptions([], [trainingVariation], true, false, delay, 0)
      );

      jest.advanceTimersByTime(delay * 1000);
      const index = component.vm.previewIndex;

      expect(index).toEqual(0);
    });

    it("should mark the variation as previewed when all the positions have been shown", () => {
      const component = mountComponent(
        new TrainingOptions([], [trainingVariation], false, false, delay, 0)
      );
      component.vm.advancePreview();

      _.times(
        trainingVariation.variation.length + 1,
        jest.advanceTimersToNextTimer
      );

      expect(component.vm.previewedVariations).toEqual([0]);
    });

    it("should start the next preview at the first move", () => {
      const component = mountComponent(
        new TrainingOptions([], [trainingVariation], false, false, delay, 0)
      );
      component.vm.advancePreview();

      _.times(
        trainingVariation.variation.length + 1,
        jest.advanceTimersToNextTimer
      );

      expect(component.vm.previewIndex).toEqual(0);
    });

    it("should be called after previewing is set to true", () => {
      const component = mountComponent();
      component.vm.advancePreview = jest.fn();

      component.vm.onPreviewingChange(true);

      expect(component.vm.advancePreview).toBeCalled();
    });

    it("should not be called after previewing is set to false", () => {
      const component = mountComponent();
      component.vm.advancePreview = jest.fn();

      component.vm.onPreviewingChange(false);

      expect(component.vm.advancePreview).not.toBeCalled();
    });
  });

  describe("previewPositionLegalFen", () => {
    it("should be the legal fen for the position to preview", () => {
      const component = mountComponent();
      jest
        .spyOn(component.vm, "previewPositionFen", "get")
        .mockReturnValue("fen");

      const actual = component.vm.previewPositionLegalFen;

      expect(actual).toEqual("fen 0 1");
    });
  });

  describe("activePositionLegalFen", () => {
    it("should be the legal fen for the active position", () => {
      const component = mountComponent();
      jest.spyOn(component.vm, "activePosition", "get").mockReturnValue("fen");

      const actual = component.vm.activePositionLegalFen;

      expect(actual).toEqual("fen 0 1");
    });
  });

  describe("reloadPosition", () => {
    it("should reload the board position", () => {
      const component = mountComponent();

      component.vm.reloadPosition();

      expect(loadPosition).toBeCalled();
    });
  });
});
