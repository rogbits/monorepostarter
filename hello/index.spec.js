let assert = require('assert');
let index = require('./index');
let Logger = require('../_jslib/logger');

describe('entrypoint', () => {
	let logger = new Logger();
	logger.testingMode = true;

	let server = {
		start(fn) {
			fn();
		}
	};

	it('will start a server and listen on the configured server port', function () {
		index.main(logger, server);
		assert(logger.savedMessages[0] === 'starting hello server');
		assert(logger.savedMessages[1] === 'hello server listening on 8080');
		logger.clear();
	});

	it('will exit on sigterm', function () {
		let save = process.exit;
		let exitCalled = false;
		process.exit = () => exitCalled = true;
		index.main(logger, server);
		process.emit('SIGTERM');
		assert(exitCalled);
		process.exit = save;
		logger.clear();
	});
});
