import "reflect-metadata";
import { Vue, Component } from "vue-property-decorator";
import { State } from "vuex-class";
import _ from "lodash";
import now from "lodash/now";
import { DateTime, Duration } from "luxon";

import { Repertoire } from "@/store/repertoire/Repertoire";
import { TrainingMoveSpecification } from "@/store/repertoire/TrainingCollection";

interface CalendarEvent {
  name: string;
  start: number;
  timed: boolean;
  end?: number;
  color?: string;
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
    return ScheduleViewModel.eventsFromRepertoire([
      this.whiteRepertoire,
      this.blackRepertoire,
    ]);
  }

  private static getScheduledTrainingFromRepertoire(
    repertoire: Repertoire
  ): number[] {
    const scheduledTrainings: number[] = [];

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
          scheduledTrainings.push(moveTraining.scheduledRepetitionTimestamp);
        }
      }
    );

    return scheduledTrainings;
  }

  private static calendarEventFromDays(days: _.Dictionary<DateTime[]>) {
    const events: CalendarEvent[] = [];

    _.forEach(days, (scheduledTrainings, day) => {
      let date = DateTime.fromISO(day);

      // We need to make a JS date, so offset the timezone so
      // it will still be the correct day.
      const offset = Duration.fromObject({
        minutes: date.offset,
      });
      date = date.plus(offset);
      date = date.plus(Duration.fromObject({ days: 1 }));

      events.push({
        name: `${scheduledTrainings.length} moves`,
        start: date.toMillis(),
        timed: false,
        color: "primary",
      });
    });
    return events;
  }

  private static eventsFromRepertoire(
    repertoires: Repertoire[]
  ): CalendarEvent[] {
    const scheduledTrainings: number[] = [];

    _.forEach(repertoires, repertoire =>
      scheduledTrainings.push(
        ...ScheduleViewModel.getScheduledTrainingFromRepertoire(repertoire)
      )
    );

    const scheduledDates = _.filter(
      _.map(scheduledTrainings, scheduled =>
        DateTime.fromMillis(scheduled, { zone: "UTC" })
      ),
      date => date.isValid
    );

    const days = _.groupBy(scheduledDates, date => date.toISODate());

    const events: CalendarEvent[] = ScheduleViewModel.calendarEventFromDays(
      days
    );

    return events;
  }
}
