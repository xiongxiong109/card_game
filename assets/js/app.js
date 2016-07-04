// 引入jquery, 并把$变量挂载到全局
require('expose?$!jquery');

require('./modules/resize');

require('tweenMax');

// 游戏配置
let gameConfig = {

	num: 2, // 切分块数
	bgImg: __uri("/assets/img/gift.jpg"), // 大奖图片
	houseImg: __uri("/assets/img/house.jpg"), // 楼盘图片
	curIdx: 0, // 当前可以翻动的块(连续第几天签到)
	canFlip: true, // 是否可以翻动(今天是否已签到)
	uId: 123, // 当前抽奖用户的id, 用于与后端交互

	ajaxConf: { // ajax提交的配置

		sign: { // 签到提交
			url: '/getSign',
			type: 'post'
		},
		
		info: { // 获取用户当前签到信息
			url: '/getInfo',
			type: 'get'
		}

	}

};

{ // 翻牌游戏

	class Game {

		constructor(opt) {

			this.opt = opt;
			// 时间轴动画实例
			this.timeLine = new TimelineMax();

			this.doms = {

				$cardList: $(".card-box-list"),
				$counterNum: $(".counter-box em"),
				$loadingWrap: $(".loading-wrap"),
				$maskWrap: $(".mask-wrap"),
				$maskCard: $(".mask-card"),
				$maskClose: $(".mask-close"),
				$maskFnBtn: $(".mask-fn-btn"),
				$maskImg: $(".mask-img-wrap img")

			}

		}

		// 创建卡牌面板, 通过ajax获取响应的展示图片

		createCardPanel() {

			var _this = this;
			var d = _this.doms;
			var o = _this.opt;
			var t = _this.timeLine;

			// 大奖图片
			var bgImg = o.bgImg;
			// 活动楼盘图片
			var houseImg = o.houseImg;

			d.$loadingWrap.delay(1000).fadeOut();

			// 创建拼图
			_this.createCardItems(_this.opt.num, houseImg, function() {

				d.$cardList.css({
					'background-image': `url(${bgImg})`
				});

				_this.bindEvents();

			});

		}

		/** 创建拼图函数
		* @num: 拼图矩阵的宽高
		* @imgUrl: 拼图的背景图片
		* @cb: 创建完毕后的回调函数
		**/

		createCardItems(num, imgUrl, cb) {

			let _this = this;
			let d = _this.doms;
			let {pow, floor, random, round} = Math;
			let totalNum = pow(num, 2);

			let domStr = '';

			for (let i = 0; i < num; i++) {
				for (let j = 0; j < num; j++) {
					domStr += '<div class="card-item"></div>';
				}
			}

			d.$cardList.html(domStr);

			// 调整card-item的宽高、样式
			_this.reStyleCardItems(num, imgUrl, cb);

		}

		/** 重置卡片样式函数
		* @imgUrl: 背景图片url
		* @cb: 重置后的回调函数
		**/
		reStyleCardItems(num, imgUrl, cb) {

			const OFFSET = 2; // 间隙宽度
			const _this = this;

			var d = _this.doms;
			var o = _this.opt;

			var totalWidth = d.$cardList.width();
			var totalHeight = d.$cardList.height();

			var itemWidth = (totalWidth - OFFSET * num) / num;
			var itemHeight = (totalHeight - OFFSET * num) / num;

			var $cardItems = d.$cardList.find('.card-item');

			$cardItems.css({
				'margin': OFFSET / 2,
				'width': itemWidth,
				'height': itemHeight,
				'background-image': `url(${imgUrl})`,
				'background-size': totalWidth + 'px ' +totalHeight + 'px'
			});

			// 填写background-position 与 top、left
			let z = 0;
			for (let y = 0; y < num; y++) {
				for (let x = 0; x < num; x++) {
					$cardItems.eq(z++).css({
						'background-position': (- x * itemWidth) + 'px ' + (- y * itemHeight) + 'px',
						'left': itemWidth * x + OFFSET * x,
						'top': itemHeight * y + OFFSET * y
					});
				}
			}

			// 如果今天可以翻牌, 则给当前可以翻动的块加上高亮样式
			if (o.canFlip == true) {

				$cardItems.eq(o.curIdx).addClass('can-flip');

			}

			// 当前可翻牌，且不是最后一张牌
			if (o.curIdx < $cardItems.length) {

				// 将前面的牌给翻开
				$cardItems.each(function(idx, ele) {

					if (idx < o.curIdx) {

						$(ele).css('background-image', 'none');

					}

				});

			} else { // 表示翻牌结束
				//...
			}

			// 显示剩余天数
			d.$counterNum.text($cardItems.length - o.curIdx);

			// 执行回调函数
			cb && cb();

		}
		
		// 事件绑定, 给签到绑定点击事件
		bindEvents() {

			var _this = this;
			var d = _this.doms;
			var o = _this.opt;
			var t = _this.timeLine;

			var isRunning = false;

			// 给可以翻牌的卡片绑定点击事件
			d.$cardList.delegate('.can-flip', 'click', function() {

				let $self = $(this);

				// 签到ajax配置
				let _ajax = $.extend({}, o.ajaxConf.sign, {
					data: {
						uId: o.uId
					}
				}) ; 

				$self.removeClass('can-flip');

				// ajax签到抽奖
				// $.ajax(_ajax)
				// .done(function(data) {

				// 	console.log(data);

				// })
				// .fail(function(xhr, status, err) {

				// 	console.log(err);
				// 	$self.addClass('can-flip');

				// });

				// 对该块进行动画操作
				_this.AnimateGoRotate($self);

			});

			// 给结果面板的关闭按钮绑定点击事件
			d.$maskClose.on('click', function() {

				t.to(d.$maskCard, .5, {

					rotationX: 270,
					rotationY: 180,
					scale: 0,
					ease: Back.easeIn.config(1.2),
					onComplete: function() {

						d.$maskWrap.fadeOut(200);

					}

				});

			});

		}

		AnimateGoRotate($card) {

			let _this = this;
			let d = _this.doms;
			let t = _this.timeLine;

			// 让卡片的层级处于所有卡片的最高等级
			$card.css('zIndex', Math.pow(_this.opt.num, 2));

			// 卡片抖动
			t.add('shake');

			t.to($card, .2, {
				rotationY: 15,
				ease: Back.easeIn
			})
			.to($card, .2, {
				rotationY: -15,
				ease: Back.easeOut
			})
			.to($card, .2, {
				rotationY: 0
			})
			.to($card, .2, {
				rotationY: 0
			}, .6);

			// 卡片旋转
			t.add('rotateAndMove');
			t.to($card, 1, {
				rotationY: 720,
				left: (d.$cardList.width() - $card.width()) / 2 + 'px',
				top: (d.$cardList.height() - $card.height()) / 2 + 'px',
				ease: Power1.easeOut
			});

			t.add('scaleToNone');
			t.to($card, .5, {
				rotationX: 360,
				scale: 0,
				onComplete: function() {
					// ajax获取抽奖结果后, 弹出获奖框
					_showRst();
				}
			});

			// 显示抽奖结果
			function _showRst() {

				d.$maskWrap.fadeIn(100, function() {

					t.to(d.$maskCard, 0, {
						scale: 0,
						opacity: 0,
						rotationX: 360
					});

					t.to(d.$maskCard, .4, {
						scale: 1,
						opacity: 1,
						rotationX: 0,
						ease: Back.easeOut.config(0.6)
					});

				});

			}
		}
	}

	let cardGame = new Game(gameConfig);

	cardGame.createCardPanel();

	// 窗口大小改变时, 重置卡片的宽高
	$(window).on('resize', function() {

		cardGame.reStyleCardItems(gameConfig.num, gameConfig.houseImg);

	});
}