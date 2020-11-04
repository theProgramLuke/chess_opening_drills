module.exports = {
  transpileDependencies: ["vuetify"],
  configureWebpack: {
    devtool: "source-map",
    target: "electron-renderer",
    module: {
      rules: [{ test: /chess.js/, parser: { amd: false } }],
    },
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        // options placed here will be merged with default configuration and passed to electron-builder
        appId: "com.electron.chessopeningdrills",
        productName: "Chess Opening Drills",
        linux: {
          category: "Game",
          target: "AppImage",
        },
        win: {
          target: [
            {
              target: "nsis",
              arch: ["x64", "ia32"],
            },
            {
              target: "portable",
            },
          ],
        },
      },
    },
  },
};
