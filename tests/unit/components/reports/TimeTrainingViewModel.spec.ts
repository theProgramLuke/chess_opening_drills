import { shallowMount, createLocalVue, Wrapper } from "@vue/test-utils";
import Vuex, { Store } from "vuex";
import _ from "lodash";
import humanizeDuration from "humanize-duration";

import TimeTrainingViewModel from "@/components/reports/TimeTrainingViewModel";
import { Repertoire, SavedRepertoire } from "@/store/repertoire/Repertoire";
import { Side } from "@/store/side";
import { TrainingCollection } from "@/store/repertoire/TrainingCollection";
import {
  RepetitionTraining,
  TrainingHistoryEntry,
} from "@/store/repertoire/RepetitionTraining";
import { TagTree } from "@/store/repertoire/TagTree";

jest.mock("@/store/repertoire/Repertoire");
jest.mock("@/store/repertoire/TrainingCollection");
jest.mock("@/store/repertoire/RepetitionTraining");
jest.mock("@/store/repertoire/TagTree");
jest.mock("humanize-duration");

describe("TimeTrainingViewModel", () => {
  const localVue = createLocalVue();
  localVue.use(Vuex);

  let store: Store<unknown>;
  let state: {
    whiteRepertoire: Repertoire;
    blackRepertoire: Repertoire;
    dark: boolean;
  };
  let component: Wrapper<TimeTrainingViewModel>;

  function mountComponent(): Wrapper<TimeTrainingViewModel> {
    return shallowMount(TimeTrainingViewModel, {
      localVue,
      store,
      render: jest.fn(),
    });
  }

  function makeHistoryEntry(elapsedMilliseconds: number): TrainingHistoryEntry {
    return {
      elapsedMilliseconds,
      easiness: 0,
      timestamp: 0,
      grade: 0,
      attemptedMoves: [],
    };
  }

  function makeTrainingWithHistory(
    elapsedMilliseconds: number[]
  ): RepetitionTraining {
    const training = new RepetitionTraining();
    const history = _.map(elapsedMilliseconds, elapsed =>
      makeHistoryEntry(elapsed)
    );
    Object.defineProperty(training, "history", {
      get() {
        return history;
      },
    });
    return training;
  }

  beforeEach(() => {
    const emptySavedRepertoire: SavedRepertoire = {
      positions: {},
      training: {},
      tags: { name: "", fen: "", id: "", children: [], isRootTag: false },
      sideToTrain: Side.White,
    };

    state = {
      whiteRepertoire: new Repertoire(emptySavedRepertoire),
      blackRepertoire: new Repertoire(emptySavedRepertoire),
      dark: true,
    };
    state.whiteRepertoire.training = new TrainingCollection();
    state.blackRepertoire.training = new TrainingCollection();

    store = new Vuex.Store({ state });

    component = mountComponent();
  });

  describe("showNoMoves", () => {
    it("should be true if the selected tags have no moves", () => {
      (state.whiteRepertoire.getTrainingForTags as jest.Mock).mockReturnValue(
        []
      );
      (state.blackRepertoire.getTrainingForTags as jest.Mock).mockReturnValue(
        []
      );

      const actual = component.vm.showNoMoves;

      expect(actual).toBeTruthy();
    });

    it("should be true if the selected tags have no trained moves", () => {
      (state.whiteRepertoire.getTrainingForTags as jest.Mock).mockReturnValue([
        makeTrainingWithHistory([]),
      ]);
      (state.blackRepertoire.getTrainingForTags as jest.Mock).mockReturnValue(
        []
      );
      const selectedTags: TagTree[] = [];
      component.vm.selectedTags = selectedTags;

      const actual = component.vm.showNoMoves;

      expect(actual).toBeTruthy();
      expect(state.whiteRepertoire.getTrainingForTags).toBeCalledWith(
        selectedTags
      );
      expect(state.blackRepertoire.getTrainingForTags).toBeCalledWith(
        selectedTags
      );
    });

    it("should be false if the selected tags have trained moves", () => {
      (state.whiteRepertoire.getTrainingForTags as jest.Mock).mockReturnValue([
        makeTrainingWithHistory([0]),
      ]);
      (state.blackRepertoire.getTrainingForTags as jest.Mock).mockReturnValue(
        []
      );
      const selectedTags: TagTree[] = [];
      component.vm.selectedTags = selectedTags;

      const actual = component.vm.showNoMoves;

      expect(actual).toBeFalsy();
      expect(state.whiteRepertoire.getTrainingForTags).toBeCalledWith(
        selectedTags
      );
      expect(state.blackRepertoire.getTrainingForTags).toBeCalledWith(
        selectedTags
      );
    });
  });

  describe("totalTrainingDuration", () => {
    it("should be the human readable cumulative training duration", () => {
      const whiteDurations: number[][] = [
        [1, 2, 3],
        [4, 5, 6],
      ];
      const blackDurations: number[][] = [[7, 8, 9, 10], []];
      (state.whiteRepertoire.getTrainingForTags as jest.Mock).mockReturnValue(
        _.map(whiteDurations, makeTrainingWithHistory)
      );
      (state.blackRepertoire.getTrainingForTags as jest.Mock).mockReturnValue(
        _.map(blackDurations, makeTrainingWithHistory)
      );
      const totalMilliseconds = _.sum(
        _.concat(_.flatten(whiteDurations), _.flatten(blackDurations))
      );
      const expected = "humanized";
      ((humanizeDuration as unknown) as jest.Mock).mockReturnValue(expected);
      const selectedTags: TagTree[] = [];
      component.vm.selectedTags = selectedTags;

      const actual = component.vm.totalTrainingDuration;

      expect(actual).toEqual(expected);
      expect(humanizeDuration).toBeCalledWith(totalMilliseconds, {
        round: true,
      });
    });
  });
});
