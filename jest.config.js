module.exports = {
  preset: "@vue/cli-plugin-unit-jest/presets/typescript-and-babel",
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.{js,ts,vue}",
    // vue CLI files
    "!src/shims-*.d.ts",
    "!src/registerServiceWorker.ts",
    "!src/main.ts",
    "!src/router/index.ts",
    "!src/background.ts",
    "!src/plugins/**",
    // Generated pegjs file
    "!src/store/pgnGrammar.ts",
    // Generated Plotly themes
    "!src/views/PlotlyLayouts.ts",
    // List of themes
    "!src/views/ChessgroundThemes.ts"
  ],
  moduleFileExtensions: ["ts", "vue", "js"],
  transform: {
    ".*\\.(vue)$": "<rootDir>/node_modules/vue-jest"
  },
  globals: {
    "vue-jest": {
      pug: { doctype: "html" }
    }
  }
};
