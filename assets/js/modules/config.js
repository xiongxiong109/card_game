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

}