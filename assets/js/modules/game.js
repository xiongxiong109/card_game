
// 翻牌游戏class
class Game {

	constructor(opt) {

		this.opt = opt;

		// 引入app交互方法
		this.Act = require('./fphAppAction');

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

		_this.hideInitLoading(function() {

			_this.initAjaxConfig();

			let {flipInfo, userInfo} = o;

			// 状态机
			if (flipInfo.has_flip == 1) { // 1.有有效活动

				if (flipInfo.is_invalid == 1) { // 已经违规

					if (flipInfo.is_change == 1) { // 是否可以换一张
						
						_this.showDialog({
							txt: '<p>很遗憾，您已无法完成翻牌活动，换一张试试~</p>',
							confirmTxt: '好的',
							cancelTxt: '算了',
							cancel: function() {
								// 退出翻牌
								_this.exitFlip();
							}
						});

					} else {
						console.log('已经违规, 并且不可换了');
					}

				} else { // 没有违规, 可继续翻牌, 走正常的翻牌初始化

					console.log('start');

				}

			} else { // 2.无有效活动, 提示msg并关闭

				_this.showDialog({
					txt: `<p>${flipInfo.msg}</p>`,
					confirmOnly: true,
					confirm: function() {
						// // 退出翻牌
						_this.exitFlip();
					} 
				});

			}

			// 检测翻牌城市
			// _this.showDialog({

			// 	txt: '<p>当前城市与上次翻牌城市不一致!</p><p>是否切换回翻牌城市继续翻牌?</p>',
			// 	confirmOnly: false,
			// 	confirmTxt: '切换',
			// 	cancelTxt: '否',
			// 	confirm: function() { // 关闭翻牌webview, 回首页
			// 		_this.createCardPanel();
			// 	},
			// 	cancel: function() { // 不做任何处理

			// 	}

			// });

		});

	}

	// 退出翻牌, 先调用api的退出接口, 调用成功后, 调用app的退出方法
	exitFlip() {

		var _this = this;
		var o = _this.opt;

		var _ajax = $.extend({}, o.ajaxApi.exit, {

			data: {
				t: o.userInfo.t,
				_t: o.userInfo._t,
				flip_id: o.flipInfo.flip_id
			},

			success: function(data) {
				console.log(data);

				_this.Act.closePage();
				
			}

		});

		$.ajax(_ajax);

	}
	// 隐藏初始loading框
	hideInitLoading(fn) {

		var _this = this;
		var d = _this.doms;

		d.$loadingWrap.animate({
			'opacity': 0
		}, 300, function() {

			d.$loadingWrap.hide();
			
			fn && fn();

		});
	}

	// ajax配置
	initAjaxConfig() { 

		var _this = this;
		var d = _this.doms;

		$.extend($.ajaxSettings, {

			timeout: 5000, // ajax超时限制: 5000ms
			beforeSend: function() {
				_this.showAjaxLoading();
			},

			complete: function() {
				_this.hideAjaxLoading();
			},

			error: function(xhr, status, err) {

				_this.showDialog({

					txt: `<p>${err}</p>`,
					confirmOnly: true

				});

			}

		});
		
	}

	showAjaxLoading() {

		var d = this.doms;

		d.$maskWrap.css('opacity', 1).show();
		d.$maskLoading.css('opacity', 1).show();

	}

	hideAjaxLoading(err) {

		var _this = this;
		var d = _this.doms;

		d.$maskWrap.hide().css('opacity', 0);
		d.$maskLoading.hide().css('opacity', 0);

	}

	// 创建卡牌面板, 通过ajax获取响应的展示图片

	createCardPanel() {

		var _this = this;
		var d = _this.doms;
		var o = _this.opt;

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
		let o = _this.opt;
		let {pow} = Math;
		let totalNum = pow(num, 2);
		let domStr = '';
		let $cardItems;

		for (let i = 0; i < num; i++) {
			for (let j = 0; j < num; j++) {
				domStr += '<div class="card-item"></div>';
			}
		}

		d.$cardList.html(domStr);

		// 调整card-item的宽高、样式
		_this.reStyleCardItems(num, imgUrl, cb);

		$cardItems = $(".card-item"); // 更新最新dom

		// 如果今天可以翻牌, 则给当前可以翻动的块加上高亮样式(只在创建的时候加上can-flip, 调整宽高样式的时候不能做添加高亮处理)
		if (o.canFlip == true) {

			$cardItems.eq(o.curIdx).addClass('can-flip');

		}

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
			$cardItems.remove();
		}

		// 显示剩余天数, 最小不能小于0了
		_this.countDisDay();

