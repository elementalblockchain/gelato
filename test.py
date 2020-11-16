#ganache-cli --port 8546 --hostname 192.168.1.200 --gasLimit 12000000 --accounts 10 --hardfork istanbul --mnemonic brownie --fork http://192.168.1.4:3334
import json
from web3 import HTTPProvider, Web3
from pymaker import Address
from pymaker.token import ERC20Token
from pymaker.numeric import Wad
from pymaker.sai import Tub
web3 = Web3(Web3.HTTPProvider('http://192.168.1.200:8546'))
#web3 = Web3(Web3.HTTPProvider('http://192.168.1.4:3334'))

ADDRESS = '0x66aB6D9362d4F35596279692F0251Db635165871'
PRIVATE_KEY = '0xbbfbee4961061d506ffbb11dfea64eba16355cbf1d9c29613126ba7fec0aed5d'

ADDRESS2 = '0x33A4622B82D4c04a53e170c638B944ce27cffce3'
PRIVATE_KEY2 = '0x804365e293b9fab9bd11bddd39082396d56d30779efbb3ffb0a6089027902c4a'

ABI = json.load(open('DssCdpManager.json','r'))
contractaddress = Web3.toChecksumAddress("0x5ef30b9986345249bc32d8928b7ee64de9435e39")
DssCdpManager = web3.eth.contract(abi=ABI, address=contractaddress)

WETH_ILK = "0x4554482d41000000000000000000000000000000000000000000000000000000"
WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

gasMultiplier = int(round(web3.eth.gasPrice*1,0))
gasPrice = web3.toHex(gasMultiplier)
gas = web3.toHex(10000000)

transaction = DssCdpManager.functions.open(WETH_ILK, WETH).buildTransaction({'chainId': 1, 'gas': gas,'gasPrice': gasPrice,'nonce': web3.toHex(web3.eth.getTransactionCount(ADDRESS)), 'from': ADDRESS})
print(transaction)
signedTx = web3.eth.account.signTransaction(transaction, PRIVATE_KEY)
txhash = web3.eth.sendRawTransaction(signedTx.rawTransaction)
print(txhash.hex())

