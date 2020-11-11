import { Vue, Prop, Watch, Component } from "vue-property-decorator";
import Plotly, { Layout, Config, PlotData } from "plotly.js";
import _ from "lodash";

import { PlotlyWhite, PlotlyDark } from "@/views/PlotlyLayouts";

@Component
export default class PlotViewModel extends Vue {
  @Prop({ required: true })
  options!: Config;

  @Prop({ required: true })
  data!: PlotData[];

  @Prop({ required: true })
  layout!: Layout;

  @Prop({ required: false, default: false })
  dark!: boolean;

  @Watch("data", { deep: true })
  onDataChanged(): void {
    this.react();
  }

  @Watch("options", { deep: true })
  onOptionsChanged(): void {
    this.react();
  }

  @Watch("layout", { deep: true })
  onLayoutChanged(): void {
    Plotly.relayout(this.plotRootElement, this.internalLayout);
  }

  mounted(): void {
    this.react();
  }

  beforeDestroy(): void {
    Plotly.purge(this.plotRootElement);
  }

  private react(): void {
    Plotly.react(
      this.plotRootElement,
      this.internalData,
      this.internalLayout,
      this.internalOptions
    );
  }

  private get internalLayout(): Layout {
    return {
      ...(this.dark ? PlotlyDark.layout : PlotlyWhite.layout),
      ...this.layout,
    };
  }

  private get internalData(): PlotData[] {
    return _.map(this.data, dataEntry => {
      return _.merge(dataEntry, this.dark ? PlotlyDark.data : PlotlyWhite.data);
    });
  }

  private get internalOptions(): Config {
    const opts: Config = this.options || {};

    opts.responsive = true;

    return opts;
  }

  private get plotRootElement(): HTMLElement {
    return this.$refs.container as HTMLElement;
  }
}