		// 执行回调函数
		cb && cb();

	}
	
	// 计算剩余天数	
	countDisDay() {

		var _this = this;
		var o = _this.opt;
		var d = _this.doms;
		var $cardItems = $(".card-item");

		var disDay = Math.max($cardItems.length - o.curIdx, 0);
		d.$counterNum.text(disDay);

	}	
	// 事件绑定, 给签到绑定点击事件
	bindEvents() {

		var _this = this;
		var d = _this.doms;
		var o = _this.opt;

		var isRunning = false;

		// 给可以翻牌的卡片绑定点击事件
		d.$cardList.delegate('.can-flip', 'tap', function() {

			let $self = $(this);

			$self.removeClass('can-flip');

			// 签到ajax配置
			let _ajax = $.extend({}, o.ajaxApi.sign, {

				data: {
					uId: o.uId
				},

				success: function(data) {

					// 对该块进行动画操作
					_this.AnimateGoRotate($self);
					// 计算剩余天数
					o.curIdx++;
					_this.countDisDay();
					// 渲染抽奖结果
					// ...

				},

				error: function(xhr, status, err) {

					_this.showDialog({

						txt: `<p>${err}</p>`,
						confirmOnly: true,
						confirm: function() {

							$self.addClass('can-flip');

						}
					});

				}

			});

			// 对该块进行动画操作
			// _this.AnimateGoRotate($self);

			// 计算剩余天数
			// o.curIdx++;
			// _this.countDisDay();

			// ajax签到抽奖
			$.ajax(_ajax);

		});

		// 给结果面板的关闭按钮绑定点击事件
		d.$maskClose.on('tap', function() {

			d.$maskCard.animate({

				'opacity': 0,
				'translateY': '-50%',
				'rotateX': '180deg',
				'scale': 0

			}, 500, 'cubic-bezier(.73,-0.34,.63,.99)', function() {

				d.$maskWrap.animate({

					'opacity': 0

				}, 400, function() {

					d.$maskWrap.hide();

				});

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
		// t.add('rotateAndMove');
		$card.animate({

			'rotateY': '720deg',
			'rotateX': '0deg',
			'scale': '1',
			'left': (d.$cardList.width() - $card.width()) / 2 + 'px',
			'top': (d.$cardList.height() - $card.height()) / 2 + 'px'

		}, 1000, 'ease-out', function() {

			setTimeout(function() {

				$card.animate({

					'rotateX': '-180deg',
					'scale': '0.1',
					'opacity': 0

				}, 500, 'cubic-bezier(.55,-0.41,.79,.77)', function() {

					// 显示抽奖结果
					_showRst();

				});

			}, 400);

		});

		// 显示抽奖结果
		function _showRst() {

			d.$maskWrap
			.animate({

				'opacity': 0

			}, 0, function() {

				d.$maskWrap
				.show()
				.animate({

					'opacity': 1

				}, 300, 'ease', function() {

					_showCard();

				});

			});

		}

		function _showCard() {

			d.$maskCard.animate({

				'opacity': 0,
				'translateY': '-50%',
				'rotateX': '180deg',
				'scale': 0

			}, 0, function() {

				d.$maskCard
				.show()
				.animate({

					'opacity': 1,
					'translateY': '-50%',
					'rotateX': '0',
					'scale': 1

				}, 400, 'cubic-bezier(.36,.66,.46,1.22)')

			});
		}
	}

	// 显示弹框
	showDialog(opt) {

		var _this = this;
		var d = _this.doms;

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
		setTimeout(function() {

			_animateShowDialog();

		}, 400);

		// 关闭弹框
		d.$dialogBtnWrap.delegate('.btn-confirm', 'tap', function() {

			_animateHideDialog(function() {

				opt.confirm && opt.confirm();

			});

		});

		d.$dialogBtnWrap.delegate('.btn-cancel', 'tap', function() {

			_animateHideDialog(function() {

				opt.cancel && opt.cancel();

			});

		});

		// 显示弹框动画
		function _animateShowDialog() {

			d.$maskWrap.css('opacity', 0)
			.show()
			.animate({
				'opacity': 1
			}, 300);

			d.$maskDialogWrap.animate({
				'opacity': 0
			}, 0, function() {

				d.$maskDialogWrap
				.show()
				.animate({
					'opacity': 1,
				}, 400, function() {

					_animateShowDialogBox();

				});
			});

			function _animateShowDialogBox() {

				d.$dialogBox
				.show()
				.animate({

					'translateX': '-50%',
					'translateY': '-50%',
					'scale': '0',
					'opacity': 0

				}, 0, function() {

					d.$dialogBox
					.animate({

						'translateX': '-50%',
						'translateY': '-50%',
						'scale': '1',
						'opacity': 1

					}, 400, 'cubic-bezier(.17,.67,.48,1.31)');

				});

			}

		}

		// 关闭弹框动画
		function _animateHideDialog(cb) {

			d.$dialogBox.animate({

				'translateX': '-50%',
				'translateY': '-50%',
				'scale': '0',
				'opacity':0,

			}, 400, 'cubic-bezier(.67,-0.38,.97,.99)', function() {

				d.$dialogBox.hide();
				d.$maskDialogWrap.hide();

				d.$maskWrap.animate({
					'opacity': 0
				}, 400, function() {

					d.$maskWrap.hide();
					cb && cb();

				});


			});

		}

	}
}

module.exports = Game;