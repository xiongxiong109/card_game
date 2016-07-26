// 点击翻牌接口
module.exports = function(req, res, next) {

	var json = {
    "serverCode": 1,
    "errorCode": 200,
    "status": 200,
    "msgType": 1,
    "msg": "OK",
    "returnValue": "",
    "returnObject":{
        "is_change": 2,
        "is_invalid": 2,
        "had_gift": 1,
        "is_can_flip": 1,
        "is_over": 2,
        "msg": "活动已失效",
        "gift": {
           "img": "aa.jpg", // 礼品图
           "type": 1, // 礼品类型
           "name": "鲁花花生油一瓶" // 礼品名
        }
    }
	}

	res.send(json);

}