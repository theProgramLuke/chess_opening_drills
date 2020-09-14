import Plotly from "plotly.js";
import _ from "lodash";
import debounce from "lodash/debounce";
import defaults from "lodash/defaults";

import { PlotlyWhite, PlotlyDark } from "@/views/PlotlyLayouts";

const events = [
  "click",
  "hover",
  "unhover",
  "selecting",
  "selected",
  "restyle",
  "relayout",
  "autosize",
  "deselect",
  "doubleclick",
  "redraw",
  "animated",
  "afterplot"
];

const functions = [
  "restyle",
  "relayout",
  "update",
  "addTraces",
  "deleteTraces",
  "moveTraces",
  "extendTraces",
  "prependTraces",
  "purge"
];

const methods = functions.reduce((all, funcName) => {
  all[funcName] = function(...args) {
    return Plotly[funcName](...[this.$refs.container].concat(args));
  };
  return all;
}, {});

export default {
  props: {
    watchShallow: {
      type: Boolean,
      default: false
    },
    options: {
      type: Object
    },
    data: {
      type: Array
    },
    layout: {
      type: Object
    },
    dark: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      datarevision: 1
    };
  },
  computed: {
    internalLayout() {
      return {
        ...(this.dark ? PlotlyDark.layout : PlotlyWhite.layout),
        ...this.layout,
        datarevision: 0
      };
    },
    internalData() {
      return _.map(this.data, datum => {
        return _.merge(datum, this.dark ? PlotlyDark.data : PlotlyWhite.data);
      });
    }
  },
  mounted() {
    this.react();
    this.initEvents();

    this.$watch(
      "data",
      () => {
        this.internalLayout.datarevision++;
        this.react();
      },
      { deep: !this.watchShallow }
    );

    this.$watch("options", this.react, { deep: !this.watchShallow });
    this.$watch("layout", this.relayout, { deep: !this.watchShallow });
  },
  beforeDestroy() {
    this.__generalListeners.forEach(obj =>
      this.$refs.container.removeAllListeners(obj.fullName)
    );
    Plotly.purge(this.$refs.container);
  },
  methods: {
    initEvents() {
      this.__generalListeners = events.map(eventName => {
        return {
          fullName: "plotly_" + eventName,
          handler: (...args) => {
            this.$emit(...[eventName].concat(args));
          }
        };
      });

      this.__generalListeners.forEach(obj => {
        this.$refs.container.on(obj.fullName, obj.handler);
      });
    },
    ...methods,
    toImage(options) {
      const el = this.$refs.container;
      const opts = defaults(options, {
        format: "png",
        width: el.clientWidth,
        height: el.clientHeight
      });

      return Plotly.toImage(this.$refs.container, opts);
    },
    downloadImage(options) {
      const el = this.$refs.container;
      const opts = defaults(options, {
        format: "png",
        width: el.clientWidth,
        height: el.clientHeight,
        filename: (el.layout.title || "plot") + " - " + new Date().toISOString()
      });

      return Plotly.downloadImage(this.$refs.container, opts);
    },
    plot() {
      return Plotly.plot(
        this.$refs.container,
        this.internalData,
        this.internalLayout,
        this.getOptions()
      );
    },
    getOptions() {
      const el = this.$refs.container;
      let opts = this.options;

      // if width/height is not specified for toImageButton, default to el.clientWidth/clientHeight
      if (!opts) opts = {};
      if (!opts.toImageButtonOptions) opts.toImageButtonOptions = {};
      if (!opts.toImageButtonOptions.width)
        opts.toImageButtonOptions.width = el.clientWidth;
      if (!opts.toImageButtonOptions.height)
        opts.toImageButtonOptions.height = el.clientHeight;
      opts.responsive = true;
      return opts;
    },
    newPlot() {
      return Plotly.newPlot(
        this.$refs.container,
        this.internalData,
        this.internalLayout,
        this.getOptions()
      );
    },
    react() {
      return Plotly.react(
        this.$refs.container,
        this.internalData,
        this.internalLayout,
        this.getOptions()
      );
    }
  }
};