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
        "is_change":1,
        "had_gift":1,
        "is_over":1,
        "gift":{
           "img":"aa.jpg",
           "type":1,
           "name":"礼品名"
        }
    }
	}

	res.send(json);

}