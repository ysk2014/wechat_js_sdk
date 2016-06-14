var express = require('express');
var router = express.Router();
var cors = require('cors');
var ctrl = require('../ctrl');

app.all('*',function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
	res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');

	if (req.method == 'OPTIONS') {
		res.send(200); /让options请求快速返回/
	}
	else {
		next();
	}
});

app.use(cors());

router.get('/', function(req, res, next) {
	res.send('启动成功');
});
router.post('/', function(req, res, next) {
  	ctrl(req, res);
});

module.exports = router;
