// 翻翻乐活动接口
module.exports = function(req, res, next) {

	res.send({
		"serverCode": 1,
		"errorCode": 200,
		"status": 200,
		"msgType": 1,
		"msg": "OK",
		"returnValue": "",
		"returnObject": {
			"has_flip": 1,
			"uid": 1,
			"msg": "无法完成,重新翻牌",
			"is_can_flip": 1, // 是否可翻牌
			"flip_img": "/assets/img/house.jpg",
			"gift_img": "/assets/img/gift.jpg",
			"flip_model": 3,
			"is_invalid": 0,
			"surplus_times": 3, // 剩余天数
			"flip_rule": "每天翻一次，有惊喜哦，连续翻完所有拼图后，有机会赢得大奖！",
			"offer": "合景叠彩园",
			"pid": 129,
			"property_name": "楼盘名",
			"is_change": 1,
			"flip_id": 1
		}
	});

};