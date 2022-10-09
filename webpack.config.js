const path = require("path");

module.exports = {
  mode: "production",
  entry: path.resolve(__dirname, "./index.ts"),
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "./dist"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.ts/,
        use: ["babel-loader", "ts-loader"],
      },
    ],
  },
  externals: {
    axios: "axios",
  },
};
