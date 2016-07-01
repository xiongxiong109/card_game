module.exports = {
	entry: {
		"app": "./assets/js/app.js"
	},
	output: {
		"path": "./assets/js",
		"filename": "[name]_bundle.js"
	},
	module: {
		loaders: [
			{ // 使用es6
				test: /\.js$/, // 编译js文件, 使用babel语法
				exclude: /(node_modules|bower_lib)/,
				loader: 'babel',
				query: {
					presets: ['es2015']
				}
			}
		]
	},
	resolve: {
		alias: {
			'jquery': __dirname + '/bower_lib/jquery/dist/jquery.min.js',
			'zepto': __dirname + '/bower_lib/zepto/zepto.min.js',
			'underscore': __dirname + '/bower_lib/underscore/underscore-min.js',
			'tweenMax': __dirname + '/assets/js/tweenMax/TweenMax.min.js'
		}
	}
}