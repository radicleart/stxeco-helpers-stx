import { AppConfig, UserSession, showConnect, getStacksProvider, type StacksProvider } from '@stacks/connect';
import { c32address, c32addressDecode } from 'c32check';
import { AddressObject, ExchangeRate, SbtcUserSettingI } from '../sbtc';
import { getWalletBalances } from '../custom-node';
import { fetchStacksInfo, getPoxInfo, getStacksNetwork, getTokenBalances } from '../stacks-node';
import * as btc from '@scure/btc-signer';
import { SessionStore } from '../stxeco_types';
import { PoxInfo, StacksInfo } from '../pox_types';


const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig }); // we will use this export from other files
let provider:StacksProvider;

function getProvider() {
	if (!provider) provider = getStacksProvider()
	const prod = (provider.getProductInfo) ? provider.getProductInfo() : undefined;
	if (!prod) throw new Error('Provider not found')
	return prod
}

export async function getBalances(stacksApi:string, mempoolApi:string, contractId:string, stxAddress:string, cardinal:string, ordinal:string):Promise<AddressObject> {
	let result = {} as AddressObject;
	try {
		result.tokenBalances = await getTokenBalances(stacksApi, stxAddress);
		result.walletBalances = await getWalletBalances(stacksApi, mempoolApi, stxAddress, cardinal, ordinal);
		try {
			result.sBTCBalance = Number(result.tokenBalances?.fungible_tokens[contractId + '::sbtc'].balance)
		} catch (err) {
			result.sBTCBalance = 0
		}
	} catch(err) {
		console.log('Network down...');
	}
	return result;
}

export function isXverse() {
	//const prov1 = (window as any).LeatherProvider //getProvider()
	//const prov2 = (window as any).XverseProvider //getProvider()
	const xverse = getProvider().name.toLowerCase().indexOf('xverse') > -1
	return xverse
}

export function isHiro() {
	return getProvider().name.toLowerCase().indexOf('hiro') > -1
}

export function isAsigna() {
	return getProvider().name.toLowerCase().indexOf('asigna') > -1
}

export function isLeather() {
	return getProvider().name.toLowerCase().indexOf('leather') > -1
}

export function appDetails() {
	return {
		name: 'stxeco-launcher',
		icon: (window) ? window.location.origin + '/img/stx_eco_logo_icon_white.png' : '/img/stx_eco_logo_icon_white.png',
	}
}

export function isLoggedIn():boolean {
	try {
		return userSession.isUserSignedIn()
	} catch (err) {
		return false
	}
}

export function getStacksAddress(network:string) {
	if (isLoggedIn()) {
		const userData = userSession.loadUserData();
		const stxAddress = (network === 'testnet' || network === 'devnet') ? userData.profile.stxAddress.testnet : userData.profile.stxAddress.mainnet;
		return stxAddress
	}
	return
}

export async function loginStacks(appDetails:{ name:string, icon:string }, callback:any) {
	try {
		const provider = getProvider()
		console.log('provider: ', provider)
		if (!userSession.isUserSignedIn()) {
			showConnect({
				userSession,
				appDetails,
				onFinish: async (e:unknown) => {
					console.log(e)
					callback(true);
				},
				onCancel: () => {
					callback(false);
				},
			});
		} else {
			callback(true);
		}
	} catch (e) {
		if (window) window.location.href = "https://wallet.hiro.so/wallet/install-web";
		callback(false);
	}
}

export function loginStacksFromHeader(document:any) {
	const el = document.getElementById("connect-wallet")
	if (el) return document.getElementById("connect-wallet").click();
	else return false;
}

export function logUserOut() {
	return userSession.signUserOut();
}

export function checkAddressForNetwork(net:string, address:string|undefined) {
	if (!address || typeof address !== 'string') throw new Error('No address passed')
  if (address.length < 10) throw new Error('Address is undefined')
  if (net === 'devnet') return
	else if (net === 'testnet') {
	  if (address.startsWith('bc')) throw new Error('Mainnet address passed to testnet app: ' + address)
	  else if (address.startsWith('3')) throw new Error('Mainnet address passed to testnet app: ' + address)
	  else if (address.startsWith('1')) throw new Error('Mainnet address passed to testnet app: ' + address)
	  else if (address.startsWith('SP') || address.startsWith('sp')) throw new Error('Mainnet stacks address passed to testnet app: ' + address)
	} else {
	  if (address.startsWith('tb')) throw new Error('Testnet address passed to testnet app: ' + address)
	  else if (address.startsWith('2')) throw new Error('Testnet address passed to testnet app: ' + address)
	  else if (address.startsWith('m')) throw new Error('Testnet address passed to testnet app: ' + address)
	  else if (address.startsWith('n')) throw new Error('Testnet address passed to testnet app: ' + address)
	  else if (address.startsWith('ST') || address.startsWith('st')) throw new Error('Testnet stacks address passed to testnet app: ' + address)
	}
}

