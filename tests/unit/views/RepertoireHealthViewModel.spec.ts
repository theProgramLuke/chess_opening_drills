import Vuex from "vuex";
import { Wrapper, shallowMount, createLocalVue } from "@vue/test-utils";
import _ from "lodash";

import RepertoireHealthViewModel from "@/views/RepertoireHealthViewModel";
import { Repertoire } from "@/store/repertoire/Repertoire";
import { Side } from "@/store/side";
import {
  TrainingCollection,
  TrainingMoveSpecification,
} from "@/store/repertoire/TrainingCollection";
import { RemoveRepertoireMovePayload } from "@/store/MutationPayloads";

jest.mock("@/store/repertoire/Repertoire");
jest.mock("@/store/repertoire/TrainingCollection");

describe("RepertoireHealthViewModel", () => {
  let component: Wrapper<RepertoireHealthViewModel>;
  let whiteRepertoire: Repertoire;
  let blackRepertoire: Repertoire;

  const mutations = {
    removeRepertoireMove: jest.fn(),
  };

  function mountComponent(): Wrapper<RepertoireHealthViewModel> {
    const localVue = createLocalVue();
    localVue.use(Vuex);

    const state = { whiteRepertoire, blackRepertoire };
    const store = new Vuex.Store({ state, mutations });

    return shallowMount(RepertoireHealthViewModel, {
      render: jest.fn(),
      localVue,
      store,
    });
  }

  beforeEach(() => {
    _.forEach(mutations, mutation => mutation.mockReset());

    const emptyRepertoire = {
      positions: {},
      training: {},
      tags: {
        name: "",
        id: "",
        fen: "",
        children: [],
        isRootTag: false,
      },
      sideToTrain: Side.White,
    };

    whiteRepertoire = new Repertoire(emptyRepertoire);
    blackRepertoire = new Repertoire(emptyRepertoire);
    whiteRepertoire.training = new TrainingCollection();
    blackRepertoire.training = new TrainingCollection();
    whiteRepertoire.sideToTrain = Side.White;
    blackRepertoire.sideToTrain = Side.Black;

    component = mountComponent();
  });

  describe("activePosition", () => {
    it("should be the first position with multiple moves to train from either repertoires", () => {
      const whiteMultipleMoves: TrainingMoveSpecification[] = [
        { fen: "fen0", san: "" },
        { fen: "fen0", san: "" },
        { fen: "fen0", san: "" },
      ];
      const blackMultipleMoves: TrainingMoveSpecification[] = [
        { fen: "fen1", san: "" },
        { fen: "fen1", san: "" },
        { fen: "fen2", san: "" },
        { fen: "fen2", san: "" },
      ];
      (whiteRepertoire.training
        .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({
        [whiteMultipleMoves[0].fen]: [],
      });
      (blackRepertoire.training
        .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({
        [blackMultipleMoves[0].fen]: [],
        [blackMultipleMoves[2].fen]: [],
      });
      const expected = `${whiteMultipleMoves[0].fen} 0 1`;

      const actual = component.vm.activePosition;

      expect(actual).toEqual(expected);
    });

    it("should be undefined if there are no position with multiple moves", () => {
      (whiteRepertoire.training
        .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({});
      (blackRepertoire.training
        .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({});

      const actual = component.vm.activePosition;

      expect(actual).toBeUndefined();
    });
  });

  describe("activePosition", () => {
    it(`should be the legal fen of the first position 
        with multiple moves to train from either repertoires`, () => {
      const whiteMultipleMoves: TrainingMoveSpecification[] = [
        { fen: "fen0", san: "" },
        { fen: "fen0", san: "" },
        { fen: "fen0", san: "" },
      ];
      const blackMultipleMoves: TrainingMoveSpecification[] = [
        { fen: "fen1", san: "" },
        { fen: "fen1", san: "" },
        { fen: "fen2", san: "" },
        { fen: "fen2", san: "" },
      ];
      (whiteRepertoire.training
        .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({
        [whiteMultipleMoves[0].fen]: [],
      });
      (blackRepertoire.training
        .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({
        [blackMultipleMoves[0].fen]: [],
        [blackMultipleMoves[2].fen]: [],
      });
      const expected = `${whiteMultipleMoves[0].fen} 0 1`;

      const actual = component.vm.activePosition;

      expect(actual).toEqual(expected);
    });

    it("should be undefined if there are no position with multiple moves", () => {
      (whiteRepertoire.training
        .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({});
      (blackRepertoire.training
        .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({});

      const actual = component.vm.activePosition;

      expect(actual).toBeUndefined();
    });
  });

  describe("activePositionMoves", () => {
    it("should be the first position with multiple moves to train from either repertoires", () => {
      const whiteMultipleMoves: TrainingMoveSpecification[] = [
        { fen: "fen0", san: "san0" },
        { fen: "fen0", san: "san1" },
        { fen: "fen0", san: "san2" },
      ];
      (whiteRepertoire.training
        .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({
        [whiteMultipleMoves[0].fen]: whiteMultipleMoves,
      });
      (blackRepertoire.training
        .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({});
      const expected = whiteMultipleMoves;

      const actual = component.vm.activePositionMoves;

      expect(actual).toEqual(expected);
    });

    it("should be empty if there are no position with multiple moves", () => {
      (whiteRepertoire.training
        .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({});
      (blackRepertoire.training
        .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({});

      const actual = component.vm.activePositionMoves;

      expect(actual).toEqual([]);
    });
  });

  describe("boardOrientation", () => {
    it.each([Side.White, Side.Black])(
      "should be the orientation of the side to train",
      side => {
        (whiteRepertoire.training
          .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({
          fen: [],
        });
        (blackRepertoire.training
          .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({
          fen: [],
        });
        if (side === Side.Black) {
          component.vm.skipPosition();
        }

        const actual = component.vm.boardOrientation;

        expect(actual).toEqual(side);
      }
    );

    it("should be white if there are no position with multiple moves", () => {
      (whiteRepertoire.training
        .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({});
      (blackRepertoire.training
        .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({});
      const expected = Side.White;

      const actual = component.vm.boardOrientation;

      expect(actual).toEqual(expected);
    });
  });

  describe("skipPosition", () => {
    it("should advance to the next position to review", () => {
      const whiteMultipleMoves: TrainingMoveSpecification[] = [
        { fen: "fen0", san: "" },
        { fen: "fen0", san: "" },
        { fen: "fen1", san: "" },
        { fen: "fen1", san: "" },
      ];
      (whiteRepertoire.training
        .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({
        [whiteMultipleMoves[0].fen]: [],
        [whiteMultipleMoves[2].fen]: [],
      });
      (blackRepertoire.training
        .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({});
      const expectedPosition = `${whiteMultipleMoves[2].fen} 0 1`;

      component.vm.skipPosition();
      const actualPosition = component.vm.activePosition;

      expect(actualPosition).toEqual(expectedPosition);
    });

    it("should can advance multiple positions", () => {
      const whiteMultipleMoves: TrainingMoveSpecification[] = [
        { fen: "fen0", san: "" },
        { fen: "fen0", san: "" },
        { fen: "fen1", san: "" },
        { fen: "fen1", san: "" },
        { fen: "fen2", san: "" },
        { fen: "fen2", san: "" },
      ];
      (whiteRepertoire.training
        .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({
        [whiteMultipleMoves[0].fen]: [],
        [whiteMultipleMoves[2].fen]: [],
        [whiteMultipleMoves[4].fen]: [],
      });
      (blackRepertoire.training
        .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({});
      const expectedPosition = `${whiteMultipleMoves[4].fen} 0 1`;

      component.vm.skipPosition();
      component.vm.skipPosition();
      const actualPosition = component.vm.activePosition;

      expect(actualPosition).toEqual(expectedPosition);
    });
  });

  describe("onDeleteMove", () => {
    it("should invoke the remove repertoire move mutation on the repertoire", () => {
      const whiteMultipleMoves: TrainingMoveSpecification[] = [
        { fen: "fen0", san: "san0" },
        { fen: "fen0", san: "san1" },
      ];
      (whiteRepertoire.training
        .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({
        [whiteMultipleMoves[0].fen]: [],
      });
      (blackRepertoire.training
        .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({});
      const expected: RemoveRepertoireMovePayload = {
        repertoire: whiteRepertoire,
        fen: whiteMultipleMoves[0].fen,
        san: whiteMultipleMoves[0].san,
      };

      component.vm.onDeleteMove(whiteMultipleMoves[0]);

      expect(mutations.removeRepertoireMove).toBeCalledWith(
        expect.anything(),
        expected
      );
    });

    it("should not invoke the remove repertoire move mutation if there are no positions to review", () => {
      (whiteRepertoire.training
        .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({});
      (blackRepertoire.training
        .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({});

      component.vm.onDeleteMove({ fen: "", san: "" });

      expect(mutations.removeRepertoireMove).not.toBeCalled();
    });

    it("should trigger the positions to recompute", () => {
      const whiteMultipleMoves: TrainingMoveSpecification[] = [
        { fen: "fen0", san: "san0" },
        { fen: "fen0", san: "san1" },
      ];
      (whiteRepertoire.training
        .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({
        [whiteMultipleMoves[0].fen]: [],
      });
      (blackRepertoire.training
        .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({});
      const expected: RemoveRepertoireMovePayload = {
        repertoire: whiteRepertoire,
        fen: whiteMultipleMoves[0].fen,
        san: whiteMultipleMoves[0].san,
      };

      component.vm.onDeleteMove(whiteMultipleMoves[0]);

      expect(mutations.removeRepertoireMove).toBeCalledWith(
        expect.anything(),
        expected
      );
    });

    it("should trigger the positions to recompute", () => {
      const whiteMultipleMoves: TrainingMoveSpecification[] = [
        { fen: "fen0", san: "san0" },
        { fen: "fen0", san: "san1" },
      ];
      (whiteRepertoire.training
        .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({
        [whiteMultipleMoves[0].fen]: [],
      });
      (blackRepertoire.training
        .getPositionsWithMultipleTrainings as jest.Mock).mockReturnValue({});
      const expected = component.vm.recomputePositions + 1;

      component.vm.onDeleteMove(whiteMultipleMoves[0]);
      const actual = component.vm.recomputePositions;

      expect(actual).toEqual(expected);
    });
  });
});
