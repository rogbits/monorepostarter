let Server = require('../_jslib/server');
let Logger = require('../_jslib/logger');
let handler = require('./handler');
let config = require('./config');

function main(logger, server) {
	logger = logger || new Logger();
	logger.log('starting hello server');
	server = server || new Server(config.serverPort, handler.onRequest.bind(logger));
	server.start(() => logger.log(`hello server listening on ${config.serverPort}`));
	process.on('SIGTERM', () => {
		logger.log('received sig term, exiting');
		process.exit();
	});
}

if (require.main === module) {
	main();
} else {
	module.exports = {main};
}
