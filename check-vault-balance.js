const BigNumber = require('bignumber.js');
const Web3 = require('web3')
const DSA = require('dsa-sdk');
const web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.1.200:8546"))

const PRIVATE_KEY = '0x804365e293b9fab9bd11bddd39082396d56d30779efbb3ffb0a6089027902c4a';
const dsa = new DSA({
  web3: web3,
  mode: "node",
  privateKey: PRIVATE_KEY
});

//const origin = "0x0000000000000000000000000000000000000000";
const address = "0x66aB6D9362d4F35596279692F0251Db635165871";
const vaultaddress = '0xCD6C4b423C7c374B880388fF61744767CC4f1bFa';
const botaddress = '0x33A4622B82D4c04a53e170c638B944ce27cffce3';

// main function
mainCall();
async function mainCall(){
  let balances = await getBalance();
  console.dir(balances)

  let status;
  Object.keys(balances).forEach(key=> {
    status = balances[key].status;
  });
  
  // if the status is above .55 which is roughly 180% collateralization, check the approvals of the DSA
  let approvals;
  if (status > .40) {
    approvals = await getApproval();
  }


  let dsaId;
  let accounts = await getAccounts(address);
  dsaId = accounts[0]['id']
  
  await setinstance(dsaId);

  if (approvals.includes(botaddress)) {
    console.log("Approval Confirmed");
    await refinance();
    //console.log('Refinance Complete');  
  }
}

// this function retrieves DSA's for a specific address
async function getAccounts(address){
  let values
  await dsa.getAccounts(address).then((output) => {
     values = output;
  });
  return values;
}

// this function sets the instance which is the DSA to be used for subsequent calls
async function setinstance(dsaId){
  let instance
  await dsa.setInstance(dsaId).then((output) => {
     instance = output;
  });
  return instance;
}


// this function gets maker vault info for the specified DSA
async function getBalance(){
  let realOut;
  await dsa.maker.getVaults(vaultaddress).then((output) => {
     realOut = output;
  });
  return realOut;
}

// this function verifies the bot address has authority over the vault
async function getApproval(){
  let realOut;
  await dsa.getAuthByAddress(vaultaddress).then((output) => {
     realOut = output;
  });
  return realOut;
}


// this function refinances a maker vault to compound
async function refinance() {
let borrowAmount = dsa.tokens.fromDecimal(2000, "dai"); // 200000 DAI
let dai_address = dsa.tokens.info.dai.address
let eth_address = dsa.tokens.info.eth.address
let vault_id = 0; // User's Vault ID

let spells = dsa.Spell();

spells.add({
  connector: "instapool",
  method: "flashBorrow",
  args: [dai_address, borrowAmount, 0, 0]
});

spells.add({
  connector: "maker",
  method: "payback",
  args: [vault_id, dsa.maxValue, 0, "534"] // max payback and setting the payback amount with id 534
});

spells.add({
  connector: "maker",
  method: "withdraw",
  args: [vault_id, dsa.maxValue, 0, "987"] // max withdraw and setting the withdrawn amount with id 987
});

spells.add({
  connector: "compound",
  method: "deposit",
  args: [eth_address, 0, "987", 0] // get deposit amount with id 987
});

spells.add({
  connector: "compound",
  method: "borrow",
  args: [dai_address, 0, "534", 0] // get borrow amount with id 534
});

spells.add({
  connector: "instapool",
  method: "flashPayback",
  args: [dai_address, 0, 0]
});

// casting spells
   await dsa.cast({spells:spells, gas:2000000,  gasPrice: 66000000000}).catch(e => {
      console.log('The cast failed')
      throw e
   })
}





