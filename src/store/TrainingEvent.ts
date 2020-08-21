import _ from "lodash";

export class TrainingEvent {
  attempts: number;
  responseTimeSeconds: number;
  timestamp: number;

  constructor(attempts: number, responseTimeSeconds: number) {
    this.attempts = attempts;
    this.responseTimeSeconds = responseTimeSeconds;
    this.timestamp = _.now();
  }
}
