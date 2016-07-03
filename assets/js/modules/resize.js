// 重新计算尺寸,根据屏幕尺寸，做设计图自适应
{
	// 获取dom的class
	class Doms {

		constructor() {

			this.doms = {
				$resizeWrap: $(".resize-wrap")
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
			var curW = $(window).width();
			var curH = $(window).height();

			// console.log(_this.ratio);

			// 默认宽度小于高度, 如果宽度大于高度, 则按高度来缩放
			
			if (curW < curH) {

				d.$resizeWrap.width('100%');
				d.$resizeWrap.height( d.$resizeWrap.width() / _this.ratio );

			} else {

				d.$resizeWrap.height('100%');
				d.$resizeWrap.width( d.$resizeWrap.height() * _this.ratio );
				
			}


		}

	}

	var AppResize = new Resize(750, 1334);

	AppResize.init();

	$(window).on('resize', function() {

		AppResize.resize();

	});

}