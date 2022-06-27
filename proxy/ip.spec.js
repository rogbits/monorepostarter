let assert = require('assert');
let ip = require('./ip');
let dns = require('node:dns/promises');

describe('ip', () => {
	it('provides a function to convert hostnames to ip addresses', async () => {
		let returnedIp = await ip.convertHostToIp('1.1.1.1');
		assert(returnedIp === '1.1.1.1');

		returnedIp = await ip.convertHostToIp('::1');
		assert(returnedIp === '::1');

		let save = dns.lookup;
		dns.lookup = () => Promise.resolve({
			address: '1.2.3.4',
			family: 4
		});
		returnedIp = await ip.convertHostToIp('test.moz');
		assert(returnedIp === '1.2.3.4');

		let threwError = false;
		dns.lookup = () => Promise.reject('testing error handling');
		try {
			returnedIp = await ip.convertHostToIp();
		} catch (e) {
			threwError = true;
		}
		assert(threwError);

		dns.lookup = save;
	});
});
