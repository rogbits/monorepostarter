let net = require('net');
let dns = require('node:dns/promises');

async function convertHostToIp(hostname) {
	if (net.isIP(hostname)) {
		return hostname;
	}

	try {
		let {address, _} = await dns.lookup(hostname);
		return address;
	} catch (e) {
		throw e;
	}
}

module.exports = {
	convertHostToIp
};
