// 获取启动信息, 包括当前城市信息、用户uId

function getInfo(cb) {
	
	var rst = {
		uId: 1253,
		city_name: '上海市'
	}

	setTimeout(function() {

		cb && cb(rst);
		
	}, 1000);

}

module.exports = getInfo;