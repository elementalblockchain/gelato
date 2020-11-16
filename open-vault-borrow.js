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
const botaddress = '0x33A4622B82D4c04a53e170c638B944ce27cffce3';

// main function
mainCall();
async function mainCall(){
  await buildIt();
  let accounts = await getAcct();
  console.log(accounts[0]);
  await setinstance(accounts[0]['id']);
  console.log("opening vault....")
  await openVault();
  console.log("borrowing DAI....")
  await borrowDAI();
  console.log("giving approval to the bot....")
  await giveApproval(botaddress);
  
}

// this function creates a DSA account through the build function
async function buildIt(){
  let tx = await dsa.build({gasPrice:66000000000, origin: origin, authority: address}).catch(e => {
     console.log('The build failed')
     throw e
  });
}

// this function gets account data for the users address and returns it
async function getAcct(){
  let realOut;
  await dsa.getAccounts(address).then((output) => {
     realOut = output;
  });
  return realOut;
}

// this function sets the instance which is the DSA to be used for subsequent calls
async function setinstance(dsaId){
  let instance
  await dsa.setInstance(dsaId).then((output) => {
     instance = output;
  });
  return instance;
}

// this function opens a maker vault and does an ETH deposit 
async function openVault() {
  let spells = dsa.Spell();

// the spell to open the vault
  spells.add({
    connector: "maker",
    method: "open",
    args: ["ETH-A"]
  });

// the spell to deposit ETH to the vault
  spells.add({
    connector: "maker",
    method: "deposit",
    args: [0, dsa.maxValue, 0, 0]
  });

// casting spells
   await dsa.cast({spells:spells, gasPrice: 66000000000, value: dsa.tokens.fromDecimal(1,"eth")}).catch(e => {
      console.log('The cast failed')
      throw e
   })
}

// this function performs the DAI borrowing
async function borrowDAI() {
  let spells = dsa.Spell();

// spell to borrow
  spells.add({
    connector: "maker",
    method: "borrow",
    args: [0, dsa.tokens.fromDecimal(200, "dai"), 0, 0]
  });

// casting spells
   await dsa.cast({spells:spells, gasPrice: 66000000000}).catch(e => {
      console.log('The cast failed')
      throw e
   })
}

// this function gives authority of the DSA to another address
async function giveApproval(bot) {
  let spells = dsa.Spell();

// spell to give control to the bot address
  spells.add({
    connector: "authority",
    method: "add",
    args: [bot]
  });

// casting spells
   await dsa.cast({spells:spells, gasPrice: 66000000000}).catch(e => {
      console.log('The cast failed')
      throw e
   })
}







