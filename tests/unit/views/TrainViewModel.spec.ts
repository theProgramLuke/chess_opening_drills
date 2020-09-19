import { shallowMount } from "@vue/test-utils";

import TrainViewModel, { TrainingState } from "@/views/TrainViewModel.ts";

describe("TrainViewModel", () => {
  const mountComponent = () =>
    shallowMount(TrainViewModel, {
      render: jest.fn()
    });

  describe("isSelecting", () => {
    it("should be true when state is selecting", () => {
      const component = mountComponent();
      component.vm.state = TrainingState.Selecting;

      const actual = component.vm.isSelecting;

      expect(actual).toBeTruthy();
    });

    it.each([TrainingState.Training, TrainingState.Complete])(
      "should be false when state is not selecting (%s)",
      state => {
        const component = mountComponent();
        component.vm.state = state;

        const actual = component.vm.isSelecting;

        expect(actual).toBeFalsy();
      }
    );
  });

  describe("isTraining", () => {
    it("should be true when state is training", () => {
      const component = mountComponent();
      component.vm.state = TrainingState.Training;

      const actual = component.vm.isTraining;

      expect(actual).toBeTruthy();
    });

    it.each([TrainingState.Selecting, TrainingState.Complete])(
      "should be false when state is not training (%s)",
      state => {
        const component = mountComponent();
        component.vm.state = state;

        const actual = component.vm.isTraining;

        expect(actual).toBeFalsy();
      }
    );
  });

  describe("isComplete", () => {
    it("should be true when state is complete", () => {
      const component = mountComponent();
      component.vm.state = TrainingState.Complete;

      const actual = component.vm.isComplete;

      expect(actual).toBeTruthy();
    });

    it.each([TrainingState.Training, TrainingState.Selecting])(
      "should be false when state is not complete (%s)",
      state => {
        const component = mountComponent();
        component.vm.state = state;

        const actual = component.vm.isComplete;

        expect(actual).toBeFalsy();
      }
    );
  });

  describe("startTraining", () => {
    it("should set state to training", () => {
      const component = mountComponent();
      component.vm.state = TrainingState.Selecting;
      const options = "some options";

      component.vm.startTraining(options as any);
      const actualState = component.vm.state;
      const actualOptions = component.vm.trainingOptions;

      expect(actualState).toEqual(TrainingState.Training);
      expect(actualOptions).toBe(options);
    });
  });

  describe("onCompleted", () => {
    it("should set state to complete", () => {
      const component = mountComponent();
      component.vm.state = TrainingState.Training;

      component.vm.onCompleted();
      const actual = component.vm.state;

      expect(actual).toEqual(TrainingState.Complete);
    });
  });

  describe("reset", () => {
    it("should set state to selecting", () => {
      const component = mountComponent();
      component.vm.state = TrainingState.Complete;

      component.vm.reset();
      const actual = component.vm.state;

      expect(actual).toEqual(TrainingState.Selecting);
    });
  });
});
