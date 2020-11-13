import { shallowMount, createLocalVue, Wrapper } from "@vue/test-utils";
import Vuex, { Store } from "vuex";
import _ from "lodash";

import MovesPerTagViewModel from "@/components/reports/MovesPerTagViewModel";
import { Repertoire, SavedRepertoire } from "@/store/repertoire/Repertoire";
import { Side } from "@/store/side";
import { TrainingCollection } from "@/store/repertoire/TrainingCollection";
import { TagTree } from "@/store/repertoire/TagTree";

jest.mock("@/store/repertoire/Repertoire");
jest.mock("@/store/repertoire/TrainingCollection");
jest.mock("@/store/repertoire/TagTree");

describe("MovesPerTagViewModel", () => {
  const localVue = createLocalVue();
  localVue.use(Vuex);

  let store: Store<unknown>;
  let state: { whiteRepertoire: Repertoire; blackRepertoire: Repertoire };
  let component: Wrapper<MovesPerTagViewModel>;

  function mountComponent(): Wrapper<MovesPerTagViewModel> {
    return shallowMount(MovesPerTagViewModel, {
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
    state.whiteRepertoire.training = new TrainingCollection();
    state.blackRepertoire.training = new TrainingCollection();

    store = new Vuex.Store({ state });

    component = mountComponent();
  });

  describe("showNoPositions", () => {
    it("should be true if the repertoires only have the starting positions", () => {
      (state.whiteRepertoire.training.getMoves as jest.Mock).mockReturnValue(
        []
      );
      (state.blackRepertoire.training.getMoves as jest.Mock).mockReturnValue(
        []
      );
      const show = component.vm.showNoPositions;

      expect(show).toBeTruthy();
    });

    it("should be false if either repertoire has more than the starting positions", () => {
      (state.whiteRepertoire.training.getMoves as jest.Mock).mockReturnValue([
        "anything",
      ]);
      (state.blackRepertoire.training.getMoves as jest.Mock).mockReturnValue(
        []
      );
      const show = component.vm.showNoPositions;

      expect(show).toBeFalsy();
    });
  });

  describe("plotData", () => {
    it("should be sunburst data of the repertoire counts per tag", () => {
      state.whiteRepertoire.tags = new TagTree("", "", []);
      state.whiteRepertoire.tags.children = [new TagTree("", "", [])];
      state.blackRepertoire.tags = new TagTree("", "", []);
      state.whiteRepertoire.tags.name = "White";
      state.whiteRepertoire.tags.children[0].name = "French";
      state.blackRepertoire.tags.name = "Black";
      (state.whiteRepertoire
        .getTrainingForTags as jest.Mock).mockImplementation(
        (tags: TagTree[]) => {
          if (_.isEqual(tags, [state.whiteRepertoire.tags])) {
            return [0, 1, 2, 3, 4];
          } else if (
            _.isEqual(tags, [state.whiteRepertoire.tags.children[0]])
          ) {
            return [2, 3, 4];
          }
        }
      );
      (state.blackRepertoire
        .getTrainingForTags as jest.Mock).mockImplementation(
        (tags: TagTree[]) => {
          if (_.isEqual(tags, [state.blackRepertoire.tags])) {
            return _.times(10);
          }
        }
      );

      const plotData = component.vm.plotData;

      expect(plotData).toEqual([
        {
          maxdepth: 3,
          type: "sunburst",
          labels: ["White / French", "White", "Black"],
          parents: ["White", "", ""],
          values: [3, 5, 10],
        },
      ]);
    });
  });
});
