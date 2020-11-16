const BigNumber = require('bignumber.js');
const Web3 = require('web3')
const DSA = require('dsa-sdk');
const web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.1.200:8546"))

const PRIVATE_KEY = '0xbbfbee4961061d506ffbb11dfea64eba16355cbf1d9c29613126ba7fec0aed5d';
const dsa = new DSA({
  web3: web3,
  mode: "node",
  privateKey: PRIVATE_KEY
});

const origin = "0x0000000000000000000000000000000000000000";
const address = "0x66aB6D9362d4F35596279692F0251Db635165871";
const vaultaddress = '0x5B084De896d138564962601a4648FE47468a87ac';
const botaddress = '0x33A4622B82D4c04a53e170c638B944ce27cffce3';

// main function
mainCall();
async function mainCall(){
  let balances = await getBalance();
  //console.dir(balances)

  let status;
  Object.keys(balances).forEach(key=> {
    status = balances[key].status;
  });

  let approvals;
  // if the status is above .55 which is roughly 180% collateralization, check the approvals of the DSA
  if (status > .50) {
    approvals = await getApproval();
  }

  if (approvals.includes(botaddress)) {
    console.log('READY');  
  }
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








