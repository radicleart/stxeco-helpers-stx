import { AppConfig, UserSession, showConnect, getStacksProvider, type StacksProvider } from '@stacks/connect';


const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig }); // we will use this export from other files
let provider:StacksProvider;

function getProvider() {
	if (!provider) provider = getStacksProvider()
	const prod = (provider.getProductInfo) ? provider.getProductInfo() : undefined;
	if (!prod) throw new Error('Provider not found')
	return prod
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

export async function loginStacks(callback:any) {
	try {
		const provider = getProvider()
		console.log('provider: ', provider)
		if (!userSession.isUserSignedIn()) {
			showConnect({
				userSession,
				appDetails: appDetails(),
				onFinish: async (e:unknown) => {
					console.log(e)
					await callback(true);
					window.location.reload()
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

  