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
import {
  RemoveRepertoireMovePayload,
  AddRepertoireTagPayload,
  RemoveRepertoireTagPayload,
  AddRepertoireMovePayload,
  SetPositionCommentsPayload,
  SetPositionDrawingsPayload
} from "@/store/MutationPayloads";
import { DrawShape } from "chessground/draw";

jest.mock("@/store/repertoire/Repertoire");
jest.mock("@/store/repertoire/TagTree");
jest.mock("@/store/repertoire/PositionCollection");

describe("EditViewModel", () => {
  const startPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -";
  const mutations = {
    addRepertoireMove: jest.fn(),
    removeRepertoireMove: jest.fn(),
    addRepertoireTag: jest.fn(),
    removeRepertoireTag: jest.fn(),
    setPositionComments: jest.fn(),
    setPositionDrawings: jest.fn()
  };
  let component: Wrapper<EditViewModel>;
  let whiteRepertoire: Repertoire;
  let blackRepertoire: Repertoire;

  function mountComponent(): Wrapper<EditViewModel> {
    const localVue = createLocalVue();
    localVue.use(Vuex);

    const emptyRepertoire = {
      positions: {},
      training: {},
      tags: { name: "", id: "", fen: "", children: [], isRootTag: false },
      sideToTrain: Side.White
    };
    whiteRepertoire = new Repertoire(emptyRepertoire);
    blackRepertoire = new Repertoire(emptyRepertoire);
    whiteRepertoire.tags = new TagTree("", "", []);
    whiteRepertoire.tags.fen = startPosition;
    whiteRepertoire.positions = new PositionCollection({});
    blackRepertoire.positions = new PositionCollection({});
    const state = {
      whiteRepertoire,
      blackRepertoire
    };

    const store = new Vuex.Store({ state, mutations });

    return shallowMount(EditViewModel, {
      render: jest.fn(),
      localVue,
      store
    });
  }

  beforeEach(() => {
    _.forEach(mutations, mutation => mutation.mockReset());

    component = mountComponent();
  });

  describe("created", () => {
    it("should be created with the white repertoire start position", () => {
      const actual = component.vm.activePosition;

      expect(actual).toBe(startPosition);
    });
  });

  describe("activePositionLegalFen", () => {
    it("should be the active position fen with 0 1 appended to be legal fen", () => {
      const fen = "fen";
      component.vm.activePosition = fen;

      const actual = component.vm.activePositionLegalFen;

      expect(actual).toBe("fen 0 1");
    });
  });

  describe("sourceVariations", () => {
    it("should be the source variations of the active position", () => {
      const turnList: Variation[] = [];
      (whiteRepertoire.positions
        .getSourceVariations as jest.Mock).mockReturnValue(turnList);

      const actual = component.vm.sourceVariations;

      expect(actual).toBe(turnList);
    });

    it("should be an empty array if there are no moves", () => {
      (whiteRepertoire.positions
        .getSourceVariations as jest.Mock).mockReturnValue([]);

      const actual = component.vm.sourceVariations;

      expect(actual).toEqual([]);
    });
  });

  describe("nextMoves", () => {
    it("should be the next moves of the active position", () => {
      const moves: VariationMove[] = [];
      (whiteRepertoire.positions
        .movesFromPosition as jest.Mock).mockReturnValue(moves);

      const actual = component.vm.nextMoves;

      expect(actual).toEqual(moves);
      expect(whiteRepertoire.positions.movesFromPosition).toBeCalledWith(
        startPosition
      );
    });
  });

  describe("onDeleteMove", () => {
    it("should invoke the removeRepertoireMove mutation with the payload", () => {
      const move: VariationMove = {
        san: "san",
        sourceFen: "fen0",
        resultingFen: "fen1"
      };
      const expected: RemoveRepertoireMovePayload = {
        repertoire: whiteRepertoire,
        fen: move.sourceFen,
        san: move.san
      };

      component.vm.onDeleteMove(move);

      expect(mutations.removeRepertoireMove).toBeCalledWith(
        expect.anything(),
        expected
      );
    });
  });

  describe("onCreateTag", () => {
    it("should invoke the addRepertoireTag mutation with the payload", () => {
      const parent = new TagTree("", "", []);
      const name = "name";
      const fen = "fen";
      const expected: AddRepertoireTagPayload = {
        repertoire: component.vm.whiteRepertoire,
        name,
        parent,
        fen
      };

      component.vm.onCreateTag({ parent, name, fen });

      expect(mutations.addRepertoireTag).toHaveBeenCalledWith(
        expect.anything(),
        expected
      );
    });
  });

  describe("onRemoveTag", () => {
    it("should invoke the removeRepertoireTag mutation with the payload", () => {
      const id = "id";
      const expected: RemoveRepertoireTagPayload = {
        repertoire: component.vm.whiteRepertoire,
        id
      };

      component.vm.onRemoveTag({ id });

      expect(mutations.removeRepertoireTag).toHaveBeenCalledWith(
        expect.anything(),
        expected
      );
    });
  });

  describe("updateBoard", () => {
    it("should update the active position", () => {
      const updatedPosition = "new fen";

      component.vm.updateBoard(updatedPosition);

      expect(component.vm.activePosition).toBe(updatedPosition);
    });
  });

  describe("onTagSelect", () => {
    it("should update the active position and repertoire", () => {
      component.vm.updateBoard = jest.fn();
      const fen = "fen";

      component.vm.onTagSelect(component.vm.blackRepertoire, fen);

      expect(component.vm.updateBoard).toBeCalledWith(fen);
      expect(component.vm.activeRepertoire).toBe(component.vm.blackRepertoire);
    });
  });

  describe("onTagSelect", () => {
    it("should update the active position and repertoire", () => {
      const fen = "fen";

      component.vm.onSelectMove({ resultingFen: fen, sourceFen: "", san: "" });

      expect(component.vm.activePosition).toEqual(fen);
    });
  });

  describe("boardOrientation", () => {
    it.each([Side.White, Side.Black])(
      "should be the side to train of the active repertoire",
      side => {
        whiteRepertoire.sideToTrain = side;

        const actual = component.vm.boardOrientation;

        expect(actual).toEqual(side);
      }
    );
  });

  describe("onBoardMove", () => {
    it("should add a repertoire position with the new move", () => {
      const san = "e5";
      const expected: AddRepertoireMovePayload = {
        repertoire: whiteRepertoire,
        fen: startPosition,
        san
      };

      component.vm.onBoardMove({ fen: "new fen", history: ["e4", san] });

      expect(mutations.addRepertoireMove).toHaveBeenCalledWith(
        expect.anything(),
        expected
      );
    });

    it("should update the board with the new move", () => {
      const expected = fenAfterMove(startPosition, "e4");

      component.vm.onBoardMove({ fen: expected, history: ["e4"] });
      const actual = component.vm.activePosition;

      expect(actual).toEqual(expected);
    });

    it("should not add a repertoire position if the move already exists", () => {
      const san = "e4";
      const alreadyExistingFen = fenAfterMove(startPosition, san) || "";
      expect(alreadyExistingFen).not.toEqual("");
      jest.spyOn(component.vm, "nextMoves", "get").mockReturnValue([
        {
          sourceFen: startPosition,
          resultingFen: alreadyExistingFen,
          san
        }
      ]);

      component.vm.onBoardMove({ fen: startPosition, history: [san] });

      expect(mutations.addRepertoireMove).not.toBeCalled();
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
      (whiteRepertoire.positions
        .movesFromPosition as jest.Mock).mockReturnValue([nextMove]);
      component.vm.updateBoard = jest.fn();

      component.vm.onScroll(scrollUp);

      expect(component.vm.updateBoard).toBeCalledWith(nextMove.resultingFen);
    });

    it("should stay at the active position on scroll down when there are no next moves", () => {
      (whiteRepertoire.positions
        .movesFromPosition as jest.Mock).mockReturnValue([]);
      component.vm.updateBoard = jest.fn();

      component.vm.onScroll(scrollUp);

      expect(component.vm.updateBoard).not.toBeCalled();
    });

    it("should go to the previous position on scroll up", () => {
      const parent = "parent";
      (whiteRepertoire.positions.parentPositions as jest.Mock).mockReturnValue([
        parent
      ]);
      component.vm.updateBoard = jest.fn();

      component.vm.onScroll(scrollDown);

      expect(component.vm.updateBoard).toBeCalledWith(parent);
    });

    it("should stay at the active position on scroll up when there are no previous moves", () => {
      (whiteRepertoire.positions.parentPositions as jest.Mock).mockReturnValue(
        []
      );
      component.vm.updateBoard = jest.fn();

      component.vm.onScroll(scrollDown);

      expect(component.vm.updateBoard).not.toBeCalled();
    });
  });

  describe("activePositionComments", () => {
    it("should get the comments for the active position", () => {
      const expected = "comment";
      (whiteRepertoire.positions
        .getPositionComments as jest.Mock).mockReturnValue(expected);
      const fen = "fen";
      component.vm.activePosition = fen;

      const actual = component.vm.activePositionComments;

      expect(actual).toBe(expected);
      expect(whiteRepertoire.positions.getPositionComments).toBeCalledWith(fen);
    });

    it("should set the comments for the active position", () => {
      const comments = "some comment";
      const fen = "some fen";
      const expected: SetPositionCommentsPayload = {
        repertoire: whiteRepertoire,
        fen,
        comments
      };
      component.vm.activePosition = fen;

      component.vm.activePositionComments = comments;

      expect(mutations.setPositionComments).toBeCalledWith(
        expect.anything(),
        expected
      );
    });
  });

  describe("activePositionDrawings", () => {
    it("should get a clone of the drawings for the active position", () => {
      const expected: DrawShape[] = [];
      (whiteRepertoire.positions
        .getPositionDrawings as jest.Mock).mockReturnValue(expected);
      const fen = "fen";
      component.vm.activePosition = fen;

      const actual = component.vm.activePositionDrawings;

      expect(actual).toEqual(expected);
      expect(actual).not.toBe(expected);
      expect(whiteRepertoire.positions.getPositionDrawings).toBeCalledWith(fen);
    });

    it("should set the drawings for the active position", () => {
      const drawings: DrawShape[] = [];
      const fen = "some fen";
      const expected: SetPositionDrawingsPayload = {
        repertoire: whiteRepertoire,
        fen,
        drawings
      };
      component.vm.activePosition = fen;

      component.vm.activePositionDrawings = drawings;

      expect(mutations.setPositionDrawings).toBeCalledWith(
        expect.anything(),
        expected
      );
    });
  });

  describe("onDrawingsChanged", () => {
    it("should set the drawings for the active position", () => {
      const drawings: DrawShape[] = [];
      const fen = "some fen";
      const expected: SetPositionDrawingsPayload = {
        repertoire: whiteRepertoire,
        fen,
        drawings
      };
      component.vm.activePosition = fen;

      component.vm.onDrawingsChanged(drawings);

      expect(mutations.setPositionDrawings).toBeCalledWith(
        expect.anything(),
        expected
      );
    });
  });
});
