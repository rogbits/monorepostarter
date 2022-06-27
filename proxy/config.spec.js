let assert = require('assert');
let config = require('./config');

describe('config', () => {
	it('has a config file that can reload', function () {
		assert(config.allowList.size === 0);

		process.env.ALLOW_LIST = '1.1.1.1,2.2.2.2';
		config.reload();
		assert(config.allowList.size === 2);
		assert(config.allowList.has('1.1.1.1'));
		assert(config.allowList.has('2.2.2.2'));

		process.env.ALLOW_LIST = '3.3.3.3,3.3.3.3';
		config.reload();
		console.assert(config.allowList.size === 1);
		assert(config.allowList.has('3.3.3.3'));

		process.env.ALLOW_LIST = '4.4.4.4 ,  4.4.4.4';
		config.reload();
		console.assert(config.allowList.size === 1);
		assert(config.allowList.has('4.4.4.4'));

		process.env.ALLOW_LIST = '1.1.1.1';
		config.reload();
		console.assert(config.allowList.size === 1);
		assert(config.allowList.has('1.1.1.1'));

		delete process.env.ALLOW_LIST;
		config.reload();
		assert(config.allowList.size === 0);
	});
});
