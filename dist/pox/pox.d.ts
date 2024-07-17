import { Delegation, PoxCycleInfo, Stacker, StackerInfo } from '../pox_types';
import { VerifySignerKey } from '../signer';
export declare function getPoxContractFromCycle(cycle: number): Promise<"pox" | "pox-2" | "pox-3" | "pox-4">;
export declare function getBurnHeightToRewardCycle(stacksApi: string, poxContract: string, height: number): Promise<any>;
export declare function getRewardCycleToBurnHeight(stacksApi: string, poxContract: string, cycle: number): Promise<any>;
export declare function getPoxCycleInfo(stacksApi: string, poxContract: string, cycle: number): Promise<PoxCycleInfo>;
export declare function getPoxCycleInfoRelative(stacksApi: string, mempoolApi: string, poxContract: string, cycle: number, currentBurnHeight: number): Promise<PoxCycleInfo>;
export declare function getTotalUstxStacked(stacksApi: string, poxContract: string, cycle: number): Promise<any>;
export declare function getRewardSetPoxAddress(stacksApi: string, poxContract: string, cycle: number, index: number): Promise<any>;
export declare function getNumbEntriesRewardCyclePoxList(stacksApi: string, poxContract: string, cycle: number): Promise<any>;
export declare function getTotalPoxRejection(stacksApi: string, poxContract: string, cycle: number): Promise<any>;
export declare function getRewardSetSize(stacksApi: string, poxContract: string, cycle: number): Promise<any>;
export declare function getNumRewardSetPoxAddresses(stacksApi: string, poxContract: string, cycle: number): Promise<any>;
export declare function getAllowanceContractCallers(stacksApi: string, poxContractId: string, address: string, contract: string): Promise<any>;
export declare function getPartialStackedByCycle(stacksApi: string, network: string, poxContractId: string, address: string, cycle: number, sender: string): Promise<any>;
export declare function getStackerInfoFromContract(stacksApi: string, network: string, poxContractId: string, address: string, cycle: number): Promise<StackerInfo>;
export declare function getCheckDelegation(stacksApi: string, poxContractId: string, address: string): Promise<Delegation>;
export declare function getPoxRejection(stacksApi: string, poxContractId: string, address: string, cycle: number): Promise<any>;
export declare function checkCallerAllowed(stacksApi: string, poxContractId: string, stxAddress: string): Promise<any>;
export declare function verifySignerKeySig(stacksApi: string, network: string, poxContractId: string, auth: VerifySignerKey): Promise<Stacker | undefined>;
export declare function readDelegationEvents(stacksApi: string, network: string, poxContract: string, poolPrincipal: string, offset: number, limit: number): Promise<any>;
export declare function startSlot(network: string): 60 | 500;