const FORMAT = /[ `!@#$%^&*()_+=[\]{};':"\\|,<>/?~]/;

export function decodeStacksAddress(stxAddress:string) {
	if (!stxAddress) throw new Error('Needs a stacks address');
	const decoded = c32addressDecode(stxAddress)
	return decoded
}
  
export function encodeStacksAddress (network:string, b160Address:string) {
	let version = 26
	if (network === 'mainnet') version = 22
	const address = c32address(version, b160Address) // 22 for mainnet
	return address
}

export function verifyStacksPricipal(network:string, stacksAddress?:string) {
	if (!stacksAddress) {
	  throw new Error('Address not found');
	} else if (FORMAT.test(stacksAddress)) {
	  throw new Error('please remove white space / special characters');
	}
	try {
	  const decoded = decodeStacksAddress(stacksAddress.split('.')[0]);
	  if ((network === 'testnet' || network === 'devnet') && decoded[0] !== 26) {
		throw new Error('Please enter a valid stacks blockchain testnet address');
	  }
	  if (network === 'mainnet' && decoded[0] !== 22) {
		throw new Error('Please enter a valid stacks blockchain mainnet address');
	  }
	  return stacksAddress;
	  } catch (err:any) {
		  throw new Error('Invalid stacks principal - please enter a valid ' + network + ' account or contract principal.');
	  }
}

export function getNet(network:string) {
	let net = btc.TEST_NETWORK;
	if (network === 'devnet') net = REGTEST_NETWORK
	else if (network === 'mainnet') net = btc.NETWORK
	return net;
}
export const REGTEST_NETWORK: typeof btc.NETWORK = { bech32: 'bcrt', pubKeyHash: 0x6f, scriptHash: 0xc4, wif: 0xc4 };




async function addresses(network:string, callback:any):Promise<AddressObject|undefined> {
	if (!isLoggedIn()) return {} as AddressObject;
	const userData = userSession.loadUserData();
	//let something = hashP2WPKH(payload.public_keys[0])
	const stxAddress = getStacksAddress(network);
	let ordinal = 'unknown'
	let cardinal = 'unknown'
	let btcPubkeySegwit0 = 'unknown'
	let btcPubkeySegwit1 = 'unknown'

	try {
		if (!userData.profile.btcAddress) {
			// asigna
			callback({
				network,
				stxAddress,
				cardinal: 'unknown',
				ordinal: 'unknown',
				btcPubkeySegwit0: 'unknown',
				btcPubkeySegwit1: 'unknown',
				sBTCBalance: 0,
				stxBalance: 0
			});
		} else if (typeof userData.profile.btcAddress === 'string') {
			// xverse
			callback({
				network,
				stxAddress,
				cardinal: userData.profile.btcAddress,
				ordinal: 'unknown',
				btcPubkeySegwit0: 'unknown',
				btcPubkeySegwit1: 'unknown',
				sBTCBalance: 0,
				stxBalance: 0
			});
		} else {
			try {
				ordinal = userData.profile.btcAddress.p2tr.testnet
				cardinal = userData.profile.btcAddress.p2wpkh.testnet
				if (network === 'mainnet') {
					ordinal = userData.profile.btcAddress.p2tr.mainnet
					cardinal = userData.profile.btcAddress.p2wpkh.mainnet
				} else if (network === 'devnet') {
					ordinal = userData.profile.btcAddress.p2tr.regtest
					cardinal = userData.profile.btcAddress.p2wpkh.regtest
				} else if (network === 'signet') {
					ordinal = userData.profile.btcAddress.p2tr.signet
					cardinal = userData.profile.btcAddress.p2wpkh.signet
				}
				btcPubkeySegwit0 = userData.profile.btcPublicKey.p2wpkh
				btcPubkeySegwit1 = userData.profile.btcPublicKey.p2tr
			} catch(err:any) { 
				//
			}
	
			if (userData.profile.btcAddress) {
				callback({
					network,
					stxAddress,
					cardinal,
					ordinal,
					btcPubkeySegwit0,
					btcPubkeySegwit1,
					sBTCBalance: 0,
					stxBalance: 0
				});
			} else {
				callback({
					network,
					stxAddress,
					cardinal: 'unknown',
					ordinal: 'unknown',
					btcPubkeySegwit0: 'unknown',
					btcPubkeySegwit1: 'unknown',
					sBTCBalance: 0,
					stxBalance: 0
				});
			}
		}
	} catch(err:any) {
		console.log('addresses: ', err)
	}
}

export function makeFlash(el1:HTMLElement|null) {
	let count = 0;
	if (!el1) return;
	el1.classList.add("flasherize-button");
    const ticker = setInterval(function () {
		count++;
		if ((count % 2) === 0) {
			el1.classList.add("flasherize-button");
		}
		else {
			el1.classList.remove("flasherize-button");
		}
		if (count === 2) {
			el1.classList.remove("flasherize-button");
			clearInterval(ticker)
		}
	  }, 2000)
}

export function isLegal(routeId:string):boolean {
	try {
		if (userSession.isUserSignedIn()) return true;
		if (routeId.startsWith('http')) {
			if (routeId.indexOf('/deposit') > -1 || routeId.indexOf('/withdraw') > -1 || routeId.indexOf('/admin') > -1 || routeId.indexOf('/transactions') > -1) {
				return false;
			}
		} else if (['/deposit', '/withdraw', '/admin', '/transactions'].includes(routeId)) {
			return false;
		}
		return true;
	} catch (err) {
		return false
	}
}

export function verifyAmount(amount:number, balance:number) {
	if (!amount || amount === 0) {
		throw new Error('No amount entered');
	}
	if (amount >= balance) {
		throw new Error('Amount is greater than your balance');
	}
  	//if (amount < minimumDeposit) {
	//	throw new Error('Amount must be at least 0.0001 or 10,000 satoshis');
	//  }
}
export function verifySBTCAmount(amount:number, balance:number, fee:number) {
	if (!amount || amount === 0) {
		throw new Error('No amount entered');
	}
	if (amount > (balance - fee)) {
		throw new Error('No more then balance (less fee of ' + fee + ')');
	}
}

export function initAddresses(network:string, sessionStore:any) {
	sessionStore.update((conf:SessionStore) => {
		if (!conf.keySets || !conf.keySets['devnet']) conf.keySets['devnet'] = {} as AddressObject;
		if (!conf.keySets || !conf.keySets['testnet']) conf.keySets['testnet'] = {} as AddressObject;
		if (!conf.keySets || !conf.keySets['mainnet']) conf.keySets['mainnet'] = {} as AddressObject;
		conf.stacksInfo = {} as StacksInfo
		conf.poxInfo = {} as PoxInfo
		conf.loggedIn = userSession.isUserSignedIn();
		conf.exchangeRates = [] as Array<ExchangeRate>;
		conf.userSettings = {} as SbtcUserSettingI
		return conf;
	});
}

export async function initApplication(stacksApi:string, mempoolApi:string, network:string, sessionStore:any, exchangeRates:Array<ExchangeRate>, ftContract:string) {
	try {
		const stacksInfo = await fetchStacksInfo(stacksApi) || {} as StacksInfo;
		const poxInfo = await getPoxInfo(stacksApi)
		const settings = sessionStore.userSettings || defaultSettings()
		const rateNow = exchangeRates?.find((o:any) => o.currency === 'USD') || {currency: 'USD'} as ExchangeRate;
		
		settings.currency = {
			myFiatCurrency: rateNow || defaultExchangeRate(),
			cryptoFirst: true,
			denomination: 'USD'
		}
		sessionStore.update((conf:SessionStore) => {
			conf.stacksInfo = stacksInfo
			conf.poxInfo = poxInfo
			conf.loggedIn = userSession.isUserSignedIn();
			conf.exchangeRates = exchangeRates || [] as Array<ExchangeRate>;
			conf.userSettings = settings
			return conf;
		});

		if (isLoggedIn() ) {
			await addresses(network, async function(obj:AddressObject) {
				console.log('in callback')
				
				obj.tokenBalances = await getTokenBalances(stacksApi, obj.stxAddress)
				obj.sBTCBalance = Number(obj.tokenBalances?.fungible_tokens[ftContract + '::sbtc']?.balance || 0)
				obj.walletBalances = await getWalletBalances(stacksApi, mempoolApi, obj.stxAddress, obj.cardinal, obj.ordinal)

				sessionStore.update((conf:SessionStore) => {
					conf.loggedIn = userSession.isUserSignedIn();
					conf.keySets[network] = obj
					conf.exchangeRates = exchangeRates || [] as Array<ExchangeRate>;
					conf.userSettings = settings
					return conf;
				});
			})
		}
	
	} catch (err:any) {
		initAddresses(network, sessionStore)
	}
}

function defaultSettings():SbtcUserSettingI {
	return {
		debugMode: false,
		useOpDrop: false,
		peggingIn: false,
		executiveTeamMember: false,
		currency: {
		  cryptoFirst: true,
		  myFiatCurrency: defaultExchangeRate(),
		  denomination: 'USD',
		}
	}
}

function defaultExchangeRate():ExchangeRate {
	return {
		_id: '',
		currency: 'USD',
		fifteen: 0,
		last: 0,
		buy: 0,
		sell: 0,
		symbol: 'USD',
		name: 'BTCUSD'			  
	}
  }
  