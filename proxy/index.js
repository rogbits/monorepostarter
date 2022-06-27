let Server = require('../_jslib/server');
let Logger = require('../_jslib/logger');
let handler = require('./handler');
let config = require('./config');

function main(logger, server) {
	logger = logger || new Logger();
	logger.log('loading configuration');
	config.reload();

	logger.log('starting proxy server');
	server = server || new Server(config.serverPort, handler.onRequest.bind(logger));
	server.start(() => logger.log(`proxy server listening on ${config.serverPort}`));
	process.on('SIGTERM', () => {
		logger.log('received sigterm, process exiting');
		process.exit();
	});
}

if (require.main === module) {
	main();
} else {
	module.exports = {main};
}
