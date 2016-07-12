var webpack = require('webpack');

// 配置生产环境

// js代码压缩优化
var uglifyJs = new webpack.optimize.UglifyJsPlugin({

	output: {
		comments: false,
	},
	compress: {
		warnings: false
	}

});

// 开启生产环境模式, 启动时要通过NODE_ENV=production来启动
var define = new webpack.DefinePlugin({
	'process.env': {
		NODE_ENV: JSON.stringify(process.env.NODE_ENV),
	}
});

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
			'tweenMax': __dirname + '/assets/js/tweenMax/TweenMax.min.js',
			'fphJsBridge': __dirname + '/assets/js/modules/fphJsBridge.js'
		}
	},
	plugins: [
		uglifyJs,
		define
	]
}