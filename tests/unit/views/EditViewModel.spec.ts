import { shallowMount, createLocalVue } from "@vue/test-utils";
import _ from "lodash";
import Vuex, { Store } from "vuex";

import EditViewModel from "@/views/EditViewModel.ts";
import { Repertoire } from "@/store/repertoire";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Side } from "@/store/side";
import { RepertoireTag } from "@/store/repertoireTag";
import { Turn } from "@/store/turn";
import { Move } from "@/store/move";

jest.mock("@/store/repertoire");
jest.mock("@/store/repertoireTag");
jest.mock("@/store/repertoirePosition");

const mutations = {
  addRepertoirePosition: jest.fn(),
  addRepertoireTag: jest.fn()
};
let startPosition: RepertoirePosition;
let state: { whiteRepertoire: Repertoire; blackRepertoire: Repertoire };
const localVue = createLocalVue();
localVue.use(Vuex);
let store: Store<unknown>;

beforeEach(() => {
  startPosition = new RepertoirePosition("", "", Side.White);
  state = {
    whiteRepertoire: new Repertoire(
      [],
      [new RepertoireTag(Side.White, "", startPosition, "", [])]
    ),
    blackRepertoire: new Repertoire([], [])
  };

  store = new Vuex.Store({ state, mutations });
});

const makeTurn = (count = 0) =>
  new Turn(
    new Move(count.toString(), new RepertoirePosition("", "", Side.White))
  );

describe("EditViewModel", () => {
  const mountComponent = () =>
    shallowMount(EditViewModel, {
      render: jest.fn(),
      localVue,
      store
    });

  beforeEach(() => {
    _.forEach(mutations, mutation => mutation.mockReset());
  });

  describe("created", () => {
    it("should be created with the white repertoire start position", () => {
      const component = mountComponent();

      const activePosition = component.vm.activePosition;

      expect(component.vm.activePosition).toBe(startPosition);
    });
  });

  describe("turnLists", () => {
    it("should be the turn lists of the active position", () => {
      const turnList = [_.times(1, makeTurn), _.times(5, makeTurn)];
      (startPosition.GetTurnLists as jest.Mock).mockReturnValue(turnList);
      const component = mountComponent();

      const actual = component.vm.turnLists;

      expect(actual).toBe(turnList);
    });

    it("should be [[]] if there are no moves", () => {
      (startPosition.GetTurnLists as jest.Mock).mockReturnValue(false);
      const component = mountComponent();

      const actual = component.vm.turnLists;

      expect(actual).toEqual([[]]);
    });
  });

  describe("nextMoves", () => {
    it("should be the next moves of the active position", () => {
      startPosition.children = [
        new Move("0", new RepertoirePosition("", "", Side.White)),
        new Move("1", new RepertoirePosition("", "", Side.White))
      ];
      const component = mountComponent();

      const actual = component.vm.nextMoves;

      expect(actual).toEqual(startPosition.children);
    });
  });

  describe("updateBoard", () => {
    it("should update the active position and board orientation", () => {
      const side = Side.Black;
      const component = mountComponent();
      const updatedPosition = new RepertoirePosition("some fen", "", side);

      component.vm.updateBoard(updatedPosition);

      expect(component.vm.boardOrientation).toEqual(side);
      expect(component.vm.activePosition).toBe(updatedPosition);
    });
  });

  describe("onBoardMove", () => {
    it("should add a repertoire position with the new move", () => {
      const component = mountComponent();
      const fen = "new move fen";
      const san = "e5";
      const history = ["e4", san];

      component.vm.onBoardMove({ fen, history });

      expect(mutations.addRepertoirePosition).toMatchSnapshot();
    });

    it("should update the board with the new move", () => {
      const component = mountComponent();
      component.vm.updateBoard = jest.fn();

      component.vm.onBoardMove({ fen: "fen" });

      expect(component.vm.updateBoard).toBeCalledWith(
        expect.any(RepertoirePosition)
      );
    });
  });

  describe("addNewRepertoireTag", () => {
    it("should invoke the addRepertoireTag mutation", () => {
      const component = mountComponent();

      component.vm.addNewRepertoireTag(
        new RepertoireTag(
          Side.White,
          "",
          new RepertoirePosition("", "", Side.White),
          "",
          []
        ),
        "name"
      );

      expect(mutations.addRepertoireTag).toMatchSnapshot();
    });
  });

  describe("onScroll", () => {
    it("should go to the next position on scroll up", () => {
      const nextPosition = new RepertoirePosition("", "", Side.White);
      startPosition.children.push(new Move("", nextPosition));
      const component = mountComponent();
      component.vm.updateBoard = jest.fn();

      component.vm.onScroll({ deltaY: 1 } as any);

      expect(component.vm.updateBoard).toBeCalledWith(nextPosition);
    });

    it("should go to the next position on scroll down", () => {
      const nextPosition = new RepertoirePosition("", "", Side.White);
      startPosition.parents.push(nextPosition);
      const component = mountComponent();
      component.vm.updateBoard = jest.fn();

      component.vm.onScroll({ deltaY: -1 } as any);

      expect(component.vm.updateBoard).toBeCalledWith(nextPosition);
    });
  });
});
