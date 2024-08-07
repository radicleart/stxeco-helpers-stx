import { StacksMainnet, StacksMocknet, StacksTestnet } from "@stacks/network";
import { TokenBalances } from "../sbtc";
import { cvToJSON, deserializeCV } from "@stacks/transactions";
import { PoxInfo } from "../pox_types";
 
export async function getTransaction(stacksApi:string, tx:string):Promise<any> {
  const url = `${stacksApi}/extended/v1/tx/${tx}`;
  let val;
  try {
      const response = await fetch(url)
      val = await response.json();
  }
  catch (err) {
      console.log('getTransaction: ', err);
  }
  return val;
}


export async function fetchDataVar(stacksApi:string, contractAddress:string, contractName:string, dataVarName:string) {
  try {
    //checkAddressForNetwork(getConfig().network, contractAddress)
    const url = `${stacksApi}/v2/data_var/${contractAddress}/${contractName}/${dataVarName}`;
    const response = await fetch(url);
    const result = await response.json();
    return result;
  } catch(err) {
    console.log('fetchDataVar: ' + (err as {message:string}).message + ' contractAddress: ' + contractAddress);
  }
}

export function getStacksNetwork(network:string) {
	let stxNetwork:StacksMainnet|StacksTestnet;
	/**
	if (CONFIG.VITE_ENVIRONMENT === 'nakamoto') {
		stxNetwork = new StacksTestnet({
			url: 'https://api.nakamoto.testnet.hiro.so',
		});
		return stxNetwork
	 }
	  */
	if (network === 'devnet') stxNetwork = new StacksMocknet();
	else if (network === 'testnet') stxNetwork = new StacksTestnet();
	else if (network === 'mainnet') stxNetwork = new StacksMainnet();
	else stxNetwork = new StacksMocknet();
	return stxNetwork;
}


export async function lookupContract(stacksApi:string, contract_id:string) {
  const path = `${stacksApi}/extended/v1/contract/${contract_id}`;
  const response = await fetch(path);
  const res = await response.json();
  return res;
}
export async function isConstructed(stacksApi:string, contract_id:string) {
  const path = `${stacksApi}/extended/v1/contract/${contract_id}`;
  const response = await fetch(path);
  const res = await response.json();
  return res;
}
export async function fetchStacksInfo(stacksApi:string) {
  const path = `${stacksApi}/v2/info`;
  const response = await fetch(path);
  const res = await response.json();
  return res;
}
export async function getTokenBalances(stacksApi:string, principal:string):Promise<TokenBalances> {
  const path = `${stacksApi}/extended/v1/address/${principal}/balances`;
  const response = await fetch(path);
  const res = await response.json();
  return res;
}

export async function callContractReadOnly(stacksApi:string, data:any) {
  let url = `${stacksApi}/v2/contracts/call-read/${data.contractAddress}/${data.contractName}/${data.functionName}`
  if (data.tip) {
    url += '?tip=' + data.tip
  }
  let val;
  try {

    console.log('callContractReadOnly: url: ', url)
    const hiroApi1 = 'ae4ecb7b39e8fbc0326091ddac461bc6'
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hiro-api-key': hiroApi1
      },
      body: JSON.stringify({
        arguments: data.functionArgs,
        sender: data.contractAddress,
      })
    });
    val = await response.json();
  } catch (err) {
    console.error('callContractReadOnly4: ', err);
  }
  try {
    const result = cvToJSON(deserializeCV(val.result));
    return result;
  } catch (err:any) {
    console.error('Error: callContractReadOnly: ', val)
    return val
  }
}

export async function getStacksHeightFromBurnBlockHeight(stacksApi:string, burnHeight:number):Promise<number> {
  let url = `${stacksApi}/extended/v2/burn-blocks/${burnHeight}/blocks`;
  let response = await fetch(url)
  if (response.status !== 200) {
    return -1; // burn height in future.
  }
  let val = await response.json();
  if (!val || !val.results || val.results.length === 0) return 0
  console.log('getStacksHeightFromBurnBlockHeight: burnHeight: ' + burnHeight, val.results)
  return val.results[0].height;
}

export async function getPoxInfo(stacksApi:string):Promise<PoxInfo> {
	const path = `${stacksApi}/v2/pox`;
	const response = await fetch(path);
	const res = await response.json();
	return res;
}

