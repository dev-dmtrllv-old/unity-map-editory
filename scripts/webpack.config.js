const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlPlugin = require("html-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

const path = require("path");

const rootPath = path.join(__dirname, "..");
const resolve = (...parts) => path.resolve(rootPath, ...parts);

module.exports = {
	stats: "minimal",
	mode: "development",
	name: "app",
	entry: resolve("src/app/index.tsx"),
	output: {
		filename: "js/[name].bundle.js",
		path: resolve("dist", "app"),
		chunkFilename: "js/[chunkhash].chunk.js",
		publicPath: "./"
	},
	resolve: {
		extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
		plugins: [
			new TsconfigPathsPlugin({ configFile: resolve("tsconfig.json") })
		]
	},
	target: "electron-renderer",
	devtool: "source-map",
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: "ts-loader"
			},
			{
				test: /\.js$/,
				use: ["source-map-loader"],
				enforce: "pre"
			},
			{
				test: /\.s?(c|a)ss$/,
				use: [
					MiniCssExtractPlugin.loader,
					"css-loader",
					"sass-loader",
				],
				exclude: /node_modules/
			},
			{
				test: /\.(jpe?g|png|gif|svg|ico|webp)$/i,
				use: {
					loader: "url-loader",
					options: {
						fallback: "file-loader",
						limit: 40000,
						name: "images/[name].[ext]",
					},
				},
			}
		]
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: `css/[name].bundle.css`,
			chunkFilename: `css/[id].chunk.css`,
			ignoreOrder: false
		}),
		new HtmlPlugin({
			inject: false,
			template: resolve("src/index.html"),
			filename: "index.html"
		})
	]
};
