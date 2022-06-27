let http = require('http');
let {URL} = require('url');
let Logger = require('../_jslib/logger');
let config = require('./config');
let ip = require('./ip');

async function onRequest(req, res, logger) {
	logger = logger || new Logger();
	let url = new URL(req.url, `http://${req.headers.host}`);
	logger.log(`incoming request from ${url.host}`);

	if (!req.headers['backend-host']) {
		res.writeHead(400);
		res.end('missing backend-host header\n');
		return;
	}

	logger.log(`fetching ip for ${url.host}`);
	let clientIp = null;
	try {
		clientIp = await ip.convertHostToIp(url.host);
	} catch (e) {
		logger.log(
			`error looking up IP address: ${e.message}`,
			`dropping connection for: ${url.host}`);
		res.writeHead(401);
		res.end('unauthorized\n');
		return;
	}
	logger.log(`retrieved ip for ${req.headers.host} : ${clientIp}`);

	logger.log('refreshing allow list');
	config.reload();

	logger.log(`checking list for ${clientIp}`,);
	if (!config.allowList.has(clientIp)) {
		logger.log(`dropping request from ${url.host}:${clientIp}`);
		res.writeHead(401);
		res.end('unauthorized\n');
		return;
	}
	logger.log(`${clientIp} in allow list`);

	let backEndHost = req.headers['backend-host'];
	req.headers['x-forwarded-for'] = clientIp;
	let options = {
		hostname: backEndHost,
		port: 8080,
		path: req.url,
		method: req.method,
		headers: req.headers
	};
	logger.log(`making request to backend: ${backEndHost}`);
	let proxyReq = http.request(options, (proxyRes) => {
		res.writeHead(proxyRes.statusCode, proxyRes.headers);
		proxyRes.pipe(res, {end: true});
	});
	req.pipe(proxyReq, {end: true});
	proxyReq.on('error', () => {
		res.writeHead(503);
		res.end(`unable to connect to backend: ${backEndHost}\n`);
	});
}

module.exports = {onRequest};
