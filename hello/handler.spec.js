let assert = require('assert');
let handler = require('./handler');
let Logger = require('../_jslib/logger');

describe('requestHandler', () => {
	it('will return hello for all requests', function () {
		let logger = new Logger();
		let testReq = {
			headers: {
				host: 'test host',
			},
			url: '/testurl',
			socket: {
				remoteAddress: '1.1.1.1'
			}
		};

		let expectedMsg;
		let res = {
			end(msg) {
				expectedMsg = msg;
			}
		};

		logger.testingMode = true;
		handler.onRequest(testReq, res, logger);
		assert(logger.savedMessages[0] === 'incoming request from');
		assert(logger.savedMessages[1] === testReq.headers.host);
		assert(logger.savedMessages[2] === testReq.url);
		assert(expectedMsg === 'hubs\n');
	});
});
