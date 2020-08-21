import _ from "lodash";

export class TrainingEvent {
  correct: boolean;
  responseTimeSeconds: number;
  timestamp: number;

  constructor(correct: boolean, responseTimeSeconds: number) {
    this.correct = correct;
    this.responseTimeSeconds = responseTimeSeconds;
    this.timestamp = _.now();
  }
}
