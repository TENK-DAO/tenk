const assert = require('assert');
const { parseNearAmount } = require('near-api-js/lib/utils/format');
const testUtils = require('./test-utils');

const {
	gas,
	contractId,
	contractAccount,
} = testUtils;

describe('NFT Standard', function () {
	this.timeout(10000);

	it('should be deployed', async function() {
		const state = await contractAccount.state()
		try {
			await contractAccount.functionCall({
				contractId,
				methodName: 'new_default_meta',
				args: {
					owner_id: contractId
				},
				gas
			})
		} catch (e) {
			if (!/contract has already been initialized/.test(e.toString())) {
				console.warn(e)
			}
		}

		assert.notStrictEqual(state.code_hash, '11111111111111111111111111111111');
	});

	it('should allow owner to mint', async function() {
		const token_id = Date.now().toString()

		await contractAccount.functionCall({
			contractId,
			methodName: 'nft_mint',
			args: {
				token_id,
				token_owner_id: contractId,
				token_metadata: {
					media: 'https://placedog.net/500'
				}
			},
			gas,
			attachedDeposit: parseNearAmount('0.1')
		})

		const token = await contractAccount.viewFunction(
			contractId,
			'nft_token',
			{
				token_id,
			}
		)

		assert.strictEqual(token.owner_id, contractId);
	});
})
