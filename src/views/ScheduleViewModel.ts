import "reflect-metadata";
import { Vue, Component } from "vue-property-decorator";
import { State } from "vuex-class";
import _ from "lodash";

import { Repertoire } from "@/store/repertoire/Repertoire";

interface CalendarEvent {
  name: string;
  start: Date;
  timed: boolean;
  end?: Date;
  color?: string;
}

function eventsFromRepertoire(repertoire: Repertoire): CalendarEvent[] {
  // const days: Record<string, number> = {};
  // _.forEach(positions, position => {
  //   if (position.nextRepetitionTimestamp) {
  //     const date = new Date(position.nextRepetitionTimestamp);
  //     const day = `${date.getUTCFullYear()}-${date.getUTCMonth() +
  //       1}-${date.getUTCDate()}`;
  //     if (days[day]) {
  //       days[day]++;
  //     } else {
  //       days[day] = 1;
  //     }
  //   }
  // });
  // const events: CalendarEvent[] = [];

  // _.forEach(days, (count, day) => {
  //   events.push({
  //     name: `${count} positions`,
  //     start: new Date(day),
  //     end: new Date(day),
  //     timed: false,
  //     color: "primary"
  //   });
  // });

  // return events;
  // TODO
  return [];
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
    return _.concat(
      eventsFromRepertoire(this.whiteRepertoire),
      eventsFromRepertoire(this.blackRepertoire)
    );
  }

  created(): void {
    this.start = _.now();
    this.end = _.now() + 7 * 4 * 24 * 60 * 60 * 1000; // Highlight the next 4 weeks
  }
}
