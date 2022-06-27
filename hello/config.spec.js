let assert = require('assert');
let config = require('./config');

describe('config', () => {
	it('has a reload that is a noop', () => {
		let original = JSON.parse(JSON.stringify(config));
		assert(config.reload !== undefined);
		config.reload();
		let reloaded = JSON.parse(JSON.stringify(config));
		assert.deepStrictEqual(original, reloaded);
	});
});
