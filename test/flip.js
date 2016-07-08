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
			"is_can_flip": 1,
			"flip_img": "aa.jpg",
			"gift_img": "bb.jpg",
			"flip_model": 1,
			"is_invalid": 1,
			"surplus_times": 1,
			"flip_rule": "活动规则",
			"offer": "提供方",
			"pid": 129,
			"property_name": "楼盘名",
			"is_change": 1,
			"flip_id": 1
		}
	});

};