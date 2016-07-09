// zepto
require('zepto');

// resize模块, 动态计算页面尺寸
require('./modules/resize');

// 游戏主体
import Game from './modules/game';

// 游戏配置
import Config from './modules/config';

// 引入app交互方法
const Act = require('./modules/fphAppAction');

/**引入游戏开始前用户信息分析模块
 * @ 模块进行异步操作进行各种复杂的前期处理
 * @ 处理结束后, 返回所需的json, 并重写到gameConfig中, 然后根据gameConfig启动翻牌游戏
**/

var gameConfig = Config;

{ // 翻牌游戏

	// 先通过app异步获取用户基本信息
	Act.getInfo(function(rst) {

		// 将用户信息扩展到gameConfig.userInfo上去
		$.extend(gameConfig.userInfo, rst);

		$(".loading-wrap").css('background-color', 'rgba(33, 33, 33, 0.5)');

		// 初始化ajax加载失败提示, 做好容错处理
		let $failWrap = $(".fail-wrap");

		// 点击按钮重新请求
		$failWrap.delegate('.reload-btn', 'tap', function(e) {

			e.preventDefault();

			_hideError(function() {
				
				setTimeout(function() {

					$.ajax(_ajax);

				}, 300);

			});
			
		});

		// 根据用户信息获取用户活动信息
		var _ajax = $.extend({}, gameConfig.ajaxApi.info, {

			data: rst,
			success: function(data) { // 拿到翻牌信息
				
				// 将翻牌信息扩展到gameConfig的flipInfo信息上
				if (!$.isEmptyObject(data.returnObject)) {

					$.extend(gameConfig.flipInfo, data.returnObject);

					// 确保信息无误后, 启动游戏
					let cardGame = new Game(gameConfig);

					cardGame.init();

					// 添加窗口尺寸变化监听
					$(window).on('resize', function() {

						cardGame.reStyleCardItems(gameConfig.flipInfo.flip_model, gameConfig.flipInfo.flip_img);

					});

				} else {

					_showError();

				}

			},
			error: function(xhr, status, err) {
				_showError();
			}

		});

		$.ajax(_ajax);

		function _showError() {

			$failWrap.animate({

				'left': '100%',

			}, 0, function() {

				$failWrap.show()
				.animate({
					'left': 0
				}, 300, 'ease');

			});

		}


		function _hideError(fn) {

			$failWrap.animate({

				'left': '100%'

			}, 300, 'ease', function() {

				$failWrap.hide();
				fn && fn();

			});

		}

	});

}