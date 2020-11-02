import "reflect-metadata";
import { Vue, Component, Watch } from "vue-property-decorator";
import { State } from "vuex-class";

interface MenuItem {
  name: string;
  route: string;
  icon: string;
  subtitle?: string;
}

export const baseMenuItems: MenuItem[] = [
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
    icon: "mdi-hospital-building",
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

  get menuItems(): MenuItem[] {
    return baseMenuItems;
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
