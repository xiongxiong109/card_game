// 启用 fis-spriter-csssprites 插件

// 使用less
fis.match("style.less", {
	rExt: '.css',
	parser: fis.plugin('less'),
	optimizer: fis.plugin('clean-css'),
	useSprite: true // 开启雪碧图插件
});

fis.match('::package', {
  spriter: fis.plugin('csssprites')
});

// 代码压缩、优化、打包
fis.media('pro')
.match('*', {
	release: '/public/static/activity/flip/$0',
	url: '/static/activity/flip$0'
})
.match("app_bundle.js", { // 压缩js
	optimizer: fis.plugin('uglify-js')
})
.match('style.less', {
	optimizer: fis.plugin('clean-css')
})
.match('*.png', {
	optimizer: fis.plugin('png-compressor')
});