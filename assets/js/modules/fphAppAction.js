// 与app的交互方法

require('fphJsBridge');

// 配置所需调用app接口的jsBridge

fph.config({
	debug: true, 
	apiList: [
		'getUserInfo', // 获取用户信息
		'closeViewPage', // 关闭当前webview
		'goToProperty', // 跳转楼盘详情
		'goToLogin', // 调用登录面板
	]
});

// 获取用户信息
function getInfo(cb) {
	
	var rst = {
		t: '1f3s2df13sd', // 密钥
		_t: 'fasd132asd', // 用户登录密钥
		city: '上海市', // 选择城市
		current_city: '北京市', // 当前城市
		lt: '121.424712,31.176326'  // 定位经纬度
	}

	// 调用app方法, 获取用户信息
	// fph.getUserInfo({

	// 	success: function(data) {
	// 		cb && cb(data);
	// 	}

	// });

	setTimeout(function() {

		cb && cb(rst);
		
	}, 1000);

}

// 关闭当前窗口(点击关闭按钮时, 先走php接口释放资源, 然后调app方法关闭当前窗口)

function closePage(cb) {

	fph.closeViewPage();

}

// 跳转楼盘详情

function goToProperty(pid) {

	fph.goToProperty({pid: pid});

}

// 跳转登录面板

function goToLogin() {

	fph.goToLogin();

}

module.exports = {getInfo, closePage, goToProperty, goToLogin};