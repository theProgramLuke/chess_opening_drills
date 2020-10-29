import "reflect-metadata";
import { Vue, Component } from "vue-property-decorator";
import { State } from "vuex-class";
import _ from "lodash";
import now from "lodash/now";

import { Repertoire } from "@/store/repertoire/Repertoire";
import { TrainingMoveSpecification } from "@/store/repertoire/TrainingCollection";

interface CalendarEvent {
  name: string;
  start: Date;
  timed: boolean;
  end?: Date;
  color?: string;
}

function eventsFromRepertoire(repertoires: Repertoire[]): CalendarEvent[] {
  const days: Record<string, number> = {};

  _.forEach(repertoires, repertoire => {
    _.forEach(
      repertoire.training.getMoves(),
      (trainingMove: TrainingMoveSpecification) => {
        const moveTraining = repertoire.training.getTrainingForMove(
          trainingMove.fen,
          trainingMove.san
        );
        if (
          moveTraining &&
          !_.isUndefined(moveTraining.scheduledRepetitionTimestamp)
        ) {
          const date = new Date(moveTraining.scheduledRepetitionTimestamp);
          const day = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;

          if (days[day]) {
            days[day]++;
          } else {
            days[day] = 1;
          }
        }
      }
    );
  });

  const events: CalendarEvent[] = [];

  _.forEach(days, (count, day) => {
    const daySplits: number[] = _.map(_.split(day, "-"), split =>
      _.toNumber(split)
    );

    events.push({
      name: `${count} positions`,
      start: new Date(daySplits[0], daySplits[1], daySplits[2]),
      end: new Date(daySplits[0], daySplits[1], daySplits[2]),
      timed: false,
      color: "primary"
    });
  });

  return events;
}

const millisecondsPerMonth = 7 * 4 * 24 * 60 * 60 * 1000;

@Component
export default class ScheduleViewModel extends Vue {
  start = now();
  end = now() + millisecondsPerMonth; // Highlight the next 4 weeks;

  @State
  whiteRepertoire!: Repertoire;

  @State
  blackRepertoire!: Repertoire;

  get events(): CalendarEvent[] {
    return eventsFromRepertoire([this.whiteRepertoire, this.blackRepertoire]);
  }
}
