import { shallowMount, createLocalVue, Wrapper } from "@vue/test-utils";
import _ from "lodash";
import Vuex, { Store } from "vuex";

import EditViewModel from "@/views/EditViewModel.ts";
import { Repertoire } from "@/store/repertoire/Repertoire";
import { Side } from "@/store/side";
import { TagTree } from "@/store/repertoire/TagTree";
import {
  Variation,
  VariationMove,
  PositionCollection
} from "@/store/repertoire/PositionCollection";
import { fenAfterMove } from "@/store/repertoire/chessHelpers";

jest.mock("@/store/repertoire/Repertoire");
jest.mock("@/store/repertoire/TagTree");
jest.mock("@/store/repertoire/PositionCollection");

describe("EditViewModel", () => {
  const startPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -";
  const mutations = {
    addRepertoireMove: jest.fn()
  };
  const localVue = createLocalVue();
  localVue.use(Vuex);

  let store: Store<unknown>;
  let state: { whiteRepertoire: Repertoire; blackRepertoire: Repertoire };

  function mountComponent(): Wrapper<EditViewModel> {
    return shallowMount(EditViewModel, {
      render: jest.fn(),
      localVue,
      store
    });
  }

  beforeEach(() => {
    _.forEach(mutations, mutation => mutation.mockReset());

    state = {
      whiteRepertoire: new Repertoire({
        positions: {},
        training: {},
        tags: { name: "", id: "", fen: "", children: [] },
        sideToTrain: Side.White
      }),
      blackRepertoire: new Repertoire({
        positions: {},
        training: {},
        tags: { name: "", id: "", fen: "", children: [] },
        sideToTrain: Side.White
      })
    };
    state.whiteRepertoire.tags = new TagTree("", "", "", []);
    state.whiteRepertoire.tags.fen = startPosition;

    state.whiteRepertoire.positions = new PositionCollection({});
    state.blackRepertoire.positions = new PositionCollection({});

    store = new Vuex.Store({ state, mutations });
  });

  describe("created", () => {
    it("should be created with the white repertoire start position", () => {
      const component = mountComponent();

      const actual = component.vm.activePosition;

      expect(actual).toBe(startPosition);
    });
  });

  describe("activePositionLegalFen", () => {
    it("should be the active position fen with 0 1 appended to be legal fen", () => {
      const fen = "fen";
      const component = mountComponent();
      component.vm.activePosition = fen;

      const actual = component.vm.activePositionLegalFen;

      expect(actual).toBe("fen 0 1");
    });
  });

  describe("sourceVariations", () => {
    it("should be the source variations of the active position", () => {
      const turnList: Variation[] = [];
      (state.whiteRepertoire.positions
        .getSourceVariations as jest.Mock).mockReturnValue(turnList);
      const component = mountComponent();

      const actual = component.vm.sourceVariations;

      expect(actual).toBe(turnList);
    });

    it("should be an empty array if there are no moves", () => {
      (state.whiteRepertoire.positions
        .getSourceVariations as jest.Mock).mockReturnValue([]);
      const component = mountComponent();

      const actual = component.vm.sourceVariations;

      expect(actual).toEqual([]);
    });
  });

  describe("nextMoves", () => {
    it("should be the next moves of the active position", () => {
      const moves: VariationMove[] = [];
      (state.whiteRepertoire.positions
        .movesFromPosition as jest.Mock).mockReturnValue(moves);
      const component = mountComponent();

      const actual = component.vm.nextMoves;

      expect(actual).toEqual(moves);
      expect(state.whiteRepertoire.positions.movesFromPosition).toBeCalledWith(
        startPosition
      );
    });
  });

  describe("updateBoard", () => {
    it("should update the active position", () => {
      const component = mountComponent();
      const updatedPosition = "new fen";

      component.vm.updateBoard(updatedPosition);

      expect(component.vm.activePosition).toBe(updatedPosition);
    });
  });

  describe("boardOrientation", () => {
    it.each([Side.White, Side.Black])(
      "should be the side to train of the active repertoire",
      side => {
        state.whiteRepertoire.sideToTrain = side;
        const component = mountComponent();

        const actual = component.vm.boardOrientation;

        expect(actual).toEqual(side);
      }
    );
  });

  describe("onBoardMove", () => {
    it("should add a repertoire position with the new move", () => {
      const component = mountComponent();
      const fen = "new move fen";
      const san = "e5";
      const history = ["e4", san];

      component.vm.onBoardMove({ fen, history });

      expect(mutations.addRepertoireMove).toHaveBeenCalled();
    });

    it("should update the board with the new move", () => {
      const expected = fenAfterMove(startPosition, "e4");
      const component = mountComponent();

      component.vm.onBoardMove({ fen: expected, history: ["e4"] });
      const actual = component.vm.activePosition;

      expect(actual).toEqual(expected);
    });
  });

  describe("onScroll", () => {
    const scrollUp = { deltaY: 1 };
    const scrollDown = { deltaY: -1 };

    it("should go to the next position on scroll down", () => {
      const nextMove: VariationMove = {
        resultingFen: "next fen",
        sourceFen: "",
        san: ""
      };
      (state.whiteRepertoire.positions
        .movesFromPosition as jest.Mock).mockReturnValue([nextMove]);
      const component = mountComponent();
      component.vm.updateBoard = jest.fn();

      component.vm.onScroll(scrollUp);

      expect(component.vm.updateBoard).toBeCalledWith(nextMove.resultingFen);
    });

    it("should stay at the active position on scroll down when there are no next moves", () => {
      (state.whiteRepertoire.positions
        .movesFromPosition as jest.Mock).mockReturnValue([]);
      const component = mountComponent();
      component.vm.updateBoard = jest.fn();

      component.vm.onScroll(scrollUp);

      expect(component.vm.updateBoard).not.toBeCalled();
    });

    it("should go to the previous position on scroll up", () => {
      const parent = "parent";
      (state.whiteRepertoire.positions
        .parentPositions as jest.Mock).mockReturnValue([parent]);
      const component = mountComponent();
      component.vm.updateBoard = jest.fn();

      component.vm.onScroll(scrollDown);

      expect(component.vm.updateBoard).toBeCalledWith(parent);
    });

    it("should stay at the active position on scroll up when there are no previous moves", () => {
      (state.whiteRepertoire.positions
        .parentPositions as jest.Mock).mockReturnValue([]);
      const component = mountComponent();
      component.vm.updateBoard = jest.fn();

      component.vm.onScroll(scrollDown);

      expect(component.vm.updateBoard).not.toBeCalled();
    });
  });
});
