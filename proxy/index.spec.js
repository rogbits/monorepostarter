let Logger = require('../_jslib/logger');
let config = require('./config');
let assert = require('assert');
let index = require('./index');

describe('entrypoint', () => {
	let server = {
		start(fn) {
			fn();
		}
	};

	it('will reload configuration', function () {
		let logger = new Logger();
		logger.testingMode = true;
		let save = config.reload;

		let reloadCalled = false;
		config.reload = () => reloadCalled = true;
		index.main(logger, server);
		assert(reloadCalled);

		config.reload = save;
		logger.clear();
	});

	it('will start the server', () => {
		let logger = new Logger();
		logger.testingMode = true;

		index.main(logger, server);
		assert(logger.savedMessages[0] === 'loading configuration');
		assert(logger.savedMessages[1] === 'starting proxy server');
		assert(logger.savedMessages[2] === 'proxy server listening on 8080');

		logger.clear();
	});

	it('will exit on sigterm', () => {
		let logger = new Logger();
		logger.testingMode = true;

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
