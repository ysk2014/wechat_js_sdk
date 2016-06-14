var express = require('express');
var router = express.Router();
var cors = require('cors');
var ctrl = require('../ctrl');

var corsOptions = {
	origin: 'http://wechat.yjshare.com'
};


router.post('/', cors(corsOptions), function(req, res, next) {
  	ctrl(req, res);
});

module.exports = router;
