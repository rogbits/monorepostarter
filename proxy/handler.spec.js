let assert = require('assert');
let Logger = require('../_jslib/logger');
let ip = require('./ip');
let config = require('./config');
let http = require('http');
let handler = require('./handler');

describe('requestHandler', () => {
	let req = {
		url: '/testurl',
		headers: {
			host: 'testhost',
		},
		pipe(writable, options) {
			this.pipedWritable = writable;
			this.pipedOptions = options;
		}
	};

	let res = {
		writeHead(statusCode, headers) {
			this.statusCode = statusCode;
			this.headers = headers;
		},
		end(msg) {
			this.msg = msg;
		}
	};

	let proxyRes = {
		statusCode: 100,
		headers: {
			host: 'client-test-host'
		},
		writeHead(statusCode) {
			this.statusCode = statusCode;
		},
		pipe(readable, pipeOptions) {
			this.pipeReadable = readable;
			this.pipeOptions = pipeOptions;
		}
	};

	let proxyReq = {
		on(event, fn) {
			this.handlers = this.handlers || {};
			this.handlers[event] = fn;
		},
		emit(event) {
			this.handlers[event]();
		}
	};

	function httpRequest(options, fn) {
		fn(proxyRes);
		return proxyReq;
	}

	let logger = new Logger();
	logger.testingMode = true;

	it('will log the incoming request', function () {
		handler.onRequest(req, res, logger);
		assert(logger.savedMessages[0] === 'incoming request from testhost');
		logger.clear();
	});

	it('will return 400 on a missing backend-host header', function () {
		handler.onRequest(req, res, logger);
		assert(res.statusCode === 400);
		assert(res.msg === 'missing backend-host header\n');
		logger.clear();
	});

	it('will fetch the ip for the given host', async function () {
		req.headers['backend-host'] = 'api';

		let save = ip.convertHostToIp;
		req.headers['backend-host'] = 'api';

		let passedHost = false;
		ip.convertHostToIp = async function (host) {
			passedHost = host !== undefined;
			return '1.1.1.1';
		};
		await handler.onRequest(req, res, logger);
		assert(passedHost);
		assert(logger.savedMessages[2] === 'retrieved ip for testhost : 1.1.1.1');

		ip.convertHostToIp = save;
		logger.clear();
	});

	it('will send a 401 if host to ip conversion fails', async () => {
		req.headers['backend-host'] = 'api';

		let save = ip.convertHostToIp;
		ip.convertHostToIp = () => Promise.reject(
			new Error('dns lookup failed'));

		await handler.onRequest(req, res, logger);
		assert(res.statusCode === 401);
		assert(res.msg === 'unauthorized\n');
		assert(logger.savedMessages[2] === 'error looking up IP address: dns lookup failed');
		assert(logger.savedMessages[3] === 'dropping connection for: testhost');

		ip.convertHostToIp = save;
		logger.clear();
	});

	it('will refresh the allow list before checking it', async function () {
		let convertSave = ip.convertHostToIp;
		let reloadSave = config.reload;
		ip.convertHostToIp = () => '1.1.1.1';

		let reloadCalled = false;
		config.reload = () => reloadCalled = true;
		await handler.onRequest(req, res, logger);
		assert(reloadCalled);

		ip.convertHostToIp = convertSave;
		config.reload = reloadSave;
		logger.clear();
	});

	it('will send a 401 if the request is not in the allow list', async function () {
		req.headers['backend-host'] = 'api';

		let save = ip.convertHostToIp;
		ip.convertHostToIp = () => '1.2.3.4';
		process.env.ALLOW_LIST = '5.5.5.5';

		await handler.onRequest(req, res, logger);
		assert(res.statusCode === 401);
		assert(res.msg === 'unauthorized\n');
		assert(logger.savedMessages.pop() === 'dropping request from testhost:1.2.3.4');

		ip.convertHostToIp = save;
		logger.clear();
	});

	it('will proxy the request to the backend host if all else goes well', async function () {
		req.headers['backend-host'] = 'api';

		let convertSave = ip.convertHostToIp;
		let requestSave = http.request;

		ip.convertHostToIp = () => '1.2.3.4';
		process.env.ALLOW_LIST = '1.2.3.4';

		http.request = httpRequest;
		await handler.onRequest(req, res, logger);
		assert(logger.savedMessages[5] === '1.2.3.4 in allow list');
		assert(logger.savedMessages[6] === 'making request to backend: api');
		assert(res.statusCode === proxyRes.statusCode);
		assert(res.headers.host === 'client-test-host');
		assert(proxyRes.pipeReadable === res);
		assert(proxyRes.pipeOptions.end === true);
		assert(req.pipedWritable === proxyReq);
		assert(req.pipedOptions.end === true);

		ip.convertHostToIp = convertSave;
		http.request = requestSave;
		logger.clear();
	});

	it('will return a 503 if there is an error on the proxy request', async function () {
		req.headers['backend-host'] = 'api';

		let convertSave = ip.convertHostToIp;
		let requestSave = http.request;

		ip.convertHostToIp = () => '1.2.3.4';
		process.env.ALLOW_LIST = '1.2.3.4';

		http.request = httpRequest;
		await handler.onRequest(req, res, logger);
		proxyReq.emit('error');
		assert(res.statusCode === 503);
		assert(res.msg === 'unable to connect to backend: api\n');

		ip.convertHostToIp = convertSave;
		http.request = requestSave;
		logger.clear();
	});
});
