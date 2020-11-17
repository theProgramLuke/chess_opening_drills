import { Component, Vue } from "vue-property-decorator";
import { remote } from "electron";

@Component
export default class WelcomeViewModel extends Vue {
  get version(): string {
    return remote.app.getVersion();
  }
}
