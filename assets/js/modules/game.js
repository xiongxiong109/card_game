
// 翻牌游戏class
class Game {

	constructor(opt) {

		this.opt = opt;
		this.binded = false; // 单例绑定事件, 当第一次执行bindEvents的时候, 将该值置为true, 从此以后将再也无法重复绑定事件
		this.isChanging = false; // 换一张按钮防止多次点击
		// 引入app交互方法
		this.Act = require('./fphAppAction');

		this.doms = {

			$cardList: $(".card-box-list"),
			$counterNum: $(".counter-box em"),
			$loadingWrap: $(".loading-wrap"),
			$mainWrap: $(".main-wrap"),

			$maskWrap: $(".mask-wrap"),
			$maskCard: $(".mask-card"), // 卡片
			$maskClose: $(".mask-close"),
			$maskLoading: $(".mask-loading"), // loading

			$maskDialogWrap: $(".mask-dialog"), // 对话框
			$dialogBox: $(".dialog-box"),
			$dialogBtnWrap: $(".dialog-btn-wrap"),
			$dialogTxt: $(".dialog-txt"),
			$switchCard: $(".switch-card"),
			$footerTipBox: $(".footer-tip-box"),

			$maskRstWrap: $(".mask-rst-wrap"), // 抽奖结果
			$maskFnBtn: $(".mask-fn-btn"),
			$maskTip: $(".mask-tip"),
			$rstImg: $("#rstImg")

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

			// 渲染活动规则与大奖提供方等等
			_this.renderTxt();

			// 解冻换一张按钮
			_this.isChanging = false;

			// 状态机
			if (flipInfo.has_flip == 1) { // 有有效活动

				if (flipInfo.is_change == 1) { // 有换一张

					d.$switchCard.show();

				} else { // 没有换一张

					d.$switchCard.remove();

				}

				if (flipInfo.is_invalid == 0) { // 没有违规, 可继续翻牌, 走正常的翻牌初始化

					_this.createCardPanel();

				} else { // 已经违规 1,2,3,4

					// console.log(_this.opt.flipInfo);
					if (flipInfo.is_invalid == 1) { // 无法完成, 但是可以换一张;

						_this.showDialog({
							txt: `<p>${flipInfo.msg}</p>`,
							confirmOnly:true,
							confirm: function() {

								// 点击确定后, 直接换一张
								_this.changeAnotherCard({type: 1});

							}
						});

					} else if (flipInfo.is_invalid == 2) { // 无法完成,活动结束

						_this.showDialog({

							txt: `<p>${flipInfo.msg}</p>`,
							confirmOnly: true

						});

					} else if (flipInfo.is_invalid == 3) { // 无法完成,重新翻牌或换一张

						_this.showDialog({

							txt: `<p>${flipInfo.msg}</p>`,
							confirmTxt: '重新翻牌',
							cancelTxt: '换一张',
							confirm: function() {
								// type = 2: 重新翻牌
								_this.changeAnotherCard({type: 2});
							},
							cancel: function() {
								// type = 1: 换一张
								_this.changeAnotherCard({type: 1});
							}

						});

					} else if (flipInfo.is_invalid == 4) { // 无法完成,重新翻牌

						_this.showDialog({

							txt: `<p>${flipInfo.msg}</p>`,
							confirmOnly:true,
							confirm: function() {
								// 点击后重新翻牌
								_this.changeAnotherCard({type: 2});

							}

						});

					}

				}

			} else { // 无有效活动, 提示msg并关闭

				_this.showDialog({
					txt: `<p>${flipInfo.msg}</p>`,
					confirmOnly: true,
					confirm: function() {
						// // 退出翻牌
						_this.exitFlip();
					} 
				});

			}

			_this.bindEvents();

		});

	}

	// 拼接活动信息相关dom
	renderTxt() {

		var _this = this;
		var o = _this.opt;
		var d = _this.doms;
		var {flipInfo} = o;

		var domStr = '';

		if (!$.isEmptyObject(flipInfo.flip_rule)) { // 活动规则

			domStr += `<p>${flipInfo.flip_rule}</p>`;

		}

		if (!$.isEmptyObject(flipInfo.offer)) { // 活动大奖提供方

			if (flipInfo.offer === '房品汇') {

				domStr += `<p>本次大奖提供方：${flipInfo.offer}</p>`

			} else {

				domStr += `
				<p>
					本次大奖提供方：${flipInfo.offer}
					<a href="javascript:void(0);" class="go-house" data-pid="${flipInfo.pid}">查看楼盘</a>
				</p>
				`;
			}
		}

		d.$footerTipBox.html(domStr);

	}

	// 渲染抽奖结果
	renderRst(obj) {

		var _this = this;
		var d = _this.doms;
		// d.$maskRstWrap
		// d.$maskFnBtn
		// d.$maskTip
		// d.$rstImg
		if ($.isEmptyObject(obj.gift) || obj.had_gift == 2) { // 奖项为空或者没有抽到奖

			d.$rstImg[0].className = 'suprise-icon icon-empty';
			d.$maskRstWrap.html(`<p>很遗憾，今天什么都没捞着！</p>`);
			d.$maskFnBtn.html(`<p class="close-btn">随便逛逛</p>`); // 点随便逛逛, 关闭当前翻翻乐

		} else {

			if (obj.is_over == 1) { // 活动已结束, 这是最后一张牌, 应该展示大奖

				d.$rstImg[0].className = 'suprise-icon icon-special';

			} else {

				if (obj.gift.type == 1) { // 礼品券
					d.$rstImg[0].className = 'suprise-icon icon-sale';
				} else if (obj.gift.type == 2) { // 路费宝
					d.$rstImg[0].className = 'suprise-icon icon-hongbao';
				}

			}
			
			d.$maskRstWrap.html(`
				<p>恭喜您，获得<em>“${obj.gift.name}”</em>奖励!</p>
				<p>为自己的坚持点个赞吧!</p>
			`);

			d.$maskFnBtn.html(`<p class="check-gift-btn">查看我的奖励</p>`); // 点查看我的奖励, 跳转到我的礼券
			d.$maskTip.html(`<p>领取规则见“我的奖励”</p>`);

		}

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

			timeout: 2000,

			success: function(data) {

				// 判断退出接口是否正常
				if (data.status != 200) {

					_this.showDialog({
						txt: `<p>${data.msg}</p>`,
						confirmOnly:true
					});

					return false;

				}

				var returnObj = data.returnObject;

				if (!$.isEmptyObject(returnObj)) {

				}

				_this.Act.closePage();
				
			}

		});

		// _this.Act.closePage();
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
		var {flipInfo} = o;

		// 大奖图片
		var bgImg = flipInfo.gift_img;
		// 活动楼盘图片
		var houseImg = flipInfo.flip_img;

		// 创建拼图
		_this.createCardItems(flipInfo.flip_model, houseImg, function() {

			d.$cardList.css({
				'background-image': `url(${bgImg})`
			});

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

		var beforeNums = $cardItems.length - parseInt(o.flipInfo.surplus_times);
		// 如果今天可以翻牌, 则给当前可以翻动的块加上高亮样式(只在创建的时候加上can-flip, 调整宽高样式的时候不能做添加高亮处理)
		if (o.flipInfo.is_can_flip == 1) {

			$cardItems.eq(beforeNums).addClass('can-flip');

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

		let beforeNums = $cardItems.length - parseInt(o.flipInfo.surplus_times);
		// 当前可翻牌，且不是最后一张牌
		if ( beforeNums >= 0) {

			// 将前面的牌给翻开
			$cardItems.each(function(idx, ele) {

				if (idx < beforeNums) {

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

		var {surplus_times} = o.flipInfo;

		var $cardItems = $(".card-item");

		var disDay = Math.max(parseInt(surplus_times), 0);

		d.$counterNum.text(disDay);

	}	
	// 事件绑定, 给签到绑定点击事件
	bindEvents() {

		var _this = this;
		var d = _this.doms;
		var o = _this.opt;

		var isRunning = false;

		// bindEvents方法在页面不刷新的情况下, 只会执行一次
		if (!_this.binded) {

			_this.binded = true;

		} else {

			return false;

		}

		// 给可以翻牌的卡片绑定点击事件
		d.$cardList.delegate('.can-flip', 'tap', function() {

			let $self = $(this);
			$self.removeClass('can-flip');

			// 更新用户登录信息
			_this.Act.getInfo(function(info) {

				// 签到ajax配置
				let _ajax = $.extend({}, o.ajaxApi.clickFlip, {

					data: {
						t: o.userInfo.t, 
						_t: o.userInfo._t,
						flip_id: o.flipInfo.flip_id,
						city: o.userInfo.city
					},

					success: function(data) {

						// 判断签到程序是否正常
						if (data.status != 200) {

							_this.showDialog({
								txt: `<p>${data.msg}</p>`,
								confirmOnly: true,
								confirm: function() {
									$self.addClass('can-flip');
								}
							});

							return false;

						}

						let {returnObject} = data;

						if (!$.isEmptyObject(returnObject)) {

							if (returnObject.is_invalid == 1) { // 活动已失效

								_this.showDialog({

									txt: `<p>${returnObject.msg}</p>`,
									confirmOnly: true,
									confirmTxt: '朕知道了',
									confirm: function() {

										$self.addClass('can-flip');

									}

								});

							} else { // 活动还没失效

								if (returnObject.is_change == 1) { // 需要切换城市

									_this.showDialog({

										txt: '<p>当前城市与上次翻牌城市不一致!</p><p>是否切换回翻牌城市继续翻牌?</p>',
										confirmOnly: false,
										confirmTxt: '切换',
										cancelTxt: '否',
										confirm: function() { // 关闭翻牌webview, 回首页
											_this.Act.goToIndex();
										},
										cancel: function() { // 不做任何处理
											$self.addClass('can-flip');
										}

									});

								} else { 
									
									if (returnObject.is_can_flip == 1) { // 可以翻牌

										// 渲染抽奖结果
										_this.renderRst(returnObject);
										// 对该块进行动画操作
										_this.AnimateGoRotate($self);
										// 计算剩余天数
										o.flipInfo.surplus_times--;
										_this.countDisDay();

									} else {

										_this.showDialog({
											txt: `<p>你今天已经翻过牌啦, 明天再过来吧</p>`,
											confirmOnly: true
										});

									}

								}

							}

						}

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

				$.extend(_this.opt.userInfo, info);

				if (!_this.opt.userInfo.isLogined) { // 如果用户未登录, 打开app的登录面板
					
					$self.addClass('can-flip');
					_this.Act.goToLogin();
					return false;

				} else {

					// ajax签到抽奖
					$.ajax(_ajax);

				}

			});

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

					d.$maskCard.removeClass('visible');
					d.$maskWrap.hide();

				});

			});

		});

		// 阻止事件冒泡
		d.$maskCard.on('tap', function(e) {

			e.stopPropagation();

		});

		// 点击遮罩区域也可以收起卡片
		d.$maskWrap.on('tap', function() {

			if( d.$maskCard.hasClass('visible') ) {

				d.$maskClose.trigger('tap');

			}

		});

		// 随便逛逛, 点击后关闭退出
		d.$maskFnBtn.delegate('.close-btn', 'tap', function() {

			d.$maskClose.trigger('tap');
			setTimeout(function() {
				_this.exitFlip();
			}, 500);

		});

		// 查看我的奖励, 点击后调用app方法, 跳转我的礼券页面
		d.$maskFnBtn.delegate('.check-gift-btn', 'tap', function() {
			
			_this.Act.goToGift();

		});

		// 查看楼盘按钮, 点击后跳转app的楼盘详情页面
		d.$footerTipBox.delegate('.go-house', 'tap', function() {
			
			var pid = $(this).data('pid');
			// console.log(pid);
			_this.Act.goToProperty(pid);

		});

		// 左上角关闭按钮
		d.$mainWrap.delegate('.close-btn', 'tap', function() {

			_this.exitFlip();

		});

		// 换一张
		d.$mainWrap.delegate('.switch-card', 'tap', function() {

			_this.changeAnotherCard({type: 1});

		});
	}

	// 换一张ajax
	changeAnotherCard(obj) {

		var _this = this;
		var d = _this.doms;
		var o = _this.opt;
		var type = obj.type || 1; // 根据传入的type是1 还是2 来判断是换一张还是重新开始

		// 换一张配置
		var _ajax = $.extend({}, o.ajaxApi.change, {

			data: {
				t: o.userInfo.t,
				_t: o.userInfo._t,
				flip_id: o.flipInfo.flip_id,
				city: o.userInfo.city,
				current_city: o.userInfo.current_city,
				lt: o.userInfo.lt,
				type: type
			},

			success(data) {

				// 点击换一张时判断是否正确处理
				if (data.status != 200) {

					_this.showDialog({
						txt: `<p>${data.msg}</p>`,
						confirmOnly: true,
						confirm: function() {
							_this.isChanging = false;
						}
					});

					return false;

				}

				// 清空记录, 刷新翻牌
				_this.isChanging = false;
				let {returnObject} = data;
				if (!$.isEmptyObject(returnObject)) {

					// console.log(returnObject);

					if (returnObject.is_invalid == 0) { // 翻牌没有失效

						// 重置游戏数据
						$.extend(o.flipInfo, returnObject);
						_this.clearAndRestart();

					} else {
						
						_this.showDialog({

							txt: `<p>${returnObject.msg}</p>`,
							confirmOnly: true

						});

					}

				} 

			}

		});

		// 如果用户已经翻过牌(剩余天数小于总天数, 则认为翻过牌)
		if( parseInt(o.flipInfo.surplus_times) < Math.pow(parseInt(o.flipInfo.flip_model), 2) ) {

			_this.showDialog({
				txt: '<p>您之前的翻牌记录将被重置，下次将重头开始，确认要换一张吗?</p>',
				confirmTxt: '是的',
				cancelTxt: '算了',
				confirm: function() {
					
					if (!_this.isChanging) {

						_this.isChanging = true;
						$.ajax(_ajax);

					}

				}

			});

		} else { // 否则, 点击后直接进行切换

			if (!_this.isChanging) {

				_this.isChanging = true;
				$.ajax(_ajax);

			}

		}
	}
	// 清空记录, 重新翻牌
	clearAndRestart() {

		var _this = this;
		var d = _this.doms;
		var o = _this.opt;

		let counter = 0;

		d.$cardList.css('background-image', 'none');
		var $cards = d.$cardList.find('.card-item');

		$cards.each(function(idx, ele) {

			var $self = $(ele);
			var curL = $self.offset().left;
			var curT = $self.offset().top;

			$self.animate({
				'left': (d.$cardList.width() - $self.width()) / 2,
				'top': (d.$cardList.height() - $self.height()) / 2,
				'scale': '0',
				'opacity': 0,
				'rotateY': `${-idx * 15}deg`,
				'rotateX': `${idx * 15}deg`
			}, Math.random() * 300 + 300, 'ease-in', function() {

				$self.remove();
				counter++;

				if (counter >= $cards.length) {

					_this.init();

				}

			});

		});
	}

	AnimateGoRotate($card) {

		let _this = this;
		let d = _this.doms;
		let t = _this.timeLine;

		// 让卡片的层级处于所有卡片的最高等级
		$card.css('z-index', Math.pow(_this.opt.flipInfo.flip_model, 2));

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
				.addClass('visible') // 处于可见状态
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
				opt.confirm = null;
				opt.cancel = null;
			});

		});

		d.$dialogBtnWrap.delegate('.btn-cancel', 'tap', function() {

			_animateHideDialog(function() {

				opt.cancel && opt.cancel();
				opt.confirm = null;
				opt.cancel = null;

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