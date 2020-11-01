import _ from "lodash";
import { shallowMount, Wrapper, createLocalVue } from "@vue/test-utils";
import Vuex, { Store } from "vuex";
import now from "lodash/now";

import ScheduleViewModel from "@/views/ScheduleViewModel.ts";
import { Repertoire } from "@/store/repertoire/Repertoire";
import { Side } from "@/store/side";
import { TagTree } from "@/store/repertoire/TagTree";
import {
  TrainingCollection,
  TrainingMoveSpecification
} from "@/store/repertoire/TrainingCollection";
import { RepetitionTraining } from "@/store/repertoire/RepetitionTraining";

jest.mock("lodash/now");
jest.mock("@/store/repertoire/Repertoire");
jest.mock("@/store/repertoire/TagTree");
jest.mock("@/store/repertoire/TrainingCollection");

const currentTime = 24601;
(now as jest.Mock).mockReturnValue(currentTime);

describe("ScheduleViewModel", () => {
  let component: Wrapper<ScheduleViewModel>;
  let whiteRepertoire: Repertoire;
  let blackRepertoire: Repertoire;

  function mountComponent(): Wrapper<ScheduleViewModel> {
    const localVue = createLocalVue();
    localVue.use(Vuex);

    const emptyRepertoire = {
      positions: {},
      sideToTrain: Side.White,
      tags: new TagTree("", "", []),
      training: {}
    };
    whiteRepertoire = new Repertoire(emptyRepertoire);
    blackRepertoire = new Repertoire(emptyRepertoire);
    whiteRepertoire.training = new TrainingCollection();
    blackRepertoire.training = new TrainingCollection();

    const state = {
      whiteRepertoire,
      blackRepertoire
    };
    const store = new Vuex.Store({ state });

    return shallowMount(ScheduleViewModel, {
      render: jest.fn(),
      store,
      localVue
    });
  }

  beforeEach(() => {
    component = mountComponent();
  });

  describe("calendarRange", () => {
    it("should start now", () => {
      expect(component.vm.start).toEqual(currentTime);
    });

    it("should end in 4 weeks", () => {
      expect(component.vm.end).toEqual(currentTime + 2419200000);
    });
  });

  describe("events", () => {
    it("should get no events if there are no positions", () => {
      (whiteRepertoire.training.getMoves as jest.Mock).mockReturnValue([]);
      (blackRepertoire.training.getMoves as jest.Mock).mockReturnValue([]);

      const actual = component.vm.events;

      expect(actual).toEqual([]);
    });

    it("should combine the repertoire training into scheduled calendar days", () => {
      const whiteMoves: TrainingMoveSpecification[] = [
        { fen: "fen0", san: "san0" },
        { fen: "fen1", san: "san1" }
      ];
      const blackMoves: TrainingMoveSpecification[] = [
        { fen: "fen0", san: "san0" }
      ];
      const whiteTraining: RepetitionTraining[] = _.times(
        whiteMoves.length,
        () => new RepetitionTraining()
      );
      const blackTraining: RepetitionTraining[] = _.times(
        blackMoves.length,
        () => new RepetitionTraining()
      );
      jest
        .spyOn(whiteTraining[0], "scheduledRepetitionTimestamp", "get")
        .mockReturnValue(0);
      jest
        .spyOn(whiteTraining[1], "scheduledRepetitionTimestamp", "get")
        .mockReturnValue(9999999999);
      jest
        .spyOn(blackTraining[0], "scheduledRepetitionTimestamp", "get")
        .mockReturnValue(0);
      (whiteRepertoire.training.getMoves as jest.Mock).mockReturnValue(
        whiteMoves
      );
      (blackRepertoire.training.getMoves as jest.Mock).mockReturnValue(
        blackMoves
      );
      _.forEach(whiteTraining, training =>
        (whiteRepertoire.training
          .getTrainingForMove as jest.Mock).mockReturnValueOnce(training)
      );
      _.forEach(blackTraining, training =>
        (blackRepertoire.training
          .getTrainingForMove as jest.Mock).mockReturnValueOnce(training)
      );

      const actual = component.vm.events;

      expect(actual).toEqual([
        {
          color: "primary",
          name: "2 positions",
          end: new Date("1970-01-01"),
          start: new Date("1970-01-01"),
          timed: false
        },
        {
          color: "primary",
          name: "1 positions",
          end: new Date("1970-04-26"),
          start: new Date("1970-04-26"),
          timed: false
        }
      ]);
    });
  });
});
