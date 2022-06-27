let Logger = require('../_jslib/logger');

function onRequest(req, res, logger) {
	logger = logger || new Logger();
	logger.log('incoming request from', req.headers.host, req.url,
		'x-forwarded-for', req.headers['x-forwarded-for'], req.socket.remoteAddress);
	res.end('hubs\n');
}

module.exports = {onRequest};
