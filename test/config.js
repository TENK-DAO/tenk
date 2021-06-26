const contractName = 'dev-1624681145295-45420775783042';

module.exports = function getConfig(network = 'mainnet') {
	let config = {
		networkId: "testnet",
		nodeUrl: "https://rpc.testnet.near.org",
		walletUrl: "https://wallet.testnet.near.org",
		helperUrl: "https://helper.testnet.near.org",
		contractName,
	};

	switch (network) {
		case 'testnet':
			config = {
				explorerUrl: "https://explorer.testnet.near.org",
				...config,
				GAS: "200000000000000",
				DEFAULT_NEW_ACCOUNT_AMOUNT: "5",
				DEFAULT_NEW_CONTRACT_AMOUNT: "5",
				GUESTS_ACCOUNT_SECRET:
			"7UVfzoKZL4WZGF98C3Ue7tmmA6QamHCiB1Wd5pkxVPAc7j6jf3HXz5Y9cR93Y68BfGDtMLQ9Q29Njw5ZtzGhPxv",
	
				contractMethods: {
					changeMethods: [
						"new",
					],
					viewMethods: [],
				},
				
				contractId: contractName,
				marketId: "market." + contractName,
				fungibleId: "ft.hhft.testnet",
			};
		break;
		case 'mainnet':
			config = {
				...config,
				networkId: "mainnet",
				nodeUrl: "https://rpc.mainnet.near.org",
				walletUrl: "https://wallet.near.org",
				helperUrl: "https://helper.mainnet.near.org",
				contractName: "uhhmnft.near",
				contractId: "uhhmnft.near",
				marketId: "market.uhhmnft.near",
				fungibleId: "ft.hip-hop.near",
				ownerId: 'owner.uhhmnft.near',
			};
		break;
	}

	return config;
};
