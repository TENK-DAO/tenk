const fs = require("fs");
const BN = require('bn.js');
const fetch = require('node-fetch');
const nearAPI = require('near-api-js');
const { KeyPair, Account, Contract, utils: { format: { parseNearAmount } } } = nearAPI;
const { near, credentials, connection, keyStore, contract, contractAccount } = require('./near-utils');
const getConfig = require('./config');
const {
	networkId, contractName, contractMethods, gas,
	DEFAULT_NEW_ACCOUNT_AMOUNT, 
	DEFAULT_NEW_CONTRACT_AMOUNT,
} = getConfig('testnet');

const TEST_HOST = 'http://localhost:3000';
/// exports
async function initContract() {
	/// try to call new on contract, swallow e if already initialized
	try {
		const newArgs = {
			owner_id: contractAccount.accountId,
			"metadata": {
				"spec": "nft-1",
				"name": "UHHM NFT - Hip Hop Heads",
				"symbol": "HHH"
			},
			supply_cap_by_type: {
				test: '1000000',
			},
		};
		await contract.new(newArgs);
	} catch (e) {
		if (!/initialized/.test(e.toString())) {
			throw e;
		}
	}
	return { contract, contractName };
}
const getAccountBalance = async (accountId) => (new nearAPI.Account(connection, accountId)).getAccountBalance();

const initAccount = async(accountId, secret) => {
	account = new nearAPI.Account(connection, accountId);
	const newKeyPair = KeyPair.fromString(secret);
	keyStore.setKey(networkId, accountId, newKeyPair);
	return account
}

const createOrInitAccount = async(accountId, secret, amount = DEFAULT_NEW_CONTRACT_AMOUNT) => {
	let account;
	try {
		account = await createAccount(accountId, amount, secret);
	} catch (e) {
		if (!/because it already exists/.test(e.toString())) {
			throw e;
		}
		account = initAccount(accountId, secret)
	}
	return account;
};

async function getAccount(accountId, fundingAmount = DEFAULT_NEW_ACCOUNT_AMOUNT, secret) {
	accountId = accountId || generateUniqueSubAccount();
	const account = new nearAPI.Account(connection, accountId);
	try {
		await account.state();
		return account;
	} catch(e) {
		if (!/does not exist/.test(e.toString())) {
			throw e;
		}
	}
	return await createAccount(accountId, fundingAmount, secret);
};


async function getContract(account) {
	return new Contract(account || contractAccount, contractName, {
		...contractMethods,
		signer: account || undefined
	});
}


const createAccessKeyAccount = (key) => {
	connection.signer.keyStore.setKey(networkId, contractName, key);
	return new Account(connection, contractName);
};

const postSignedJson = async ({ account, contractName, url, data = {} }) => {
	return await fetch(url, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			...data,
			accountId: account.accountId,
			contractName,
			...(await getSignature(account))
		})
	}).then((res) => {
		// console.log(res)
		return res.json();
	});
};

const postJson = async ({ url, data = {} }) => {
	return await fetch(url, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ ...data })
	}).then((res) => {
		console.log(res);
		return res.json();
	});
};

function generateUniqueSubAccount() {
	return `t${Date.now()}.${contractName}`;
}

/// internal
async function createAccount(accountId, fundingAmount = DEFAULT_NEW_ACCOUNT_AMOUNT, secret) {
	const contractAccount = new Account(connection, contractName);
	const newKeyPair = secret ? KeyPair.fromString(secret) : KeyPair.fromRandom('ed25519');
	await contractAccount.createAccount(accountId, newKeyPair.publicKey, new BN(parseNearAmount(fundingAmount)));
	keyStore.setKey(networkId, accountId, newKeyPair);
	return new nearAPI.Account(connection, accountId);
}

const getSignature = async (account) => {
	const { accountId } = account;
	const block = await account.connection.provider.block({ finality: 'final' });
	const blockNumber = block.header.height.toString();
	const signer = account.inMemorySigner || account.connection.signer;
	const signed = await signer.signMessage(Buffer.from(blockNumber), accountId, networkId);
	const blockNumberSignature = Buffer.from(signed.signature).toString('base64');
	return { blockNumber, blockNumberSignature };
};

const loadCredentials = (accountId) => {
	const credPath = `./neardev/${networkId}/${accountId}.json`;
	console.log(
		"Loading Credentials:\n",
		credPath
	);

	let credentials;
	try {
		credentials = JSON.parse(
			fs.readFileSync(
				credPath
			)
		);
	} catch(e) {
		console.warn('credentials not in /neardev');
		/// attempt to load backup creds from local machine
		credentials = JSON.parse(
			fs.readFileSync(
				`${process.env.HOME}/.near-credentials/${networkId}/${accountId}.json`
			)
		);
	}

	return credentials
}

module.exports = { 
	TEST_HOST,
	near,
	gas,
	connection,
	credentials,
	keyStore,
	getContract,
	getAccountBalance,
	contract,
	contractName,
	contractId: contractName,
	contractMethods,
	contractAccount,
	initAccount,
	createOrInitAccount,
	createAccessKeyAccount,
	initContract, getAccount, postSignedJson, postJson,
	loadCredentials,
};

