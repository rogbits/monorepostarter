let http = require('http');

class Server {
	port = 0;
	server = null;

	constructor(port, requestListener) {
		this.port = port;
		this.server = http.createServer(requestListener.bind(this));
	}

	start(onListen) {
		this.server.listen(this.port, onListen);
	}
}

module.exports = Server;
