var webpack = require('webpack'),
	path = require('path'),
    minimize = process.argv.indexOf('--min') === -1 ? false : true,
    plugins = [];

minimize && plugins.push(new webpack.optimize.UglifyJsPlugin());

module.exports = {
	entry: './src/index.js',
	output: {
		path: path.join(__dirname, 'build'),
		filename: 'facebook-photo-selector.' + (minimize ? 'min.' : '') + 'js',
		libraryTarget: 'umd'
	},
	devtool: minimize ? 'source-map' : '',
	module: {
		loaders: [
			{
				test: path.join(__dirname, 'src'),
				loader: 'babel-loader',
				query: { presets: ['es2015'] }
			}
		]
	},
	plugins: plugins
};
