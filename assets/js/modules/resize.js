// 重新计算尺寸,根据屏幕尺寸，做设计图自适应
require('zepto');
{
	// 获取dom的class
	class Doms {

		constructor() {

			this.doms = {
				$cardBoxWrap: $(".card-box-wrap")
			}

		}

	}

	// 做尺寸自适应变化的class
	class Resize extends Doms {

		constructor (w, h) {

			super();

			this.baseWidth = w;
			this.baseHeight = h;
			this.ratio = w / h;

		}

		init() {

			var _this = this;

			_this.resize();

		}

		resize() {

			var _this = this;
			var d = _this.doms;

			// 保持盒子的宽高比例
			d.$cardBoxWrap.height(d.$cardBoxWrap.width() / 0.785);

		}

	}

	var AppResize = new Resize(750, 1334);

	AppResize.init();

	$(window).on('resize', function() {

		AppResize.resize();

	});

}