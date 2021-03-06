
var https = require('https');
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var request = require('request');

var config = require('../config');
var cachePath = path.resolve(process.cwd(), 'cache.json');
var wechatData = require(cachePath);

var expireTime = 7200 - 100;

// 错误处理函数
var errorRender = function (res, info, data) {
	if(data){
		console.log(data);
		console.log('---------');
		res.json({errmsg: 'error', message: info, data: data});
	} else {
		res.json({errmsg: 'error', message: info});
	}
};

//写入文件
var writeFile = function(path, str, cb) {
	var writeStream = fs.createWriteStream(path);
	writeStream.write(str);
	writeStream.on('finish', function() {
		cb && cb();
	});
}

// 计算签名
var calcSignature = function (ticket, noncestr, ts, url) {
	var str = 'jsapi_ticket=' + ticket + '&noncestr=' + noncestr + '&timestamp='+ ts +'&url=' + url;
	return crypto.createHash('sha1').update(str).digest('hex');
}

// 随机字符串产生函数
var createNonceStr = function() {
	return Math.random().toString(36).substring(2,15);
}

//生成时间戳函数
var createTimeStamp = function() {
	return parseInt((new Date()).getTime() / 1000) + '';
}

//获取微信签名所需的access_token
var getToken = function(url, res) {
	https.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+ config.appid +'&secret=' + config.secret, function(_res) {
		var str = '';
		_res.on('data', function(data){
			str += data;
		});
		_res.on('end', function(){
			console.log('return access_token:  ' + str);
			try{
				var resp = JSON.parse(str);
			}catch(e){
		        return errorRender(res, '解析access_token返回的JSON数据错误', str);
			}
			getTicket(url, res, resp);
		});
	})
}

// 获取微信签名所需的ticket
var getTicket = function(url, res, accessData) {
	var getticketUrl = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+accessData.access_token+'&type=jsapi';
	request(getticketUrl, function(error, _res, body) {
		var resp;
		if (!error && _res.statusCode == 200) {
		 	try{
				resp = JSON.parse(body);
			}catch(e){
		        return errorRender(res, '解析远程JSON数据错误', body);
			}
			
			var appid = config.appid;
			var ts = createTimeStamp();
			var nonceStr = createNonceStr();
			var ticket = resp.ticket;
			var signature = calcSignature(ticket, nonceStr, ts, url);
console.log('appId:'+appid);
			wechatData[url] = {
				nonceStr: nonceStr,
				appid: appid,
				timestamp: ts,
				signature: signature,
				url: url
			};
			
			writeFile(cachePath, JSON.stringify(wechatData));

			res.json({
				nonceStr: nonceStr,
				timestamp: ts,
				appid: appid,
				signature: signature,
				url: url
			});
		} else {
			console.log(error);
		}
	});
}


module.exports = function(req, res) {
	var _url = req.body.url.indexOf('#') > 0 ? req.body.url.split('#')[0] : req.body.url;
	var signatureObj = wechatData[_url];

	if(!_url){
		return errorRender(res, '缺少url参数');
	}

	// 如果缓存中已存在签名，则直接返回签名
	if(signatureObj && signatureObj.timestamp){
		var t = createTimeStamp() - signatureObj.timestamp;
		console.log(signatureObj.url, _url);
		// 未过期，并且访问的是同一个地址
		// 判断地址是因为微信分享出去后会额外添加一些参数，地址就变了不符合签名规则，需重新生成签名
		if(t < expireTime && signatureObj.url == _url){
			console.log('======== result from cache ========');
			return res.json({
				nonceStr: signatureObj.nonceStr,
				timestamp: signatureObj.timestamp,
				appid: signatureObj.appid,
				signature: signatureObj.signature,
				url: signatureObj.url
			});
		}
	} else {
		getToken(_url, res);
	}
}

