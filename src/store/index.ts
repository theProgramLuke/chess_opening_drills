import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    darkMode: true,
    repertoire: {
      white: [{}],
      black: [{}]
    }
  },
  mutations: {
    setDarkMode: (state, darkMode) => (state.darkMode = darkMode)
  },
  actions: {},
  modules: {},
  strict: process.env.NODE_ENV !== "production"
});
