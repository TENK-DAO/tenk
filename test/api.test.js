const assert = require('assert');

const testUtils = require('./test-utils');

const {
	contractAccount,
} = testUtils;

describe('NFT Standard', function () {
	this.timeout(10000);

	it('should be deployed', async function() {
		const state = await contractAccount.state()

		assert.notStrictEqual(state.code_hash, '11111111111111111111111111111111');
	});
})
