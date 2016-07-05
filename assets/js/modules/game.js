// 翻牌游戏class
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
			$maskCard: $(".mask-card"), // 卡片
			$maskClose: $(".mask-close"),
			$maskFnBtn: $(".mask-fn-btn"),
			$rstImg: $("#rstImg"),
			$maskLoading: $(".mask-loading"), // loading
			$maskDialogWrap: $(".mask-dialog"), // 对话框
			$dialogBox: $(".dialog-box"),
			$dialogBtnWrap: $(".dialog-btn-wrap"),
			$dialogTxt: $(".dialog-txt")

		}

	}

	// 初始化
	init() {

		var _this = this;
		var d = _this.doms;
		var o = _this.opt;
		var t = _this.timeLine;

		d.$loadingWrap.delay(500).fadeOut();
		// d.$loadingWrap.hide();

		_this.initAjaxConfig();
		// _this.createCardPanel();

		_this.showDialog({
			txt: '<p>当前城市与上次翻牌城市不一致!</p><p>是否切换回翻牌城市继续翻牌?</p>',
			confirmOnly: false,
			confirmTxt: '切换',
			cancelTxt: '否',
			confirm: function() {
				_this.createCardPanel();
			}
		});

	}

	initAjaxConfig() { // ajax配置

		var _this = this;
		var d = _this.doms;

		$.ajaxSetup({

			url: '/',
			type: 'get',
			dataType: 'json',
			data: {},
			beforeSend: _this.showLoading,
			complete: _this.hideLoading

		});
		
	}

	showLoading() {

		d.$maskWrap.show();
		d.$maskLoading.show();

	}

	hideLoading() {

		d.$maskWrap.hide();
		d.$maskLoading.hide();

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

					$(ele).hide();

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

			$self.removeClass('can-flip');

			// 签到ajax配置
			let _ajax = $.extend({}, o.ajaxConf.sign, {

				data: {
					uId: o.uId
				},

				success: function(data) {

					// 对该块进行动画操作
					_this.AnimateGoRotate($self);

				},

				error: function(xhr, status, err) {

					console.log(err);
					$self.addClass('can-flip');

				}

			});

			// 对该块进行动画操作
			_this.AnimateGoRotate($self);

			// ajax签到抽奖
			// $.ajax(_ajax);

		});

		// 给结果面板的关闭按钮绑定点击事件
		d.$maskClose.on('click', function() {

			t.to(d.$maskCard, .5, {

				rotationX: 270,
				scale: 0,
				opacity: 0,
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

				d.$maskCard.show();

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

	// 显示弹框
	showDialog(opt) {

		var _this = this;
		var d = _this.doms;
		var t = _this.timeLine;

		var defaults = {
			txt: '<p>弹框提示</p>', // 弹框提示文本(html)
			confirmOnly: false, // 是否只有确认按钮
			confirmTxt: '确认',
			cancelTxt: '取消',
			confirm: null,
			cancel: null
		}

		var opt = $.extend({}, defaults, opt);
		var btnStr;

		// 填充内容
		d.$dialogTxt.html(opt.txt);

		if (opt.confirmOnly) { // 如果只有确认按钮

			btnStr = `<a href="javascript:void(0);" class="btn-confirm btn-block">${opt.confirmTxt}</a>`;

		} else {

			btnStr = `
				<a href="javascript:void(0);" class="btn-confirm">${opt.confirmTxt}</a>
				<a href="javascript:void(0);" class="btn-cancel">${opt.cancelTxt}</a>
			`;

		}

		d.$dialogBtnWrap.html(btnStr);

		// 显示弹框
		_animateShowDialog();

		// 关闭弹框
		d.$dialogBtnWrap.delegate('.btn-confirm', 'click', function() {

			_animateHideDialog(function() {

				opt.confirm && opt.confirm();

			});

		});

		d.$dialogBtnWrap.delegate('.btn-cancel', 'click', function() {

			_animateHideDialog(function() {

				opt.cancel && opt.cancel();

			});

		});

		// 显示弹框动画
		function _animateShowDialog() {

			d.$maskWrap.show();
			d.$maskDialogWrap.fadeIn(function() {

				d.$dialogBox.show();

				t.to(d.$dialogBox, 0, {
					rotationY: 180,
					opacity: 0
				})
				.to(d.$dialogBox, 0, {
					rotationY: 180,
					opacity:0
				}, .4)
				.to(d.$dialogBox, .5, {
					rotationY: 0,
					opacity: 1,
					ease: Back.easeOut.config(0.8)
				});

			});

		}

		// 关闭弹框动画
		function _animateHideDialog(cb) {

			t.to(d.$dialogBox, .5, {
				rotationY: 180,
				opacity:0,
				ease: Back.easeIn.config(0.8),
				onComplete: function() {

					d.$dialogBox.hide();
					d.$maskDialogWrap.hide();
					d.$maskWrap.hide();

					cb && cb();
				}
			});

		}

	}
}

module.exports = Game;