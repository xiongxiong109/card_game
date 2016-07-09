/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _game = __webpack_require__(1);

	var _game2 = _interopRequireDefault(_game);

	var _config = __webpack_require__(4);

	var _config2 = _interopRequireDefault(_config);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// zepto
	__webpack_require__(5);

	// resize模块, 动态计算页面尺寸
	__webpack_require__(6);

	// 游戏主体


	// 游戏配置


	// 引入app交互方法
	var Act = __webpack_require__(2);

	/**引入游戏开始前用户信息分析模块
	 * @ 模块进行异步操作进行各种复杂的前期处理
	 * @ 处理结束后, 返回所需的json, 并重写到gameConfig中, 然后根据gameConfig启动翻牌游戏
	**/

	var gameConfig = _config2.default;

	{
			// 翻牌游戏

			// 先通过app异步获取用户基本信息
			Act.getInfo(function (rst) {

					// 将用户信息扩展到gameConfig.userInfo上去
					$.extend(gameConfig.userInfo, rst);

					$(".loading-wrap").css('background-color', 'rgba(33, 33, 33, 0.5)');

					// 初始化ajax加载失败提示, 做好容错处理
					var $failWrap = $(".fail-wrap");

					// 点击按钮重新请求
					$failWrap.delegate('.reload-btn', 'tap', function (e) {

							e.preventDefault();

							_hideError(function () {

									setTimeout(function () {

											$.ajax(_ajax);
									}, 300);
							});
					});

					// 根据用户信息获取用户活动信息
					var _ajax = $.extend({}, gameConfig.ajaxApi.info, {

							data: rst,
							success: function success(data) {
									// 拿到翻牌信息

									// 将翻牌信息扩展到gameConfig的flipInfo信息上
									if (!$.isEmptyObject(data.returnObject)) {
											(function () {

													$.extend(gameConfig.flipInfo, data.returnObject);

													// 确保信息无误后, 启动游戏
													var cardGame = new _game2.default(gameConfig);

													cardGame.init();

													// 添加窗口尺寸变化监听
													$(window).on('resize', function () {

															cardGame.reStyleCardItems(gameConfig.flipInfo.flip_model, gameConfig.flipInfo.flip_img);
													});
											})();
									} else {

											_showError();
									}
							},
							error: function error(xhr, status, err) {
									_showError();
							}

					});

					$.ajax(_ajax);

					function _showError() {

							$failWrap.animate({

									'left': '100%'

							}, 0, function () {

									$failWrap.show().animate({
											'left': 0
									}, 300, 'ease');
							});
					}

					function _hideError(fn) {

							$failWrap.animate({

									'left': '100%'

							}, 300, 'ease', function () {

									$failWrap.hide();
									fn && fn();
							});
					}
			});
	}

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	// 翻牌游戏class

	var Game = function () {
			function Game(opt) {
					_classCallCheck(this, Game);

					this.opt = opt;
					this.binded = false; // 单例绑定事件, 当第一次执行bindEvents的时候, 将该值置为true, 从此以后将再也无法重复绑定事件
					// 引入app交互方法
					this.Act = __webpack_require__(2);

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

					};
			}

			// 初始化


			_createClass(Game, [{
					key: "init",
					value: function init() {

							var _this = this;
							var d = _this.doms;
							var o = _this.opt;

							_this.hideInitLoading(function () {

									_this.initAjaxConfig();

									var flipInfo = o.flipInfo;
									var userInfo = o.userInfo;

									// 渲染活动规则与大奖提供方等等

									_this.renderTxt();

									// 状态机
									if (flipInfo.has_flip == 1) {
											// 有有效活动

											if (flipInfo.is_invalid == 1) {
													// 已经违规

													if (flipInfo.is_change == 1) {
															// 已经违规, 但是可以换一张

															_this.showDialog({
																	txt: '<p>很遗憾，您已无法完成翻牌活动，换一张试试~</p>',
																	confirmTxt: '好的',
																	cancelTxt: '算了',

																	confirm: function confirm() {

																			d.$switchCard.show();
																	},

																	cancel: function cancel() {
																			// 退出翻牌
																			_this.exitFlip();
																	}

															});
													} else {
															// 已经违规并且不可换一张了, 提示

															d.$switchCard.remove();

															_this.showDialog({
																	txt: '<p>很遗憾，您已无法完成翻牌活动，活动结束~</p>',
																	confirmOnly: true,
																	confirmTxt: '朕知道了'
															});
													}
											} else {
													// 没有违规, 可继续翻牌, 走正常的翻牌初始化

													if (flipInfo.is_change == 1) {
															// 如果可以换一张

															d.$switchCard.show();
													} else {
															d.$switchCard.remove();
													}

													_this.createCardPanel();
											}
									} else {
											// 无有效活动, 提示msg并关闭

											_this.showDialog({
													txt: "<p>" + flipInfo.msg + "</p>",
													confirmOnly: true,
													confirm: function confirm() {
															// // 退出翻牌
															_this.exitFlip();
													}
											});
									}
							});
					}

					// 拼接活动信息相关dom

			}, {
					key: "renderTxt",
					value: function renderTxt() {

							var _this = this;
							var o = _this.opt;
							var d = _this.doms;
							var flipInfo = o.flipInfo;


							var domStr = '';

							if (!$.isEmptyObject(flipInfo.flip_rule)) {
									// 活动规则

									domStr += "<p>" + flipInfo.flip_rule + "</p>";
							}

							if (!$.isEmptyObject(flipInfo.offer)) {
									// 活动大奖提供方

									if (flipInfo.offer === '房品汇') {

											domStr += "<p>本次大奖提供方：" + flipInfo.offer + "</p>";
									} else {

											domStr += "\n\t\t\t\t<p>\n\t\t\t\t\t本次大奖提供方：" + flipInfo.offer + "\n\t\t\t\t\t<a href=\"javascript:void(0);\" class=\"go-house\" data-pid=\"" + flipInfo.pid + "\">查看楼盘</a>\n\t\t\t\t</p>\n\t\t\t\t";
									}
							}

							d.$footerTipBox.html(domStr);
					}

					// 渲染抽奖结果

			}, {
					key: "renderRst",
					value: function renderRst(obj) {

							var _this = this;
							var d = _this.doms;
							// d.$maskRstWrap
							// d.$maskFnBtn
							// d.$maskTip
							// d.$rstImg
							if ($.isEmptyObject(obj.gift) || obj.had_gift == 2) {
									// 奖项为空或者没有抽到奖

									d.$rstImg[0].className = 'suprise-icon icon-empty';
									d.$maskRstWrap.html("<p>很遗憾，今天什么都没捞着！</p>");
									d.$maskFnBtn.html("<p class=\"close-btn\">随便逛逛</p>"); // 点随便逛逛, 关闭当前翻翻乐
							} else {

									if (obj.gift.type == 1) {
											// 礼品券
											d.$rstImg[0].className = 'suprise-icon icon-sale';
									} else if (obj.gift.type == 2) {
											// 路费宝
											d.$rstImg[0].className = 'suprise-icon icon-hongbao';
									}

									d.$maskRstWrap.html("\n\t\t\t\t<p>恭喜您，获得<em>“" + obj.gift.name + "”</em>奖励!</p>\n\t\t\t\t<p>为自己的坚持点个赞吧!</p>\n\t\t\t");

									d.$maskFnBtn.html("<p class=\"check-gift-btn\">查看我的奖励</p>"); // 点查看我的奖励, 跳转到我的礼券
									d.$maskTip.html("<p>领取规则见“我的奖励”</p>");
							}
					}

					// 退出翻牌, 先调用api的退出接口, 调用成功后, 调用app的退出方法

			}, {
					key: "exitFlip",
					value: function exitFlip() {

							var _this = this;
							var o = _this.opt;

							var _ajax = $.extend({}, o.ajaxApi.exit, {

									data: {
											t: o.userInfo.t,
											_t: o.userInfo._t,
											flip_id: o.flipInfo.flip_id
									},

									success: function success(data) {

											var returnObj = data.returnObject;

											if (!$.isEmptyObject(returnObj)) {}

											_this.Act.closePage();
									}

							});

							$.ajax(_ajax);
					}
					// 隐藏初始loading框

			}, {
					key: "hideInitLoading",
					value: function hideInitLoading(fn) {

							var _this = this;
							var d = _this.doms;

							d.$loadingWrap.animate({
									'opacity': 0
							}, 300, function () {

									d.$loadingWrap.hide();

									fn && fn();
							});
					}

					// ajax配置

			}, {
					key: "initAjaxConfig",
					value: function initAjaxConfig() {

							var _this = this;
							var d = _this.doms;

							$.extend($.ajaxSettings, {

									timeout: 5000, // ajax超时限制: 5000ms
									beforeSend: function beforeSend() {
											_this.showAjaxLoading();
									},

									complete: function complete() {
											_this.hideAjaxLoading();
									},

									error: function error(xhr, status, err) {

											_this.showDialog({

													txt: "<p>" + err + "</p>",
													confirmOnly: true

											});
									}

							});
					}
			}, {
					key: "showAjaxLoading",
					value: function showAjaxLoading() {

							var d = this.doms;

							d.$maskWrap.css('opacity', 1).show();
							d.$maskLoading.css('opacity', 1).show();
					}
			}, {
					key: "hideAjaxLoading",
					value: function hideAjaxLoading(err) {

							var _this = this;
							var d = _this.doms;

							d.$maskWrap.hide().css('opacity', 0);
							d.$maskLoading.hide().css('opacity', 0);
					}

					// 创建卡牌面板, 通过ajax获取响应的展示图片

			}, {
					key: "createCardPanel",
					value: function createCardPanel() {

							var _this = this;
							var d = _this.doms;
							var o = _this.opt;
							var flipInfo = o.flipInfo;

							// 大奖图片

							var bgImg = flipInfo.gift_img;
							// 活动楼盘图片
							var houseImg = flipInfo.flip_img;

							// 创建拼图
							_this.createCardItems(flipInfo.flip_model, houseImg, function () {

									d.$cardList.css({
											'background-image': "url(" + bgImg + ")"
									});

									_this.bindEvents();
							});
					}

					/** 创建拼图函数
	    * @num: 拼图矩阵的宽高
	    * @imgUrl: 拼图的背景图片
	    * @cb: 创建完毕后的回调函数
	    **/

			}, {
					key: "createCardItems",
					value: function createCardItems(num, imgUrl, cb) {

							var _this = this;
							var d = _this.doms;
							var o = _this.opt;
							var pow = Math.pow;

							var totalNum = pow(num, 2);
							var domStr = '';
							var $cardItems = void 0;

							for (var i = 0; i < num; i++) {
									for (var j = 0; j < num; j++) {
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

			}, {
					key: "reStyleCardItems",
					value: function reStyleCardItems(num, imgUrl, cb) {

							var OFFSET = 2; // 间隙宽度
							var _this = this;

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
									'background-image': "url(" + imgUrl + ")",
									'background-size': totalWidth + 'px ' + totalHeight + 'px'
							});

							// 填写background-position 与 top、left
							var z = 0;
							for (var y = 0; y < num; y++) {
									for (var x = 0; x < num; x++) {
											$cardItems.eq(z++).css({
													'background-position': -x * itemWidth + 'px ' + -y * itemHeight + 'px',
													'left': itemWidth * x + OFFSET * x,
													'top': itemHeight * y + OFFSET * y
											});
									}
							}

							var beforeNums = $cardItems.length - parseInt(o.flipInfo.surplus_times);
							// 当前可翻牌，且不是最后一张牌
							if (beforeNums >= 0) {

									// 将前面的牌给翻开
									$cardItems.each(function (idx, ele) {

											if (idx < beforeNums) {

													$(ele).hide();
											}
									});
							} else {
									// 表示翻牌结束

									//...
									$cardItems.remove();
							}

							// 显示剩余天数, 最小不能小于0了
							_this.countDisDay();

							// 执行回调函数
							cb && cb();
					}

					// 计算剩余天数	

			}, {
					key: "countDisDay",
					value: function countDisDay() {

							var _this = this;
							var o = _this.opt;
							var d = _this.doms;

							var surplus_times = o.flipInfo.surplus_times;


							var $cardItems = $(".card-item");

							var disDay = Math.max(parseInt(surplus_times), 0);

							d.$counterNum.text(disDay);
					}
					// 事件绑定, 给签到绑定点击事件

			}, {
					key: "bindEvents",
					value: function bindEvents() {

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
							d.$cardList.delegate('.can-flip', 'tap', function () {

									var $self = $(this);

									$self.removeClass('can-flip');

									// 签到ajax配置
									var _ajax = $.extend({}, o.ajaxApi.clickFlip, {

											data: {
													uId: o.uId
											},

											success: function success(data) {
													var returnObject = data.returnObject;


													if (!$.isEmptyObject(returnObject)) {

															if (returnObject.is_invalid == 1) {
																	// 活动已失效

																	_this.showDialog({

																			txt: "<p>" + returnObject.msg + "</p>",
																			confirmOnly: true,
																			confirmTxt: '朕知道了',
																			confirm: function confirm() {

																					$self.addClass('can-flip');
																			}

																	});
															} else {
																	// 活动还没失效

																	if (returnObject.is_change == 1) {
																			// 需要切换城市

																			_this.showDialog({

																					txt: '<p>当前城市与上次翻牌城市不一致!</p><p>是否切换回翻牌城市继续翻牌?</p>',
																					confirmOnly: false,
																					confirmTxt: '切换',
																					cancelTxt: '否',
																					confirm: function confirm() {
																							// 关闭翻牌webview, 回首页
																							_this.Act.goToIndex();
																					},
																					cancel: function cancel() {
																							// 不做任何处理
																							$self.addClass('can-flip');
																					}

																			});
																	} else {

																			if (returnObject.is_can_flip == 1) {
																					// 可以翻牌

																					// 渲染抽奖结果
																					_this.renderRst(returnObject);
																					// 对该块进行动画操作
																					_this.AnimateGoRotate($self);
																					// 计算剩余天数
																					o.flipInfo.surplus_times--;
																					_this.countDisDay();
																			} else {

																					_this.showDialog({
																							txt: "<p>你今天已经翻过牌啦, 明天再过来吧</p>",
																							confirmOnly: true
																					});
																			}
																	}
															}
													}
											},

											error: function error(xhr, status, err) {

													_this.showDialog({

															txt: "<p>" + err + "</p>",
															confirmOnly: true,
															confirm: function confirm() {

																	$self.addClass('can-flip');
															}
													});
											}

									});

									// 对该块进行动画操作
									// _this.AnimateGoRotate($self);

									// 计算剩余天数
									// o.flipInfo.surplus_times--;
									// _this.countDisDay();

									// ajax签到抽奖
									$.ajax(_ajax);
							});

							// 给结果面板的关闭按钮绑定点击事件
							d.$maskClose.on('tap', function () {

									d.$maskCard.animate({

											'opacity': 0,
											'translateY': '-50%',
											'rotateX': '180deg',
											'scale': 0

									}, 500, 'cubic-bezier(.73,-0.34,.63,.99)', function () {

											d.$maskWrap.animate({

													'opacity': 0

											}, 400, function () {

													d.$maskCard.removeClass('visible');
													d.$maskWrap.hide();
											});
									});
							});

							// 阻止事件冒泡
							d.$maskCard.on('tap', function (e) {

									e.stopPropagation();
							});

							// 点击遮罩区域也可以收起卡片
							d.$maskWrap.on('tap', function () {

									if (d.$maskCard.hasClass('visible')) {

											d.$maskClose.trigger('tap');
									}
							});

							// 随便逛逛, 点击后关闭退出
							d.$maskFnBtn.delegate('.close-btn', 'tap', function () {

									d.$maskClose.trigger('tap');
									setTimeout(function () {
											_this.exitFlip();
									}, 500);
							});

							// 查看我的奖励, 点击后调用app方法, 跳转我的礼券页面
							d.$maskFnBtn.delegate('.check-gift-btn', 'tap', function () {

									_this.Act.goToGift();
							});

							// 查看楼盘按钮, 点击后跳转app的楼盘详情页面
							d.$footerTipBox.delegate('.go-house', 'tap', function () {

									var pid = $(this).data('pid');
									// console.log(pid);
									_this.Act.goToProperty(pid);
							});

							// 左上角关闭按钮
							d.$mainWrap.delegate('.close-btn', 'tap', function () {

									_this.exitFlip();
							});

							// 换一张
							d.$mainWrap.delegate('.switch-card', 'tap', function () {

									// 构造ajax请求
									var _ajax = $.extend({}, o.ajaxApi.change, {

											data: {
													t: o.userInfo.t,
													_t: o.userInfo._t,
													flip_id: o.flipInfo.flip_id,
													city: o.userInfo.city,
													current_city: o.userInfo.current_city,
													lt: o.userInfo.lt
											},

											success: function success(data) {

													// 清空记录, 刷新翻牌
													var returnObject = data.returnObject;


													if (!$.isEmptyObject(returnObject)) {

															// 重置游戏数据
															$.extend(o.flipInfo, returnObject);
															_this.clearAndRestart();
													}
											}

									});

									// 如果用户已经翻过牌(剩余天数小于总天数, 则认为翻过牌)
									if (parseInt(o.flipInfo.surplus_times) < Math.pow(parseInt(o.flipInfo.flip_model), 2)) {

											_this.showDialog({
													txt: '<p>您之前的翻牌记录将被重置，下次将重头开始，确认要换一张吗?</p>',
													confirmTxt: '是的',
													cancelTxt: '算了',
													confirm: function confirm() {
															$.ajax(_ajax);
													}

											});
									}
							});
					}

					// 清空记录, 重新翻牌

			}, {
					key: "clearAndRestart",
					value: function clearAndRestart() {

							var _this = this;
							var d = _this.doms;
							var o = _this.opt;

							var counter = 0;

							d.$cardList.css('background-image', 'none');
							var $cards = d.$cardList.find('.card-item');

							$cards.each(function (idx, ele) {

									var $self = $(ele);
									var curL = $self.offset().left;
									var curT = $self.offset().top;

									$self.animate({
											'left': (d.$cardList.width() - $self.width()) / 2,
											'top': (d.$cardList.height() - $self.height()) / 2,
											'scale': '0',
											'opacity': 0,
											'rotateY': -idx * 15 + "deg",
											'rotateX': idx * 15 + "deg"
									}, Math.random() * 300 + 300, 'ease-in', function () {

											$self.remove();
											counter++;

											if (counter >= $cards.length) {

													_this.init();
											}
									});
							});
					}
			}, {
					key: "AnimateGoRotate",
					value: function AnimateGoRotate($card) {

							var _this = this;
							var d = _this.doms;
							var t = _this.timeLine;

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

							}, 1000, 'ease-out', function () {

									setTimeout(function () {

											$card.animate({

													'rotateX': '-180deg',
													'scale': '0.1',
													'opacity': 0

											}, 500, 'cubic-bezier(.55,-0.41,.79,.77)', function () {

													// 显示抽奖结果
													_showRst();
											});
									}, 400);
							});

							// 显示抽奖结果
							function _showRst() {

									d.$maskWrap.animate({

											'opacity': 0

									}, 0, function () {

											d.$maskWrap.show().animate({

													'opacity': 1

											}, 300, 'ease', function () {

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

									}, 0, function () {

											d.$maskCard.addClass('visible') // 处于可见状态
											.show().animate({

													'opacity': 1,
													'translateY': '-50%',
													'rotateX': '0',
													'scale': 1

											}, 400, 'cubic-bezier(.36,.66,.46,1.22)');
									});
							}
					}

					// 显示弹框

			}, {
					key: "showDialog",
					value: function showDialog(opt) {

							var _this = this;
							var d = _this.doms;

							var defaults = {
									txt: '<p>弹框提示</p>', // 弹框提示文本(html)
									confirmOnly: false, // 是否只有确认按钮
									confirmTxt: '确认',
									cancelTxt: '取消',
									confirm: null,
									cancel: null
							};

							var opt = $.extend({}, defaults, opt);
							var btnStr;

							// 填充内容
							d.$dialogTxt.html(opt.txt);

							if (opt.confirmOnly) {
									// 如果只有确认按钮

									btnStr = "<a href=\"javascript:void(0);\" class=\"btn-confirm btn-block\">" + opt.confirmTxt + "</a>";
							} else {

									btnStr = "\n\t\t\t\t<a href=\"javascript:void(0);\" class=\"btn-confirm\">" + opt.confirmTxt + "</a>\n\t\t\t\t<a href=\"javascript:void(0);\" class=\"btn-cancel\">" + opt.cancelTxt + "</a>\n\t\t\t";
							}

							d.$dialogBtnWrap.html(btnStr);

							// 显示弹框
							setTimeout(function () {

									_animateShowDialog();
							}, 400);

							// 关闭弹框
							d.$dialogBtnWrap.delegate('.btn-confirm', 'tap', function () {

									_animateHideDialog(function () {

											opt.confirm && opt.confirm();
									});
							});

							d.$dialogBtnWrap.delegate('.btn-cancel', 'tap', function () {

									_animateHideDialog(function () {

											opt.cancel && opt.cancel();
									});
							});

							// 显示弹框动画
							function _animateShowDialog() {

									d.$maskWrap.css('opacity', 0).show().animate({
											'opacity': 1
									}, 300);

									d.$maskDialogWrap.animate({
											'opacity': 0
									}, 0, function () {

											d.$maskDialogWrap.show().animate({
													'opacity': 1
											}, 400, function () {

													_animateShowDialogBox();
											});
									});

									function _animateShowDialogBox() {

											d.$dialogBox.show().animate({

													'translateX': '-50%',
													'translateY': '-50%',
													'scale': '0',
													'opacity': 0

											}, 0, function () {

													d.$dialogBox.animate({

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
											'opacity': 0

									}, 400, 'cubic-bezier(.67,-0.38,.97,.99)', function () {

											d.$dialogBox.hide();
											d.$maskDialogWrap.hide();

											d.$maskWrap.animate({
													'opacity': 0
											}, 400, function () {

													d.$maskWrap.hide();
													cb && cb();
											});
									});
							}
					}
			}]);

			return Game;
	}();

	module.exports = Game;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// 与app的交互方法

	__webpack_require__(3);

	// 配置所需调用app接口的jsBridge

	fph.config({
		debug: true,
		apiList: ['getUserInfo', // 获取用户信息
		'closeViewPage', // 关闭当前webview
		'goToProperty', // 跳转楼盘详情
		'goToLogin', // 调用登录面板
		'goToIndex', // 跳转首页
		'goToGift' // 跳转礼券页面
		]
	});

	// 获取用户信息
	function getInfo(cb) {

		var rst = {
			t: '1f3s2df13sd', // 密钥
			_t: 'fasd132asd', // 用户登录密钥
			city: '上海市', // 选择城市
			current_city: '北京市', // 当前城市
			lt: '121.424712,31.176326' // 定位经纬度
		};

		// 调用app方法, 获取用户信息
		// fph.getUserInfo({

		// 	success: function(data) {
		// 		cb && cb(data);
		// 	}

		// });

		setTimeout(function () {

			cb && cb(rst);
		}, 1000);
	}

	// 关闭当前窗口(点击关闭按钮时, 先走php接口释放资源, 然后调app方法关闭当前窗口)

	function closePage(cb) {

		fph.closeViewPage();
	}

	// 跳转楼盘详情

	function goToProperty(pid) {

		fph.goToProperty({ pid: pid });
	}

	// 跳转登录面板

	function goToLogin() {

		fph.goToLogin();
	}

	// 跳转回首页
	function goToIndex() {
		fph.goToIndex();
	}

	// 跳转我的礼券
	function goToGift() {
		fph.goToGift();
	}

	module.exports = { getInfo: getInfo, closePage: closePage, goToProperty: goToProperty, goToLogin: goToLogin, goToIndex: goToIndex, goToGift: goToGift };

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	/** fph C端 app jsbridge beta
	*   @author: xiongxiong109
	**/
	;(function (window, document) {

			function Fph() {

					// 承载方法名, 所有的方法名在这里会统一加上jsBridge_
					this.prefix = 'jsBridge_';

					this.jsBridge;
			}

			/*** 给Fph动态地注入方法 
	  * @opt: {
	  		apiList: 列出所有的api接口名, 并挂载到prototype上
	  	}
	  ***/
			Fph.prototype.config = function (opt) {

					// 将方法名注册进去
					this.jsBridge = opt.apiList || [];
					this.debug = opt.debug || false; // 是否开启调试模式
					this.invoke();
			};

			/*** 将apilist中的方法名挂载到Fph的prototype上
	  ***/
			Fph.prototype.invoke = function () {

					var f = this;
					var prefix = f.prefix;
					var jsBridgeArr = f.jsBridge;

					jsBridgeArr.map(function (ele) {

							Fph.prototype[ele] = function (opt) {

									// 每一个方法的执行兼容ios与android的方法
									var fnName = [prefix, ele].join('');
									f.facadeRunBridge(fnName, opt);
							};
					});
			};

			// 使用facade模式封装兼容性地调用方法, 来尝试调用ios与andriod的方法, 如果两者都没有, 则调用失败回调函数
			Fph.prototype.facadeRunBridge = function (fnName, opt) {

					// 传入的是json Object, 但是给到app端的是json格式的字符串
					var jsonStr = '';
					var f = this;

					// 检测成功回调
					if (opt && typeof opt.success === 'function') {

							// 执行全局方法
							window.fphAppCallJs = function () {

									var args = Array.prototype.slice.call(arguments);

									opt.success.apply(this, args);
							};
					}

					// 检测失败回调
					if (opt && typeof opt.error === 'function') {

							window.fphAppCallJsErr = function () {

									var args = Array.prototype.slice.call(arguments);

									opt.error.apply(this, args);
							};
					}

					if ((typeof opt === 'undefined' ? 'undefined' : _typeof(opt)) === 'object') {

							jsonStr = JSON.stringify(opt);
					};

					// 尝试调用三端方法
					try {
							//ios

							window[fnName](jsonStr);
					} catch (e) {

							// console.log(e);

							try {
									// android

									window.android[fnName](jsonStr);
							} catch (e) {
									// browser

									if (f.debug) {
											// 如果开启了调试模式, 则打印错误信息

											console.log(e);
											console.log(fnName);
									}

									if (opt && typeof opt.error === 'function') {
											opt.error(fnName);
									}
							}
					}
			};

			// 展示当前Fph里面所有的方法名
			Fph.prototype.toString = function () {

					var f = this;
					return f.jsBridge;
			};

			window.fph = new Fph();
	})(window, document);

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";

	// 游戏配置默认选项

	module.exports = {

		// num: 3, // 切分块数
		// bgImg: __uri("/assets/img/gift.jpg"), // 大奖图片
		// houseImg: __uri("/assets/img/house.jpg"), // 楼盘图片
		// curIdx: 3, // 当前可以翻动的块(连续第几天签到)
		// canFlip: true, // 是否可以翻动(今天是否已签到)
		// uId: 123, // 当前抽奖用户的id, 用于与后端交互

		userInfo: { // 用户身份信息
			_t: "",
			city: "",
			current_city: "",
			lt: "",
			t: ""
		},
		flipInfo: { // 用户翻牌信息
			flip_id: "",
			flip_img: "",
			flip_model: "",
			flip_rule: "",
			gift_img: "",
			has_flip: "",
			is_change: "",
			msg: "",
			offer: "",
			pid: "",
			property_name: "",
			surplus_times: ""
		},
		ajaxApi: { // ajax提交的配置

			clickFlip: { // 点击翻牌
				url: '/activity/clickflip',
				type: 'post'
			},

			info: { // 获取用户当前签到信息
				url: '/activity/flip',
				type: 'post'
			},

			change: { // 换一张
				url: '/activity/changeflip',
				type: 'post'
			},

			exit: { // 退出接口
				url: '/activity/exitflip',
				type: 'post'
			}

		}

	};

/***/ },
/* 5 */
/***/ function(module, exports) {

	/* Zepto v1.1.6 - zepto event ajax form ie - zeptojs.com/license */
	var Zepto=function(){function L(t){return null==t?String(t):j[S.call(t)]||"object"}function Z(t){return"function"==L(t)}function _(t){return null!=t&&t==t.window}function $(t){return null!=t&&t.nodeType==t.DOCUMENT_NODE}function D(t){return"object"==L(t)}function M(t){return D(t)&&!_(t)&&Object.getPrototypeOf(t)==Object.prototype}function R(t){return"number"==typeof t.length}function k(t){return s.call(t,function(t){return null!=t})}function z(t){return t.length>0?n.fn.concat.apply([],t):t}function F(t){return t.replace(/::/g,"/").replace(/([A-Z]+)([A-Z][a-z])/g,"$1_$2").replace(/([a-z\d])([A-Z])/g,"$1_$2").replace(/_/g,"-").toLowerCase()}function q(t){return t in f?f[t]:f[t]=new RegExp("(^|\\s)"+t+"(\\s|$)")}function H(t,e){return"number"!=typeof e||c[F(t)]?e:e+"px"}function I(t){var e,n;return u[t]||(e=a.createElement(t),a.body.appendChild(e),n=getComputedStyle(e,"").getPropertyValue("display"),e.parentNode.removeChild(e),"none"==n&&(n="block"),u[t]=n),u[t]}function V(t){return"children"in t?o.call(t.children):n.map(t.childNodes,function(t){return 1==t.nodeType?t:void 0})}function B(n,i,r){for(e in i)r&&(M(i[e])||A(i[e]))?(M(i[e])&&!M(n[e])&&(n[e]={}),A(i[e])&&!A(n[e])&&(n[e]=[]),B(n[e],i[e],r)):i[e]!==t&&(n[e]=i[e])}function U(t,e){return null==e?n(t):n(t).filter(e)}function J(t,e,n,i){return Z(e)?e.call(t,n,i):e}function X(t,e,n){null==n?t.removeAttribute(e):t.setAttribute(e,n)}function W(e,n){var i=e.className||"",r=i&&i.baseVal!==t;return n===t?r?i.baseVal:i:void(r?i.baseVal=n:e.className=n)}function Y(t){try{return t?"true"==t||("false"==t?!1:"null"==t?null:+t+""==t?+t:/^[\[\{]/.test(t)?n.parseJSON(t):t):t}catch(e){return t}}function G(t,e){e(t);for(var n=0,i=t.childNodes.length;i>n;n++)G(t.childNodes[n],e)}var t,e,n,i,C,N,r=[],o=r.slice,s=r.filter,a=window.document,u={},f={},c={"column-count":1,columns:1,"font-weight":1,"line-height":1,opacity:1,"z-index":1,zoom:1},l=/^\s*<(\w+|!)[^>]*>/,h=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,p=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,d=/^(?:body|html)$/i,m=/([A-Z])/g,g=["val","css","html","text","data","width","height","offset"],v=["after","prepend","before","append"],y=a.createElement("table"),x=a.createElement("tr"),b={tr:a.createElement("tbody"),tbody:y,thead:y,tfoot:y,td:x,th:x,"*":a.createElement("div")},w=/complete|loaded|interactive/,E=/^[\w-]*$/,j={},S=j.toString,T={},O=a.createElement("div"),P={tabindex:"tabIndex",readonly:"readOnly","for":"htmlFor","class":"className",maxlength:"maxLength",cellspacing:"cellSpacing",cellpadding:"cellPadding",rowspan:"rowSpan",colspan:"colSpan",usemap:"useMap",frameborder:"frameBorder",contenteditable:"contentEditable"},A=Array.isArray||function(t){return t instanceof Array};return T.matches=function(t,e){if(!e||!t||1!==t.nodeType)return!1;var n=t.webkitMatchesSelector||t.mozMatchesSelector||t.oMatchesSelector||t.matchesSelector;if(n)return n.call(t,e);var i,r=t.parentNode,o=!r;return o&&(r=O).appendChild(t),i=~T.qsa(r,e).indexOf(t),o&&O.removeChild(t),i},C=function(t){return t.replace(/-+(.)?/g,function(t,e){return e?e.toUpperCase():""})},N=function(t){return s.call(t,function(e,n){return t.indexOf(e)==n})},T.fragment=function(e,i,r){var s,u,f;return h.test(e)&&(s=n(a.createElement(RegExp.$1))),s||(e.replace&&(e=e.replace(p,"<$1></$2>")),i===t&&(i=l.test(e)&&RegExp.$1),i in b||(i="*"),f=b[i],f.innerHTML=""+e,s=n.each(o.call(f.childNodes),function(){f.removeChild(this)})),M(r)&&(u=n(s),n.each(r,function(t,e){g.indexOf(t)>-1?u[t](e):u.attr(t,e)})),s},T.Z=function(t,e){return t=t||[],t.__proto__=n.fn,t.selector=e||"",t},T.isZ=function(t){return t instanceof T.Z},T.init=function(e,i){var r;if(!e)return T.Z();if("string"==typeof e)if(e=e.trim(),"<"==e[0]&&l.test(e))r=T.fragment(e,RegExp.$1,i),e=null;else{if(i!==t)return n(i).find(e);r=T.qsa(a,e)}else{if(Z(e))return n(a).ready(e);if(T.isZ(e))return e;if(A(e))r=k(e);else if(D(e))r=[e],e=null;else if(l.test(e))r=T.fragment(e.trim(),RegExp.$1,i),e=null;else{if(i!==t)return n(i).find(e);r=T.qsa(a,e)}}return T.Z(r,e)},n=function(t,e){return T.init(t,e)},n.extend=function(t){var e,n=o.call(arguments,1);return"boolean"==typeof t&&(e=t,t=n.shift()),n.forEach(function(n){B(t,n,e)}),t},T.qsa=function(t,e){var n,i="#"==e[0],r=!i&&"."==e[0],s=i||r?e.slice(1):e,a=E.test(s);return $(t)&&a&&i?(n=t.getElementById(s))?[n]:[]:1!==t.nodeType&&9!==t.nodeType?[]:o.call(a&&!i?r?t.getElementsByClassName(s):t.getElementsByTagName(e):t.querySelectorAll(e))},n.contains=a.documentElement.contains?function(t,e){return t!==e&&t.contains(e)}:function(t,e){for(;e&&(e=e.parentNode);)if(e===t)return!0;return!1},n.type=L,n.isFunction=Z,n.isWindow=_,n.isArray=A,n.isPlainObject=M,n.isEmptyObject=function(t){var e;for(e in t)return!1;return!0},n.inArray=function(t,e,n){return r.indexOf.call(e,t,n)},n.camelCase=C,n.trim=function(t){return null==t?"":String.prototype.trim.call(t)},n.uuid=0,n.support={},n.expr={},n.map=function(t,e){var n,r,o,i=[];if(R(t))for(r=0;r<t.length;r++)n=e(t[r],r),null!=n&&i.push(n);else for(o in t)n=e(t[o],o),null!=n&&i.push(n);return z(i)},n.each=function(t,e){var n,i;if(R(t)){for(n=0;n<t.length;n++)if(e.call(t[n],n,t[n])===!1)return t}else for(i in t)if(e.call(t[i],i,t[i])===!1)return t;return t},n.grep=function(t,e){return s.call(t,e)},window.JSON&&(n.parseJSON=JSON.parse),n.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(t,e){j["[object "+e+"]"]=e.toLowerCase()}),n.fn={forEach:r.forEach,reduce:r.reduce,push:r.push,sort:r.sort,indexOf:r.indexOf,concat:r.concat,map:function(t){return n(n.map(this,function(e,n){return t.call(e,n,e)}))},slice:function(){return n(o.apply(this,arguments))},ready:function(t){return w.test(a.readyState)&&a.body?t(n):a.addEventListener("DOMContentLoaded",function(){t(n)},!1),this},get:function(e){return e===t?o.call(this):this[e>=0?e:e+this.length]},toArray:function(){return this.get()},size:function(){return this.length},remove:function(){return this.each(function(){null!=this.parentNode&&this.parentNode.removeChild(this)})},each:function(t){return r.every.call(this,function(e,n){return t.call(e,n,e)!==!1}),this},filter:function(t){return Z(t)?this.not(this.not(t)):n(s.call(this,function(e){return T.matches(e,t)}))},add:function(t,e){return n(N(this.concat(n(t,e))))},is:function(t){return this.length>0&&T.matches(this[0],t)},not:function(e){var i=[];if(Z(e)&&e.call!==t)this.each(function(t){e.call(this,t)||i.push(this)});else{var r="string"==typeof e?this.filter(e):R(e)&&Z(e.item)?o.call(e):n(e);this.forEach(function(t){r.indexOf(t)<0&&i.push(t)})}return n(i)},has:function(t){return this.filter(function(){return D(t)?n.contains(this,t):n(this).find(t).size()})},eq:function(t){return-1===t?this.slice(t):this.slice(t,+t+1)},first:function(){var t=this[0];return t&&!D(t)?t:n(t)},last:function(){var t=this[this.length-1];return t&&!D(t)?t:n(t)},find:function(t){var e,i=this;return e=t?"object"==typeof t?n(t).filter(function(){var t=this;return r.some.call(i,function(e){return n.contains(e,t)})}):1==this.length?n(T.qsa(this[0],t)):this.map(function(){return T.qsa(this,t)}):n()},closest:function(t,e){var i=this[0],r=!1;for("object"==typeof t&&(r=n(t));i&&!(r?r.indexOf(i)>=0:T.matches(i,t));)i=i!==e&&!$(i)&&i.parentNode;return n(i)},parents:function(t){for(var e=[],i=this;i.length>0;)i=n.map(i,function(t){return(t=t.parentNode)&&!$(t)&&e.indexOf(t)<0?(e.push(t),t):void 0});return U(e,t)},parent:function(t){return U(N(this.pluck("parentNode")),t)},children:function(t){return U(this.map(function(){return V(this)}),t)},contents:function(){return this.map(function(){return o.call(this.childNodes)})},siblings:function(t){return U(this.map(function(t,e){return s.call(V(e.parentNode),function(t){return t!==e})}),t)},empty:function(){return this.each(function(){this.innerHTML=""})},pluck:function(t){return n.map(this,function(e){return e[t]})},show:function(){return this.each(function(){"none"==this.style.display&&(this.style.display=""),"none"==getComputedStyle(this,"").getPropertyValue("display")&&(this.style.display=I(this.nodeName))})},replaceWith:function(t){return this.before(t).remove()},wrap:function(t){var e=Z(t);if(this[0]&&!e)var i=n(t).get(0),r=i.parentNode||this.length>1;return this.each(function(o){n(this).wrapAll(e?t.call(this,o):r?i.cloneNode(!0):i)})},wrapAll:function(t){if(this[0]){n(this[0]).before(t=n(t));for(var e;(e=t.children()).length;)t=e.first();n(t).append(this)}return this},wrapInner:function(t){var e=Z(t);return this.each(function(i){var r=n(this),o=r.contents(),s=e?t.call(this,i):t;o.length?o.wrapAll(s):r.append(s)})},unwrap:function(){return this.parent().each(function(){n(this).replaceWith(n(this).children())}),this},clone:function(){return this.map(function(){return this.cloneNode(!0)})},hide:function(){return this.css("display","none")},toggle:function(e){return this.each(function(){var i=n(this);(e===t?"none"==i.css("display"):e)?i.show():i.hide()})},prev:function(t){return n(this.pluck("previousElementSibling")).filter(t||"*")},next:function(t){return n(this.pluck("nextElementSibling")).filter(t||"*")},html:function(t){return 0 in arguments?this.each(function(e){var i=this.innerHTML;n(this).empty().append(J(this,t,e,i))}):0 in this?this[0].innerHTML:null},text:function(t){return 0 in arguments?this.each(function(e){var n=J(this,t,e,this.textContent);this.textContent=null==n?"":""+n}):0 in this?this[0].textContent:null},attr:function(n,i){var r;return"string"!=typeof n||1 in arguments?this.each(function(t){if(1===this.nodeType)if(D(n))for(e in n)X(this,e,n[e]);else X(this,n,J(this,i,t,this.getAttribute(n)))}):this.length&&1===this[0].nodeType?!(r=this[0].getAttribute(n))&&n in this[0]?this[0][n]:r:t},removeAttr:function(t){return this.each(function(){1===this.nodeType&&t.split(" ").forEach(function(t){X(this,t)},this)})},prop:function(t,e){return t=P[t]||t,1 in arguments?this.each(function(n){this[t]=J(this,e,n,this[t])}):this[0]&&this[0][t]},data:function(e,n){var i="data-"+e.replace(m,"-$1").toLowerCase(),r=1 in arguments?this.attr(i,n):this.attr(i);return null!==r?Y(r):t},val:function(t){return 0 in arguments?this.each(function(e){this.value=J(this,t,e,this.value)}):this[0]&&(this[0].multiple?n(this[0]).find("option").filter(function(){return this.selected}).pluck("value"):this[0].value)},offset:function(t){if(t)return this.each(function(e){var i=n(this),r=J(this,t,e,i.offset()),o=i.offsetParent().offset(),s={top:r.top-o.top,left:r.left-o.left};"static"==i.css("position")&&(s.position="relative"),i.css(s)});if(!this.length)return null;var e=this[0].getBoundingClientRect();return{left:e.left+window.pageXOffset,top:e.top+window.pageYOffset,width:Math.round(e.width),height:Math.round(e.height)}},css:function(t,i){if(arguments.length<2){var r,o=this[0];if(!o)return;if(r=getComputedStyle(o,""),"string"==typeof t)return o.style[C(t)]||r.getPropertyValue(t);if(A(t)){var s={};return n.each(t,function(t,e){s[e]=o.style[C(e)]||r.getPropertyValue(e)}),s}}var a="";if("string"==L(t))i||0===i?a=F(t)+":"+H(t,i):this.each(function(){this.style.removeProperty(F(t))});else for(e in t)t[e]||0===t[e]?a+=F(e)+":"+H(e,t[e])+";":this.each(function(){this.style.removeProperty(F(e))});return this.each(function(){this.style.cssText+=";"+a})},index:function(t){return t?this.indexOf(n(t)[0]):this.parent().children().indexOf(this[0])},hasClass:function(t){return t?r.some.call(this,function(t){return this.test(W(t))},q(t)):!1},addClass:function(t){return t?this.each(function(e){if("className"in this){i=[];var r=W(this),o=J(this,t,e,r);o.split(/\s+/g).forEach(function(t){n(this).hasClass(t)||i.push(t)},this),i.length&&W(this,r+(r?" ":"")+i.join(" "))}}):this},removeClass:function(e){return this.each(function(n){if("className"in this){if(e===t)return W(this,"");i=W(this),J(this,e,n,i).split(/\s+/g).forEach(function(t){i=i.replace(q(t)," ")}),W(this,i.trim())}})},toggleClass:function(e,i){return e?this.each(function(r){var o=n(this),s=J(this,e,r,W(this));s.split(/\s+/g).forEach(function(e){(i===t?!o.hasClass(e):i)?o.addClass(e):o.removeClass(e)})}):this},scrollTop:function(e){if(this.length){var n="scrollTop"in this[0];return e===t?n?this[0].scrollTop:this[0].pageYOffset:this.each(n?function(){this.scrollTop=e}:function(){this.scrollTo(this.scrollX,e)})}},scrollLeft:function(e){if(this.length){var n="scrollLeft"in this[0];return e===t?n?this[0].scrollLeft:this[0].pageXOffset:this.each(n?function(){this.scrollLeft=e}:function(){this.scrollTo(e,this.scrollY)})}},position:function(){if(this.length){var t=this[0],e=this.offsetParent(),i=this.offset(),r=d.test(e[0].nodeName)?{top:0,left:0}:e.offset();return i.top-=parseFloat(n(t).css("margin-top"))||0,i.left-=parseFloat(n(t).css("margin-left"))||0,r.top+=parseFloat(n(e[0]).css("border-top-width"))||0,r.left+=parseFloat(n(e[0]).css("border-left-width"))||0,{top:i.top-r.top,left:i.left-r.left}}},offsetParent:function(){return this.map(function(){for(var t=this.offsetParent||a.body;t&&!d.test(t.nodeName)&&"static"==n(t).css("position");)t=t.offsetParent;return t})}},n.fn.detach=n.fn.remove,["width","height"].forEach(function(e){var i=e.replace(/./,function(t){return t[0].toUpperCase()});n.fn[e]=function(r){var o,s=this[0];return r===t?_(s)?s["inner"+i]:$(s)?s.documentElement["scroll"+i]:(o=this.offset())&&o[e]:this.each(function(t){s=n(this),s.css(e,J(this,r,t,s[e]()))})}}),v.forEach(function(t,e){var i=e%2;n.fn[t]=function(){var t,o,r=n.map(arguments,function(e){return t=L(e),"object"==t||"array"==t||null==e?e:T.fragment(e)}),s=this.length>1;return r.length<1?this:this.each(function(t,u){o=i?u:u.parentNode,u=0==e?u.nextSibling:1==e?u.firstChild:2==e?u:null;var f=n.contains(a.documentElement,o);r.forEach(function(t){if(s)t=t.cloneNode(!0);else if(!o)return n(t).remove();o.insertBefore(t,u),f&&G(t,function(t){null==t.nodeName||"SCRIPT"!==t.nodeName.toUpperCase()||t.type&&"text/javascript"!==t.type||t.src||window.eval.call(window,t.innerHTML)})})})},n.fn[i?t+"To":"insert"+(e?"Before":"After")]=function(e){return n(e)[t](this),this}}),T.Z.prototype=n.fn,T.uniq=N,T.deserializeValue=Y,n.zepto=T,n}();window.Zepto=Zepto,void 0===window.$&&(window.$=Zepto),function(t){function l(t){return t._zid||(t._zid=e++)}function h(t,e,n,i){if(e=p(e),e.ns)var r=d(e.ns);return(s[l(t)]||[]).filter(function(t){return!(!t||e.e&&t.e!=e.e||e.ns&&!r.test(t.ns)||n&&l(t.fn)!==l(n)||i&&t.sel!=i)})}function p(t){var e=(""+t).split(".");return{e:e[0],ns:e.slice(1).sort().join(" ")}}function d(t){return new RegExp("(?:^| )"+t.replace(" "," .* ?")+"(?: |$)")}function m(t,e){return t.del&&!u&&t.e in f||!!e}function g(t){return c[t]||u&&f[t]||t}function v(e,i,r,o,a,u,f){var h=l(e),d=s[h]||(s[h]=[]);i.split(/\s/).forEach(function(i){if("ready"==i)return t(document).ready(r);var s=p(i);s.fn=r,s.sel=a,s.e in c&&(r=function(e){var n=e.relatedTarget;return!n||n!==this&&!t.contains(this,n)?s.fn.apply(this,arguments):void 0}),s.del=u;var l=u||r;s.proxy=function(t){if(t=j(t),!t.isImmediatePropagationStopped()){t.data=o;var i=l.apply(e,t._args==n?[t]:[t].concat(t._args));return i===!1&&(t.preventDefault(),t.stopPropagation()),i}},s.i=d.length,d.push(s),"addEventListener"in e&&e.addEventListener(g(s.e),s.proxy,m(s,f))})}function y(t,e,n,i,r){var o=l(t);(e||"").split(/\s/).forEach(function(e){h(t,e,n,i).forEach(function(e){delete s[o][e.i],"removeEventListener"in t&&t.removeEventListener(g(e.e),e.proxy,m(e,r))})})}function j(e,i){return(i||!e.isDefaultPrevented)&&(i||(i=e),t.each(E,function(t,n){var r=i[t];e[t]=function(){return this[n]=x,r&&r.apply(i,arguments)},e[n]=b}),(i.defaultPrevented!==n?i.defaultPrevented:"returnValue"in i?i.returnValue===!1:i.getPreventDefault&&i.getPreventDefault())&&(e.isDefaultPrevented=x)),e}function S(t){var e,i={originalEvent:t};for(e in t)w.test(e)||t[e]===n||(i[e]=t[e]);return j(i,t)}var n,e=1,i=Array.prototype.slice,r=t.isFunction,o=function(t){return"string"==typeof t},s={},a={},u="onfocusin"in window,f={focus:"focusin",blur:"focusout"},c={mouseenter:"mouseover",mouseleave:"mouseout"};a.click=a.mousedown=a.mouseup=a.mousemove="MouseEvents",t.event={add:v,remove:y},t.proxy=function(e,n){var s=2 in arguments&&i.call(arguments,2);if(r(e)){var a=function(){return e.apply(n,s?s.concat(i.call(arguments)):arguments)};return a._zid=l(e),a}if(o(n))return s?(s.unshift(e[n],e),t.proxy.apply(null,s)):t.proxy(e[n],e);throw new TypeError("expected function")},t.fn.bind=function(t,e,n){return this.on(t,e,n)},t.fn.unbind=function(t,e){return this.off(t,e)},t.fn.one=function(t,e,n,i){return this.on(t,e,n,i,1)};var x=function(){return!0},b=function(){return!1},w=/^([A-Z]|returnValue$|layer[XY]$)/,E={preventDefault:"isDefaultPrevented",stopImmediatePropagation:"isImmediatePropagationStopped",stopPropagation:"isPropagationStopped"};t.fn.delegate=function(t,e,n){return this.on(e,t,n)},t.fn.undelegate=function(t,e,n){return this.off(e,t,n)},t.fn.live=function(e,n){return t(document.body).delegate(this.selector,e,n),this},t.fn.die=function(e,n){return t(document.body).undelegate(this.selector,e,n),this},t.fn.on=function(e,s,a,u,f){var c,l,h=this;return e&&!o(e)?(t.each(e,function(t,e){h.on(t,s,a,e,f)}),h):(o(s)||r(u)||u===!1||(u=a,a=s,s=n),(r(a)||a===!1)&&(u=a,a=n),u===!1&&(u=b),h.each(function(n,r){f&&(c=function(t){return y(r,t.type,u),u.apply(this,arguments)}),s&&(l=function(e){var n,o=t(e.target).closest(s,r).get(0);return o&&o!==r?(n=t.extend(S(e),{currentTarget:o,liveFired:r}),(c||u).apply(o,[n].concat(i.call(arguments,1)))):void 0}),v(r,e,u,a,s,l||c)}))},t.fn.off=function(e,i,s){var a=this;return e&&!o(e)?(t.each(e,function(t,e){a.off(t,i,e)}),a):(o(i)||r(s)||s===!1||(s=i,i=n),s===!1&&(s=b),a.each(function(){y(this,e,s,i)}))},t.fn.trigger=function(e,n){return e=o(e)||t.isPlainObject(e)?t.Event(e):j(e),e._args=n,this.each(function(){e.type in f&&"function"==typeof this[e.type]?this[e.type]():"dispatchEvent"in this?this.dispatchEvent(e):t(this).triggerHandler(e,n)})},t.fn.triggerHandler=function(e,n){var i,r;return this.each(function(s,a){i=S(o(e)?t.Event(e):e),i._args=n,i.target=a,t.each(h(a,e.type||e),function(t,e){return r=e.proxy(i),i.isImmediatePropagationStopped()?!1:void 0})}),r},"focusin focusout focus blur load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select keydown keypress keyup error".split(" ").forEach(function(e){t.fn[e]=function(t){return 0 in arguments?this.bind(e,t):this.trigger(e)}}),t.Event=function(t,e){o(t)||(e=t,t=e.type);var n=document.createEvent(a[t]||"Events"),i=!0;if(e)for(var r in e)"bubbles"==r?i=!!e[r]:n[r]=e[r];return n.initEvent(t,i,!0),j(n)}}(Zepto),function(t){function h(e,n,i){var r=t.Event(n);return t(e).trigger(r,i),!r.isDefaultPrevented()}function p(t,e,i,r){return t.global?h(e||n,i,r):void 0}function d(e){e.global&&0===t.active++&&p(e,null,"ajaxStart")}function m(e){e.global&&!--t.active&&p(e,null,"ajaxStop")}function g(t,e){var n=e.context;return e.beforeSend.call(n,t,e)===!1||p(e,n,"ajaxBeforeSend",[t,e])===!1?!1:void p(e,n,"ajaxSend",[t,e])}function v(t,e,n,i){var r=n.context,o="success";n.success.call(r,t,o,e),i&&i.resolveWith(r,[t,o,e]),p(n,r,"ajaxSuccess",[e,n,t]),x(o,e,n)}function y(t,e,n,i,r){var o=i.context;i.error.call(o,n,e,t),r&&r.rejectWith(o,[n,e,t]),p(i,o,"ajaxError",[n,i,t||e]),x(e,n,i)}function x(t,e,n){var i=n.context;n.complete.call(i,e,t),p(n,i,"ajaxComplete",[e,n]),m(n)}function b(){}function w(t){return t&&(t=t.split(";",2)[0]),t&&(t==f?"html":t==u?"json":s.test(t)?"script":a.test(t)&&"xml")||"text"}function E(t,e){return""==e?t:(t+"&"+e).replace(/[&?]{1,2}/,"?")}function j(e){e.processData&&e.data&&"string"!=t.type(e.data)&&(e.data=t.param(e.data,e.traditional)),!e.data||e.type&&"GET"!=e.type.toUpperCase()||(e.url=E(e.url,e.data),e.data=void 0)}function S(e,n,i,r){return t.isFunction(n)&&(r=i,i=n,n=void 0),t.isFunction(i)||(r=i,i=void 0),{url:e,data:n,success:i,dataType:r}}function C(e,n,i,r){var o,s=t.isArray(n),a=t.isPlainObject(n);t.each(n,function(n,u){o=t.type(u),r&&(n=i?r:r+"["+(a||"object"==o||"array"==o?n:"")+"]"),!r&&s?e.add(u.name,u.value):"array"==o||!i&&"object"==o?C(e,u,i,n):e.add(n,u)})}var i,r,e=0,n=window.document,o=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,s=/^(?:text|application)\/javascript/i,a=/^(?:text|application)\/xml/i,u="application/json",f="text/html",c=/^\s*$/,l=n.createElement("a");l.href=window.location.href,t.active=0,t.ajaxJSONP=function(i,r){if(!("type"in i))return t.ajax(i);var f,h,o=i.jsonpCallback,s=(t.isFunction(o)?o():o)||"jsonp"+ ++e,a=n.createElement("script"),u=window[s],c=function(e){t(a).triggerHandler("error",e||"abort")},l={abort:c};return r&&r.promise(l),t(a).on("load error",function(e,n){clearTimeout(h),t(a).off().remove(),"error"!=e.type&&f?v(f[0],l,i,r):y(null,n||"error",l,i,r),window[s]=u,f&&t.isFunction(u)&&u(f[0]),u=f=void 0}),g(l,i)===!1?(c("abort"),l):(window[s]=function(){f=arguments},a.src=i.url.replace(/\?(.+)=\?/,"?$1="+s),n.head.appendChild(a),i.timeout>0&&(h=setTimeout(function(){c("timeout")},i.timeout)),l)},t.ajaxSettings={type:"GET",beforeSend:b,success:b,error:b,complete:b,context:null,global:!0,xhr:function(){return new window.XMLHttpRequest},accepts:{script:"text/javascript, application/javascript, application/x-javascript",json:u,xml:"application/xml, text/xml",html:f,text:"text/plain"},crossDomain:!1,timeout:0,processData:!0,cache:!0},t.ajax=function(e){var a,o=t.extend({},e||{}),s=t.Deferred&&t.Deferred();for(i in t.ajaxSettings)void 0===o[i]&&(o[i]=t.ajaxSettings[i]);d(o),o.crossDomain||(a=n.createElement("a"),a.href=o.url,a.href=a.href,o.crossDomain=l.protocol+"//"+l.host!=a.protocol+"//"+a.host),o.url||(o.url=window.location.toString()),j(o);var u=o.dataType,f=/\?.+=\?/.test(o.url);if(f&&(u="jsonp"),o.cache!==!1&&(e&&e.cache===!0||"script"!=u&&"jsonp"!=u)||(o.url=E(o.url,"_="+Date.now())),"jsonp"==u)return f||(o.url=E(o.url,o.jsonp?o.jsonp+"=?":o.jsonp===!1?"":"callback=?")),t.ajaxJSONP(o,s);var C,h=o.accepts[u],p={},m=function(t,e){p[t.toLowerCase()]=[t,e]},x=/^([\w-]+:)\/\//.test(o.url)?RegExp.$1:window.location.protocol,S=o.xhr(),T=S.setRequestHeader;if(s&&s.promise(S),o.crossDomain||m("X-Requested-With","XMLHttpRequest"),m("Accept",h||"*/*"),(h=o.mimeType||h)&&(h.indexOf(",")>-1&&(h=h.split(",",2)[0]),S.overrideMimeType&&S.overrideMimeType(h)),(o.contentType||o.contentType!==!1&&o.data&&"GET"!=o.type.toUpperCase())&&m("Content-Type",o.contentType||"application/x-www-form-urlencoded"),o.headers)for(r in o.headers)m(r,o.headers[r]);if(S.setRequestHeader=m,S.onreadystatechange=function(){if(4==S.readyState){S.onreadystatechange=b,clearTimeout(C);var e,n=!1;if(S.status>=200&&S.status<300||304==S.status||0==S.status&&"file:"==x){u=u||w(o.mimeType||S.getResponseHeader("content-type")),e=S.responseText;try{"script"==u?(1,eval)(e):"xml"==u?e=S.responseXML:"json"==u&&(e=c.test(e)?null:t.parseJSON(e))}catch(i){n=i}n?y(n,"parsererror",S,o,s):v(e,S,o,s)}else y(S.statusText||null,S.status?"error":"abort",S,o,s)}},g(S,o)===!1)return S.abort(),y(null,"abort",S,o,s),S;if(o.xhrFields)for(r in o.xhrFields)S[r]=o.xhrFields[r];var N="async"in o?o.async:!0;S.open(o.type,o.url,N,o.username,o.password);for(r in p)T.apply(S,p[r]);return o.timeout>0&&(C=setTimeout(function(){S.onreadystatechange=b,S.abort(),y(null,"timeout",S,o,s)},o.timeout)),S.send(o.data?o.data:null),S},t.get=function(){return t.ajax(S.apply(null,arguments))},t.post=function(){var e=S.apply(null,arguments);return e.type="POST",t.ajax(e)},t.getJSON=function(){var e=S.apply(null,arguments);return e.dataType="json",t.ajax(e)},t.fn.load=function(e,n,i){if(!this.length)return this;var a,r=this,s=e.split(/\s/),u=S(e,n,i),f=u.success;return s.length>1&&(u.url=s[0],a=s[1]),u.success=function(e){r.html(a?t("<div>").html(e.replace(o,"")).find(a):e),f&&f.apply(r,arguments)},t.ajax(u),this};var T=encodeURIComponent;t.param=function(e,n){var i=[];return i.add=function(e,n){t.isFunction(n)&&(n=n()),null==n&&(n=""),this.push(T(e)+"="+T(n))},C(i,e,n),i.join("&").replace(/%20/g,"+")}}(Zepto),function(t){t.fn.serializeArray=function(){var e,n,i=[],r=function(t){return t.forEach?t.forEach(r):void i.push({name:e,value:t})};return this[0]&&t.each(this[0].elements,function(i,o){n=o.type,e=o.name,e&&"fieldset"!=o.nodeName.toLowerCase()&&!o.disabled&&"submit"!=n&&"reset"!=n&&"button"!=n&&"file"!=n&&("radio"!=n&&"checkbox"!=n||o.checked)&&r(t(o).val())}),i},t.fn.serialize=function(){var t=[];return this.serializeArray().forEach(function(e){t.push(encodeURIComponent(e.name)+"="+encodeURIComponent(e.value))}),t.join("&")},t.fn.submit=function(e){if(0 in arguments)this.bind("submit",e);else if(this.length){var n=t.Event("submit");this.eq(0).trigger(n),n.isDefaultPrevented()||this.get(0).submit()}return this}}(Zepto),function(t){"__proto__"in{}||t.extend(t.zepto,{Z:function(e,n){return e=e||[],t.extend(e,t.fn),e.selector=n||"",e.__Z=!0,e},isZ:function(e){return"array"===t.type(e)&&"__Z"in e}});try{getComputedStyle(void 0)}catch(e){var n=getComputedStyle;window.getComputedStyle=function(t){try{return n(t)}catch(e){return null}}}}(Zepto);

	//     Zepto.js
	//     (c) 2010-2016 Thomas Fuchs
	//     Zepto.js may be freely distributed under the MIT license.

	;(function($, undefined){
	  var prefix = '', eventPrefix,
	    vendors = { Webkit: 'webkit', Moz: '', O: 'o' },
	    testEl = document.createElement('div'),
	    supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
	    transform,
	    transitionProperty, transitionDuration, transitionTiming, transitionDelay,
	    animationName, animationDuration, animationTiming, animationDelay,
	    cssReset = {}

	  function dasherize(str) { return str.replace(/([a-z])([A-Z])/, '$1-$2').toLowerCase() }
	  function normalizeEvent(name) { return eventPrefix ? eventPrefix + name : name.toLowerCase() }

	  $.each(vendors, function(vendor, event){
	    if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
	      prefix = '-' + vendor.toLowerCase() + '-'
	      eventPrefix = event
	      return false
	    }
	  })

	  transform = prefix + 'transform'
	  cssReset[transitionProperty = prefix + 'transition-property'] =
	  cssReset[transitionDuration = prefix + 'transition-duration'] =
	  cssReset[transitionDelay    = prefix + 'transition-delay'] =
	  cssReset[transitionTiming   = prefix + 'transition-timing-function'] =
	  cssReset[animationName      = prefix + 'animation-name'] =
	  cssReset[animationDuration  = prefix + 'animation-duration'] =
	  cssReset[animationDelay     = prefix + 'animation-delay'] =
	  cssReset[animationTiming    = prefix + 'animation-timing-function'] = ''

	  $.fx = {
	    off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
	    speeds: { _default: 400, fast: 200, slow: 600 },
	    cssPrefix: prefix,
	    transitionEnd: normalizeEvent('TransitionEnd'),
	    animationEnd: normalizeEvent('AnimationEnd')
	  }

	  $.fn.animate = function(properties, duration, ease, callback, delay){
	    if ($.isFunction(duration))
	      callback = duration, ease = undefined, duration = undefined
	    if ($.isFunction(ease))
	      callback = ease, ease = undefined
	    if ($.isPlainObject(duration))
	      ease = duration.easing, callback = duration.complete, delay = duration.delay, duration = duration.duration
	    if (duration) duration = (typeof duration == 'number' ? duration :
	                    ($.fx.speeds[duration] || $.fx.speeds._default)) / 1000
	    if (delay) delay = parseFloat(delay) / 1000
	    return this.anim(properties, duration, ease, callback, delay)
	  }

	  $.fn.anim = function(properties, duration, ease, callback, delay){
	    var key, cssValues = {}, cssProperties, transforms = '',
	        that = this, wrappedCallback, endEvent = $.fx.transitionEnd,
	        fired = false

	    if (duration === undefined) duration = $.fx.speeds._default / 1000
	    if (delay === undefined) delay = 0
	    if ($.fx.off) duration = 0

	    if (typeof properties == 'string') {
	      // keyframe animation
	      cssValues[animationName] = properties
	      cssValues[animationDuration] = duration + 's'
	      cssValues[animationDelay] = delay + 's'
	      cssValues[animationTiming] = (ease || 'linear')
	      endEvent = $.fx.animationEnd
	    } else {
	      cssProperties = []
	      // CSS transitions
	      for (key in properties)
	        if (supportedTransforms.test(key)) transforms += key + '(' + properties[key] + ') '
	        else cssValues[key] = properties[key], cssProperties.push(dasherize(key))

	      if (transforms) cssValues[transform] = transforms, cssProperties.push(transform)
	      if (duration > 0 && typeof properties === 'object') {
	        cssValues[transitionProperty] = cssProperties.join(', ')
	        cssValues[transitionDuration] = duration + 's'
	        cssValues[transitionDelay] = delay + 's'
	        cssValues[transitionTiming] = (ease || 'linear')
	      }
	    }

	    wrappedCallback = function(event){
	      if (typeof event !== 'undefined') {
	        if (event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
	        $(event.target).unbind(endEvent, wrappedCallback)
	      } else
	        $(this).unbind(endEvent, wrappedCallback) // triggered by setTimeout

	      fired = true
	      $(this).css(cssReset)
	      callback && callback.call(this)
	    }
	    if (duration > 0){
	      this.bind(endEvent, wrappedCallback)
	      // transitionEnd is not always firing on older Android phones
	      // so make sure it gets fired
	      setTimeout(function(){
	        if (fired) return
	        wrappedCallback.call(that)
	      }, ((duration + delay) * 1000) + 25)
	    }

	    // trigger page reflow so new elements can animate
	    this.size() && this.get(0).clientLeft

	    this.css(cssValues)

	    if (duration <= 0) setTimeout(function() {
	      that.each(function(){ wrappedCallback.call(this) })
	    }, 0)

	    return this
	  }

	  testEl = null
	})(Zepto)
	;

	//     Zepto.js
	//     (c) 2010-2016 Thomas Fuchs
	//     Zepto.js may be freely distributed under the MIT license.

	;(function($){
	  var touch = {},
	    touchTimeout, tapTimeout, swipeTimeout, longTapTimeout,
	    longTapDelay = 750,
	    gesture

	  function swipeDirection(x1, x2, y1, y2) {
	    return Math.abs(x1 - x2) >=
	      Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
	  }

	  function longTap() {
	    longTapTimeout = null
	    if (touch.last) {
	      touch.el.trigger('longTap')
	      touch = {}
	    }
	  }

	  function cancelLongTap() {
	    if (longTapTimeout) clearTimeout(longTapTimeout)
	    longTapTimeout = null
	  }

	  function cancelAll() {
	    if (touchTimeout) clearTimeout(touchTimeout)
	    if (tapTimeout) clearTimeout(tapTimeout)
	    if (swipeTimeout) clearTimeout(swipeTimeout)
	    if (longTapTimeout) clearTimeout(longTapTimeout)
	    touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null
	    touch = {}
	  }

	  function isPrimaryTouch(event){
	    return (event.pointerType == 'touch' ||
	      event.pointerType == event.MSPOINTER_TYPE_TOUCH)
	      && event.isPrimary
	  }

	  function isPointerEventType(e, type){
	    return (e.type == 'pointer'+type ||
	      e.type.toLowerCase() == 'mspointer'+type)
	  }

	  $(document).ready(function(){
	    var now, delta, deltaX = 0, deltaY = 0, firstTouch, _isPointerType

	    if ('MSGesture' in window) {
	      gesture = new MSGesture()
	      gesture.target = document.body
	    }

	    $(document)
	      .bind('MSGestureEnd', function(e){
	        var swipeDirectionFromVelocity =
	          e.velocityX > 1 ? 'Right' : e.velocityX < -1 ? 'Left' : e.velocityY > 1 ? 'Down' : e.velocityY < -1 ? 'Up' : null;
	        if (swipeDirectionFromVelocity) {
	          touch.el.trigger('swipe')
	          touch.el.trigger('swipe'+ swipeDirectionFromVelocity)
	        }
	      })
	      .on('touchstart MSPointerDown pointerdown', function(e){
	        if((_isPointerType = isPointerEventType(e, 'down')) &&
	          !isPrimaryTouch(e)) return
	        firstTouch = _isPointerType ? e : e.touches[0]
	        if (e.touches && e.touches.length === 1 && touch.x2) {
	          // Clear out touch movement data if we have it sticking around
	          // This can occur if touchcancel doesn't fire due to preventDefault, etc.
	          touch.x2 = undefined
	          touch.y2 = undefined
	        }
	        now = Date.now()
	        delta = now - (touch.last || now)
	        touch.el = $('tagName' in firstTouch.target ?
	          firstTouch.target : firstTouch.target.parentNode)
	        touchTimeout && clearTimeout(touchTimeout)
	        touch.x1 = firstTouch.pageX
	        touch.y1 = firstTouch.pageY
	        if (delta > 0 && delta <= 250) touch.isDoubleTap = true
	        touch.last = now
	        longTapTimeout = setTimeout(longTap, longTapDelay)
	        // adds the current touch contact for IE gesture recognition
	        if (gesture && _isPointerType) gesture.addPointer(e.pointerId);
	      })
	      .on('touchmove MSPointerMove pointermove', function(e){
	        if((_isPointerType = isPointerEventType(e, 'move')) &&
	          !isPrimaryTouch(e)) return
	        firstTouch = _isPointerType ? e : e.touches[0]
	        cancelLongTap()
	        touch.x2 = firstTouch.pageX
	        touch.y2 = firstTouch.pageY

	        deltaX += Math.abs(touch.x1 - touch.x2)
	        deltaY += Math.abs(touch.y1 - touch.y2)
	      })
	      .on('touchend MSPointerUp pointerup', function(e){
	        if((_isPointerType = isPointerEventType(e, 'up')) &&
	          !isPrimaryTouch(e)) return
	        cancelLongTap()

	        // swipe
	        if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
	            (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30))

	          swipeTimeout = setTimeout(function() {
	            touch.el.trigger('swipe')
	            touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
	            touch = {}
	          }, 0)

	        // normal tap
	        else if ('last' in touch)
	          // don't fire tap when delta position changed by more than 30 pixels,
	          // for instance when moving to a point and back to origin
	          if (deltaX < 30 && deltaY < 30) {
	            // delay by one tick so we can cancel the 'tap' event if 'scroll' fires
	            // ('tap' fires before 'scroll')
	            tapTimeout = setTimeout(function() {

	              // trigger universal 'tap' with the option to cancelTouch()
	              // (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
	              var event = $.Event('tap')
	              event.cancelTouch = cancelAll
	              touch.el.trigger(event)

	              // trigger double tap immediately
	              if (touch.isDoubleTap) {
	                if (touch.el) touch.el.trigger('doubleTap')
	                touch = {}
	              }

	              // trigger single tap after 250ms of inactivity
	              else {
	                touchTimeout = setTimeout(function(){
	                  touchTimeout = null
	                  if (touch.el) touch.el.trigger('singleTap')
	                  touch = {}
	                }, 250)
	              }
	            }, 0)
	          } else {
	            touch = {}
	          }
	          deltaX = deltaY = 0

	      })
	      // when the browser window loses focus,
	      // for example when a modal dialog is shown,
	      // cancel all ongoing events
	      .on('touchcancel MSPointerCancel pointercancel', cancelAll)

	    // scrolling the window indicates intention of the user
	    // to scroll, not tap or swipe, so cancel all ongoing events
	    $(window).on('scroll', cancelAll)
	  })

	  ;['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown',
	    'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(eventName){
	    $.fn[eventName] = function(callback){ return this.on(eventName, callback) }
	  })
	})(Zepto)

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	// 重新计算尺寸,根据屏幕尺寸，做设计图自适应
	__webpack_require__(5);
	{
		// 获取dom的class

		var Doms = function Doms() {
			_classCallCheck(this, Doms);

			this.doms = {
				$cardBoxWrap: $(".card-box-wrap")
			};
		};

		// 做尺寸自适应变化的class


		var Resize = function (_Doms) {
			_inherits(Resize, _Doms);

			function Resize(w, h) {
				_classCallCheck(this, Resize);

				var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Resize).call(this));

				_this2.baseWidth = w;
				_this2.baseHeight = h;
				_this2.ratio = w / h;

				return _this2;
			}

			_createClass(Resize, [{
				key: 'init',
				value: function init() {

					var _this = this;

					_this.resize();
				}
			}, {
				key: 'resize',
				value: function resize() {

					var _this = this;
					var d = _this.doms;

					// 保持盒子的宽高比例
					d.$cardBoxWrap.height(d.$cardBoxWrap.width() / 0.785);
				}
			}]);

			return Resize;
		}(Doms);

		var AppResize = new Resize(750, 1334);

		AppResize.init();

		$(window).on('resize', function () {

			AppResize.resize();
		});
	}

/***/ }
/******/ ]);