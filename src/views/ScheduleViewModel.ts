import Vue from "vue";
import { mapState } from "vuex";
import _ from "lodash";

import { RepertoirePosition } from "@/store/repertoirePosition";

interface CalendarEvent {
  name: string;
  start: Date;
  timed: boolean;
  end?: Date;
  color?: string;
}

function eventsFromRepertoire(
  positions: RepertoirePosition[]
): CalendarEvent[] {
  const days: Record<string, number> = {};
  _.forEach(positions, position => {
    if (position.nextRepetitionTimestamp) {
      const date = new Date(position.nextRepetitionTimestamp);
      const day = `${date.getUTCFullYear()}-${date.getUTCMonth() +
        1}-${date.getUTCDate()}`;
      if (days[day]) {
        days[day]++;
      } else {
        days[day] = 1;
      }
    }
  });
  const events: CalendarEvent[] = [];

  _.forEach(days, (count, day) => {
    events.push({
      name: `${count} positions`,
      start: new Date(day),
      end: new Date(day),
      timed: false,
      color: "primary"
    });
  });

  return events;
}

export default Vue.extend({
  data: () => ({
    start: 0,
    end: 0
  }),

  computed: {
    ...mapState(["whiteRepertoire", "blackRepertoire"]),

    events(): CalendarEvent[] {
      return eventsFromRepertoire(
        _.concat(this.whiteRepertoire.positions, this.blackRepertoire.positions)
      );
    }
  },

  created(): void {
    this.start = _.now();
    this.end = _.now() + 7 * 4 * 24 * 60 * 60 * 1000; // Highlight the next 4 weeks
  }
});
