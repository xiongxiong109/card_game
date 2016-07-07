// 游戏配置默认选项

module.exports = {

	num: 3, // 切分块数
	bgImg: __uri("/assets/img/gift.jpg"), // 大奖图片
	houseImg: __uri("/assets/img/house.jpg"), // 楼盘图片
	curIdx: 3, // 当前可以翻动的块(连续第几天签到)
	canFlip: true, // 是否可以翻动(今天是否已签到)
	uId: 123, // 当前抽奖用户的id, 用于与后端交互

	ajaxApi: { // ajax提交的配置

		sign: { // 签到提交
			url: '/getSign',
			type: 'post'
		},
		
		info: { // 获取用户当前签到信息
			url: '/getInfo',
			type: 'get'
		}

	}

}