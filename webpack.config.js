const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const DotenvWebpackPlugin = require("dotenv-webpack");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

module.exports = (env, argv) => {
	let mode = argv.mode || "development";
	let isProd = mode === "production" ? true : false;
	let isStats = env.stats || false;

	console.log(`this mode is: ${mode}.`, `is Production ${isProd}.`);

	return {
		mode,
		entry: "./src/index.js",
		output: {
			filename: isProd ? "js/[name].[contenthash].js" : "[name].js",
			path: path.resolve(__dirname, "dist"),
			publicPath: "/",
			clean: true,
			assetModuleFilename: isProd
				? "images/[contenthash][ext]"
				: "images/[name][ext]",
		},

		devServer: {
			static: path.resolve(__dirname, "dist"),
			port: 3000,
			hot: true,
			historyApiFallback: true,
			compress: true,
			client: {
				logging: "error",
				overlay: {
					errors: true,
					warnings: false,
				},
				reconnect: false,
			},
		},

		devtool: isProd ? false : "source-map",

		module: {
			rules: [
				// js|jsx
				{
					test: /\.jsx?$/i,
					exclude: /(node_modules|bower_components)/,
					use: {
						loader: "babel-loader",
						options: {
							presets: [
								["@babel/preset-env", { useBuiltIns: "usage", corejs: 3.24 }],
								["@babel/preset-react", { runtime: "automatic" }],
							],
							plugins: [!isProd && "react-refresh/babel"].filter(Boolean),
						},
					},
				},

				//sass|css
				{
					test: /\.(css|scss|sass)$/i,
					use: [
						(isProd && MiniCssExtractPlugin.loader) || "style-loader",
						"css-loader",
						{
							loader: "postcss-loader",
							options: { postcssOptions: { plugins: ["postcss-preset-env"] } },
						},
						"sass-loader",
					],
				},

				// assets/resources
				{
					test: /\.(jpe?g|gif)$/i,
					type: "asset/resource",
				},
				{
					test: /\.svg$/i,
					type: "asset/inline",
				},
				{
					test: /\.png$/i,
					type: "asset",
					parser: {
						dataUrlCondition: {
							maxSize: 10 * 1024,
						},
					},
				},
			],
		},

		resolve: {
			extensions: [".js", ".jsx"],
			alias: {
				"~": path.resolve(__dirname, "src"),
			},
		},

		plugins: [
			new HtmlWebpackPlugin({
				template: path.resolve(__dirname, "src/template.html"),
			}),
			new MiniCssExtractPlugin({
				filename: "css/[name].[contenthash].css",
			}),
			new DotenvWebpackPlugin({}),
			!isProd && new ReactRefreshWebpackPlugin(),
			isProd && new WebpackManifestPlugin(),
			isStats &&
				new BundleAnalyzerPlugin({
					generateStatsFile: true,
					analyzerPort: "auto",
				}),
		].filter(Boolean),

		optimization: {
			runtimeChunk: "single",
			splitChunks: {
				cacheGroups: {
					vendor: {
						name: "node_vendors",
						test: /[\\/]node_modules[\\/]/,
						chunks: "all",
					},
					styles: {
						name: "styles",
						test: /\.css$/,
						chunks: "all",
						enforce: true,
					},
				},
			},
		},
	};
};
