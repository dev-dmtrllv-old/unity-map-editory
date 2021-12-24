const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

const path = require("path");

const rootPath = path.join(__dirname, "..");
const resolve = (...parts) => path.resolve(rootPath, ...parts);

const config = {
	mode: "development",
	entry: {
		main: resolve("src/main/index.ts"),
	},
	stats: "minimal",
	target: "electron-main",
	name: "main",
	devtool: "cheap-module-source-map",
	output: {
		path: resolve("dist"),
		filename: "[name].bundle.js"
	},
	resolve: {
		extensions: [".ts", ".tsx", ".js", ".json", ".jsx"],
		plugins: [
			new TsconfigPathsPlugin({ configFile: resolve("main.tsconfig.json") })
		]
	},
	context: rootPath,
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /(node_modules|build)/,
				loader: "ts-loader",
				options: {
					configFile: resolve("main.tsconfig.json")
				}
			},
			{
				test: /\.js$/,
				use: ["source-map-loader"],
				enforce: "pre"
			}
		]
	}
};

module.exports = config;
