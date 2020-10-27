import "reflect-metadata";
import { Vue, Component } from "vue-property-decorator";
import { State } from "vuex-class";
import _ from "lodash";

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
        if (moveTraining && moveTraining.scheduledRepetitionTimestamp) {
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

@Component
export default class ScheduleViewModel extends Vue {
  start = 0;
  end = 0;

  @State
  whiteRepertoire!: Repertoire;

  @State
  blackRepertoire!: Repertoire;

  get events(): CalendarEvent[] {
    return eventsFromRepertoire([this.whiteRepertoire, this.blackRepertoire]);
  }

  created(): void {
    this.start = _.now();
    this.end = _.now() + 7 * 4 * 24 * 60 * 60 * 1000; // Highlight the next 4 weeks
  }
}
