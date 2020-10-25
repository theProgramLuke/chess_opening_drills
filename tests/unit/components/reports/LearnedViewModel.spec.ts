//import { shallowMount, createLocalVue } from "@vue/test-utils";
//import Vuex from "vuex";
import _ from "lodash";

//import LearnedViewModel from "@/components/reports/LearnedViewModel";
//import { Repertoire, SavedRepertoire } from "@/store/repertoire/Repertoire";
//import { TagTree } from "@/store/repertoire/TagTree";
//import { Side } from "@/store/side";
//import { TrainingMode } from "@/store/trainingMode";
//import { TrainingCollection } from "@/store/repertoire/TrainingCollection";

// jest.mock("@/store/repertoire/Repertoire");
// jest.mock("@/store/repertoire/TagTree");
// jest.mock("@/store/repertoire/RepetitionTraining");
// jest.mock("@/store/repertoire/TrainingCollection");

// const emptySavedRepertoire: SavedRepertoire = {
//   name: "",
//   positions: {},
//   training: {},
//   tags: [],
//   sideToTrain: Side.White
// };

// const state = {
//   whiteRepertoire: new Repertoire(emptySavedRepertoire),
//   blackRepertoire: new Repertoire(emptySavedRepertoire)
// };

// const localVue = createLocalVue();
// localVue.use(Vuex);
// const store = new Vuex.Store({ state });

// const mockedRepertoirePosition = (includeAsNew = false, myTurn = true) => {
//   const position = new RepertoirePosition("", "", Side.White);
//   position.IncludeForTrainingMode = (mode: TrainingMode) =>
//     mode === TrainingMode.New && includeAsNew;
//   position.myTurn = myTurn;
//   return position;
// };

// const mockedRepertoireTag = (
//   position = new RepertoirePosition("", "", Side.White)
// ) => {
//   const tag = new RepertoireTag(Side.White, "", position, "", []);
//   tag.position = position;
//   return tag;
// };

describe("LearnedViewModel", () => {
  it("is not implemented", _.noop);
  // describe("combinedTags", () => {
  //   it("should get the concatenated tags of the repertoires", () => {
  //     state.whiteRepertoire.tags = [
  //       mockedRepertoireTag(),
  //       mockedRepertoireTag()
  //     ];
  //     state.blackRepertoire.tags = [mockedRepertoireTag()];
  //     const expectedTags = _.concat(
  //       state.whiteRepertoire.tags,
  //       state.blackRepertoire.tags
  //     );
  //     const component = shallowMount(LearnedViewModel, {
  //       localVue,
  //       store,
  //       render: jest.fn()
  //     });
  //     const combined = component.vm.combinedTags;
  //     expect(combined).toEqual(expectedTags);
  //   });
  // });
  // describe("showNoPositions", () => {
  //   it("should be true if the repertoires have no positions", () => {
  //     const component = shallowMount(LearnedViewModel, {
  //       localVue,
  //       store,
  //       render: jest.fn()
  //     });
  //     const show = component.vm.showNoPositions;
  //     expect(show).toBeTruthy();
  //   });
  //   it("should be false if either repertoire has more than the starting positions", () => {
  //     state.whiteRepertoire.training = new TrainingCollection();
  //     (state.whiteRepertoire.training
  //       .getTrainingForMove as jest.Mock).mockReturnValue(["anything"]);
  //     const component = shallowMount(LearnedViewModel, {
  //       localVue,
  //       store,
  //       render: jest.fn()
  //     });
  //     const show = component.vm.showNoPositions;
  //     expect(show).toBeFalsy();
  //   });
  // });
  // describe("plotData", () => {
  //   it("should get a pie chart for the unique positions on my turn of the selected tags", () => {
  //     const position = mockedRepertoirePosition();
  //     const trainedPositions = 3;
  //     const newPositions = 5;
  //     const positions = [
  //       ..._.times(trainedPositions, () => mockedRepertoirePosition(false)),
  //       ..._.times(newPositions, () => mockedRepertoirePosition(true)),
  //       mockedRepertoirePosition(false, false), // not myTurn, ignored
  //       mockedRepertoirePosition(true, false)
  //     ];
  //     position.VisitChildren = (fn: (position: RepertoirePosition) => void) => {
  //       _.forEach(positions, fn);
  //     };
  //     const component = shallowMount(LearnedViewModel, {
  //       localVue,
  //       store,
  //       render: jest.fn()
  //     });
  //     component.vm.selectedTags = [
  //       mockedRepertoireTag(position),
  //       mockedRepertoireTag(position)
  //     ];
  //     const plotData = component.vm.plotData;
  //     expect(plotData).toEqual([
  //       {
  //         type: "pie",
  //         hole: 0.7,
  //         labels: ["Trained", "New"],
  //         values: [trainedPositions, newPositions]
  //       }
  //     ]);
  //   });
  // });
});
