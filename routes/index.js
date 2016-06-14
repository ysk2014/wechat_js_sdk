var express = require('express');
var router = express.Router();
var cors = require('cors');
var ctrl = require('../ctrl');

app.use(cors());

router.get('/', function(req, res, next) {
	res.send('启动成功');
});
router.post('/', function(req, res, next) {
  	ctrl(req, res);
});

module.exports = router;
