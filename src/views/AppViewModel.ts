import "reflect-metadata";
import { Vue, Component, Watch } from "vue-property-decorator";
import { State } from "vuex-class";
import _ from "lodash";
import { Repertoire } from "@/store/repertoire/Repertoire";

export interface NavigationMenuItem {
  name: string;
  route: string;
  icon: string;
  subtitle?: string;
}

export const baseMenuItems: NavigationMenuItem[] = [
  {
    name: "Edit",
    route: "/edit",
    icon: "mdi-file-tree",
  },
  {
    name: "Train",
    route: "/train",
    icon: "mdi-play",
  },
  {
    name: "Schedule",
    route: "/schedule",
    icon: "mdi-calendar",
  },
  {
    name: "Reports",
    route: "/reports",
    icon: "mdi-chart-bar",
  },
  {
    name: "Repertoire Health",
    route: "/health",
    icon: "mdi-hospital",
  },
  {
    name: "Settings",
    route: "/settings",
    icon: "mdi-wrench",
  },
];

@Component
export default class AppViewModel extends Vue {
  drawer = true;
  recomputeMenuItems = 0;

  @State
  whiteRepertoire!: Repertoire;

  @State
  blackRepertoire!: Repertoire;

  @State
  darkMode!: boolean;

  @State
  primary!: string;

  @State
  secondary!: string;

  @State
  accent!: string;

  @State
  error!: string;

  @State
  warning!: string;

  @State
  info!: string;

  @State
  success!: string;

  get menuItems(): NavigationMenuItem[] {
    const menuItems = _.cloneDeep(baseMenuItems);

    _.forEach(
      _.filter(menuItems, menuItem => menuItem.route === "/health"),
      menuItem => {
        menuItem.subtitle = this.repertoireHealthSubtitle;
      }
    );

    return menuItems;
  }

  private get repertoireHealthSubtitle(): string | undefined {
    this.recomputeMenuItems;

    const warningCount =
      AppViewModel.countRepertoireMultipleMoves(this.whiteRepertoire) +
      AppViewModel.countRepertoireMultipleMoves(this.blackRepertoire);

    if (warningCount === 0) {
      return undefined;
    } else {
      return `${warningCount} warnings`;
    }
  }

  private static countRepertoireMultipleMoves(repertoire: Repertoire): number {
    const multipleMoves = repertoire.training.getPositionsWithMultipleTrainings();

    return _.size(multipleMoves);
  }

  @Watch("darkMode")
  onDarkModeChange(darkMode: boolean): void {
    this.$vuetify.theme.dark = darkMode;
  }

  @Watch("primary")
  onPrimaryColorChange(primary: string): void {
    this.$vuetify.theme.currentTheme.primary = primary;
  }

  @Watch("secondary")
  onSecondaryColorChange(secondary: string): void {
    this.$vuetify.theme.currentTheme.secondary = secondary;
  }

  @Watch("accent")
  onAccentColorChange(accent: string): void {
    this.$vuetify.theme.currentTheme.accent = accent;
  }

  @Watch("error")
  onErrorColorChange(error: string): void {
    this.$vuetify.theme.currentTheme.error = error;
  }

  @Watch("warning")
  onWarningColorChange(warning: string): void {
    this.$vuetify.theme.currentTheme.warning = warning;
  }

  @Watch("info")
  onInfoColorChange(info: string): void {
    this.$vuetify.theme.currentTheme.info = info;
  }

  @Watch("primary")
  onSuccessColorChange(success: string): void {
    this.$vuetify.theme.currentTheme.success = success;
  }

  created() {
    this.initializeTheme();

    this.$store.subscribe(mutation => {
      if (
        mutation.type === "addRepertoireMove" ||
        mutation.type === "removeRepertoireMove"
      ) {
        ++this.recomputeMenuItems;
      }
    });
  }

  private initializeTheme() {
    this.onDarkModeChange(this.darkMode);
    this.onPrimaryColorChange(this.primary);
    this.onSecondaryColorChange(this.secondary);
    this.onAccentColorChange(this.accent);
    this.onErrorColorChange(this.error);
    this.onWarningColorChange(this.warning);
    this.onInfoColorChange(this.info);
    this.onSuccessColorChange(this.success);
  }
}
