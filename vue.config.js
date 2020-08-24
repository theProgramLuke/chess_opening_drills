module.exports = {
  transpileDependencies: ["vuetify"],
  configureWebpack: {
    devtool: "source-map",
    target: "electron-renderer",
    module: {
      rules: [{ test: /chess.js/, parser: { amd: false } }]
    }
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        // options placed here will be merged with default configuration and passed to electron-builder
        linux: {
          category: "Game",
          target: "AppImage"
        },
        win: {
          target: "portable"
        }
      }
    }
  }
};
