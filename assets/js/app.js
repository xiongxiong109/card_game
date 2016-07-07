// zepto
require('zepto');

// resize模块, 动态计算页面尺寸
require('./modules/resize');

// 游戏主体
import Game from './modules/game';

// 游戏配置
import Config from './modules/config';


/**引入游戏开始前用户信息分析模块
 * @ 模块进行异步操作进行各种复杂的前期处理
 * @ 处理结束后, 返回所需的json, 并重写到gameConfig中, 然后根据gameConfig启动翻牌游戏
**/

var gameConfig = Config;
var getBootstrapInfo = require('./modules/getInfo');

{ // 翻牌游戏

	// 先异步获取用户基本信息(可能是通过与app的交互拿到)
	getBootstrapInfo(function(info) {

		$(".loading-wrap").css('background-color', 'rgba(33, 33, 33, 0.5)');

		// ajax获取用户签到信息
		// console.log(info);

		// $.ajax({
		// 	url: '/getSignInfo',
		// 	dataType: 'json',
		// 	data: info,
		// 	success: function(data) {
		// 		console.log(data);
		// 	},
		// 	error: function(xhr, status, err) {
		// 		console.log(err);
		// 	}
		// });

		let cardGame = new Game(gameConfig);
		cardGame.init();

		// 窗口大小改变时, 重置卡片的宽高
		$(window).on('resize', function() {

			cardGame.reStyleCardItems(gameConfig.num, gameConfig.houseImg);

		});

	});

}