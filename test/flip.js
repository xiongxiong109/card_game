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
			"msg": "已经违规, 但是可以换一张",
			"is_can_flip": 1, // 是否可翻牌
			"flip_img": "/assets/img/house.jpg",
			"gift_img": "/assets/img/gift.jpg",
			"flip_model": 4,
			"is_invalid": 2,
			"surplus_times": 15, // 剩余天数
			"flip_rule": "每天翻一次，有惊喜哦，连续翻完所有拼图后，有机会赢得大奖！",
			"offer": "合景叠彩园",
			"pid": 129,
			"property_name": "楼盘名",
			"is_change": 1,
			"flip_id": 1
		}
	});

};