/** fph C端 app jsbridge beta
*   @author: xiongxiong109
**/
;(function(window, document) {

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
	Fph.prototype.config = function(opt) {

		// 将方法名注册进去
		this.jsBridge = opt.apiList || [];
		this.debug = opt.debug || false; // 是否开启调试模式
		this.invoke();

	}

	/*** 将apilist中的方法名挂载到Fph的prototype上
	***/
	Fph.prototype.invoke = function() {

		var f = this;
		var prefix = f.prefix;
		var jsBridgeArr = f.jsBridge;

		jsBridgeArr.map(function(ele) {

			Fph.prototype[ele] = function(opt) {

				// 每一个方法的执行兼容ios与android的方法
				var fnName = [prefix, ele].join('');
				f.facadeRunBridge(fnName, opt);

			};

		});

	}

	// 使用facade模式封装兼容性地调用方法, 来尝试调用ios与andriod的方法, 如果两者都没有, 则调用失败回调函数
	Fph.prototype.facadeRunBridge = function(fnName, opt) {

		// 传入的是json Object, 但是给到app端的是json格式的字符串
		var jsonStr = '';
		var f = this;

		// 检测成功回调
		if (opt && typeof opt.success === 'function') {

			// 执行全局方法
			window.fphAppCallJs = function() {

				var args = Array.prototype.slice.call(arguments);

				opt.success.apply(this, args);

			};

		}

		// 检测失败回调
		if (opt && typeof opt.error === 'function') {

			window.fphAppCallJsErr = function() {

				var args = Array.prototype.slice.call(arguments);

				opt.error.apply(this, args);

			};

		}

		if (typeof opt === 'object') {

			jsonStr = JSON.stringify(opt);

		};

		// 尝试调用三端方法
		try { //ios

			window[fnName](jsonStr);

		} catch(e) {

			// console.log(e);

			try { // android

				window.android[fnName](jsonStr);

			} catch(e) { // browser

				if (f.debug) { // 如果开启了调试模式, 则打印错误信息

					console.log(e);
					console.log(fnName);

				}

				if (opt && typeof opt.error === 'function') {
					opt.error(fnName);
				}

			}

		}

	}

	// 展示当前Fph里面所有的方法名
	Fph.prototype.toString = function() {

		var f = this;
		return f.jsBridge;

	}

	window.fph = new Fph();

})(window, document);