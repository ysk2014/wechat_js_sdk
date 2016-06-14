var express = require('express');
var router = express.Router();

var ctrl = require('../ctrl');

//设置跨域访问
// router.all('*', function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "X-Requested-With");
//     res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
//     res.header("X-Powered-By",' 3.2.1')
//     res.header("Content-Type", "application/json;charset=utf-8");
//     next();
// });

// router.use(cors());

router.get('/', function(req, res, next) {
	res.send('启动成功!!!!');
});
router.post('/sg', function(req, res, next) {
	res.set({
		"Access-Control-Allow-Origin": "*"
		,"Access-Control-Allow-Methods": "POST,GET"
		,"Access-Control-Allow-Credentials": "true"
	});
  	ctrl(req, res);
});

module.exports = router;
