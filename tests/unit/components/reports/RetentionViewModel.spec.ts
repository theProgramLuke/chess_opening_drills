import { shallowMount, createLocalVue, Wrapper } from "@vue/test-utils";
import Vuex, { Store } from "vuex";
import _ from "lodash";

import RetentionViewModel from "@/components/reports/RetentionViewModel";
import { Repertoire, SavedRepertoire } from "@/store/repertoire/Repertoire";
import { Side } from "@/store/side";
import {
  RepetitionTraining,
  TrainingHistoryEntry,
} from "@/store/repertoire/RepetitionTraining";
import { Writeable } from "tests/TestHelpers";

jest.mock("@/store/repertoire/Repertoire");

describe("RetentionViewModel", () => {
  const localVue = createLocalVue();
  localVue.use(Vuex);

  let store: Store<unknown>;
  let state: { whiteRepertoire: Repertoire; blackRepertoire: Repertoire };
  let component: Wrapper<RetentionViewModel>;

  function mountComponent(): Wrapper<RetentionViewModel> {
    return shallowMount(RetentionViewModel, {
      localVue,
      store,
      render: jest.fn(),
    });
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
    };

    store = new Vuex.Store({ state });

    component = mountComponent();
  });

  describe("showNoPositions", () => {
    it("should be true if the repertoire has no trained positions", () => {
      (state.whiteRepertoire.getTrainingForTags as jest.Mock).mockReturnValue(
        []
      );
      (state.blackRepertoire.getTrainingForTags as jest.Mock).mockReturnValue(
        []
      );

      const actual = component.vm.showNoPositions;

      expect(actual).toBeTruthy();
    });

    it("should be false if the repertoire has trained positions", () => {
      const fen = "fen";
      const san = "san";
      (state.whiteRepertoire.getTrainingForTags as jest.Mock).mockReturnValue([
        "anything",
      ]);
      (state.blackRepertoire.getTrainingForTags as jest.Mock).mockReturnValue(
        []
      );

      const actual = component.vm.showNoPositions;

      expect(actual).toBeFalsy();
    });
  });

  describe("plotData", () => {
    function makeHistoryEvents(successful: boolean): TrainingHistoryEntry {
      return {
        easiness: 0,
        attemptedMoves: successful
          ? ["single attempt"]
          : ["multiple", "attempts"],
        elapsedMilliseconds: 0,
        grade: 0,
        timestamp: 0,
      };
    }

    function trainingFromHistory(
      counts: number[],
      retentionSuccesses: number[]
    ): RepetitionTraining[] {
      expect(counts.length).toEqual(retentionSuccesses.length);
      return _.map(counts, (count, index) => {
        const successes = retentionSuccesses[index];
        const training = new RepetitionTraining();

        const history = _.concat(
          _.times(count - successes, () => makeHistoryEvents(false)),
          _.times(successes, () => makeHistoryEvents(true))
        );

        jest.spyOn(training, "history", "get").mockReturnValue(history);

        return training as RepetitionTraining;
      });
    }

    it("should be scatter data of the positions training count and retention rate", () => {
      const blackTrainingCounts = [1, 0, 7, 3];
      const blackRetentionSuccesses = [1, 0, 4, 1];
      const blackRetentionRates = [1, 4 / 7, 1 / 3];
      const whiteTrainingCounts = [9, 1];
      const whiteRetentionSuccesses = [9, 0];
      const whiteRetentionRates = [1, 0];
      (state.whiteRepertoire.getTrainingForTags as jest.Mock).mockReturnValue(
        trainingFromHistory(whiteTrainingCounts, whiteRetentionSuccesses)
      );
      (state.blackRepertoire.getTrainingForTags as jest.Mock).mockReturnValue(
        trainingFromHistory(blackTrainingCounts, blackRetentionSuccesses)
      );
      const x = _.concat(
        _.compact(whiteTrainingCounts),
        _.compact(blackTrainingCounts)
      );
      const y = _.concat(whiteRetentionRates, blackRetentionRates);

      const plotData = component.vm.plotData;

      expect(plotData).toEqual([
        {
          x,
          y,
          mode: "markers",
          name: "Positions",
          type: "scatter",
        },
        {
          x,
          yaxis: "y2",
          type: "histogram",
          showlegend: false,
        },
        {
          y,
          xaxis: "x2",
          type: "histogram",
          showlegend: false,
        },
      ]);
    });
  });
});
