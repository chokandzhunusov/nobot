module.exports = {
  entry: "./src/app.js",
  output: {
    filename: "bundle.js"
  },

  devServer: {
    inline: true
  },

  resolve: {
    alias: {
      vue: 'vue/dist/vue.js'
    }
  },

  module: {
    loaders: [
      {
        test: /\.scss$/,
        loaders: ["style-loader", "css-loader", "sass-loader"]
      }
    ]
  }
};
