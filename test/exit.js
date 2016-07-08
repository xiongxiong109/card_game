module.exports = function(req, res, next) {

	var json = {
    "serverCode": 1,
    "errorCode": 200,
    "status": 200,
    "msgType": 1,
    "msg": "OK",
    "returnValue": "",
    "returnObject":{
        "status":1
    }
	}

	res.send(json);

}