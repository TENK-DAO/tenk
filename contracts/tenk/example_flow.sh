#! usr/bin/bash

set e

near deploy --wasmFile target/wasm32-unknown-unknown/release/tenk.wasm --accountId participant_26.testnet
export OWNER_ID=owner.testnet
export USER_ID=tenk_master.testnet

# init with price=10NEAR, discount - 30%, 
near call $CONTRACT_ID new '{
  "owner_id": "'$OWNER_ID'",
  "metadata": {
    "spec": "nft-1.0.0",
    "name": "Cheddar",
    "symbol": "Cheddar"
  },
  "size": 200,
  "sale": {
    "presale_start": 1669399200000,
    "public_sale_start": 1669399200000,
    "price": "10000000000000000000000000",	
    "allowance": 1,
    "initial_royalties": {
      "percent": 10000,
      "accounts": {
        "treasury1.cheddar.testnet": 10000
      }
    },
    "royalties": {
      "percent": 800,
      "accounts": {
        "treasury1.cheddar.testnet": 10000
      }
    }
  }
}' --accountId $CONTRACT_ID

#step2 whitelist your token as admin/owner and get him parameters

#fn whitelist_token, be accurate with decimals! 
export CHEDDAR=token-v3.cheddar.testnet
export LNC=lnc.factory.tokenhub.testnet 
near call $CONTRACT_ID whitelist_token '{"token_id":"'$CHEDDAR'","token_near":730000, "token_discount":30, "token_decimals":24}' --accountId $OWNER_ID
near call $CONTRACT_ID whitelist_token '{"token_id":"'$LNC'","token_near":500000, "token_discount":10, "token_decimals":24}' --accountId $OWNER_ID
#have a look
near view $CONTRACT_ID get_whitelisted_tokens '' --accountId $OWNER_ID
near view $CONTRACT_ID is_token_whitelisted '{"token_id":"'$CHEDDAR'"}' --accountId $OWNER_ID

#step3 mint

#get_sale_info
near view $CONTRACT_ID get_sale_info '' --accountId $OWNER_ID

#fn nft_mint_many(&mut self, token_id: Option<AccountId>, num: u32)
# with NEAR for 0 price - OWNER
near call $CONTRACT_ID nft_mint_many '{"num": 1}' --accountId $OWNER_ID --amount 10
# with NEAR for 10N price - USER
near call $CONTRACT_ID nft_mint_many '{"num": 1}' --accountId $USER_ID --depositYocto 10000000000000000000000001


# set new cheddar/near conversion
near call $CONTRACT_ID admin_set_token_near '{"token_id":"'$CHEDDAR'","token_near":100000}' --accountId $OWNER_ID

# deposit 750 cheddar, first register our nft contract in Cheddar
near call $CHEDDAR storage_deposit '' --amount 0.00125 --accountId=$CONTRACT_ID
near call $CHEDDAR ft_transfer_call '{"receiver_id":"'$CONTRACT_ID'", "amount":"750000000000000000000000000", "msg":""}' --accountId=$USER_ID --depositYocto 1 --gas=300000000000000

#mint with token - price will be 100 * 10 * 0.7 = 700 Cheddar
near call $CONTRACT_ID nft_mint_many '{"token_id":"'$CHEDDAR'","num": 1}' --accountId $USER_ID --amount 0.015

#withdraw 25
near call $CONTRACT_ID withdraw_token '{"amount":"25000000000000000000000000","token_id":"'$CHEDDAR'"}' --accountId=$USER
#check amount - 25
near call $CONTRACT_ID balance_of '{"account_id":"'$USER'","token_id":"'$CHEDDAR'"}' --accountId=$USER 
#withdraw all and unregister
near call $CONTRACT_ID withdraw_token '{"token_id":"'$CHEDDAR'"}' --accountId=$USER