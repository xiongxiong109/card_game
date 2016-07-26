// 换一张接口
module.exports = function(req, res, next) {

	var json = {
    "serverCode": 1,
    "errorCode": 200,
    "status": 200,
    "msgType": 1,
    "msg": "OK",
    "returnValue": "",
    "returnObject":{
        "has_flip": 1,
        "is_invalid": 1,
        "msg":"系统出错无法完成,重新翻牌或换一张",
        "flip_img":"/assets/img/gift.jpg",
        "gift_img":"/assets/img/house.jpg",
        "flip_model":2,
        "surplus_times":4,
        "flip_rule":"活动规则",
        "offer":"房品汇",
        "pid": 129,
        "property_name": "楼盘名",
        "is_change":2,
        "flip_id":3,
        "is_can_flip": 1
    }
	};

	res.send(json);

}