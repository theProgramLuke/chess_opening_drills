module.exports = {
  preset: "@vue/cli-plugin-unit-jest/presets/typescript-and-babel",
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.ts",
    // vue CLI files
    "!src/shims-*.d.ts",
    "!src/registerServiceWorker.ts",
    "!src/main.ts",
    "!src/router/index.ts",
    "!src/background.ts",
    "!src/plugins/**",
    "!src/store/index.ts",
    // Generated Plotly themes
    "!src/views/PlotlyLayouts.ts",
    // List of themes
    "!src/views/ChessgroundThemes.ts",
    // typescript version of vue-chessboard
    "!src/components/common/chessboardViewModel.ts",
  ],
  moduleFileExtensions: ["ts", "js"],
  globals: {
    "vue-jest": {
      pug: { doctype: "html" },
    },
  },
  snapshotSerializers: ["jest-serializer-vue"],
  testPathIgnorePatterns: ["/.vscode/"],
};
