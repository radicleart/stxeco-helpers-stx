import { CurrentProposal, ExtensionType, InFlight, ProposalEvent, SoloPoolData } from "./dao";
import { PoxInfo, StacksInfo } from "./pox";
import { AddressObject, ExchangeRate, SbtcUserSettingI } from "./sbtc";
import { StacksBalance } from "./stacker";
export type SessionStore = {
    name: string;
    loggedIn: boolean;
    balances?: StacksBalance;
    keySets: {
        [key: string]: AddressObject;
    };
    userSettings: SbtcUserSettingI;
    poxInfo: PoxInfo;
    exchangeRates: Array<ExchangeRate>;
    stacksInfo: StacksInfo;
};
export type DaoStore = {
    proposals: Array<ProposalEvent>;
    extensions?: Array<ExtensionType>;
    soloPoolData: SoloPoolData;
    daoData?: InFlight;
    currentProposal?: CurrentProposal;
};
export type HeaderItem = {
    name: string;
    href: string;
    display: string;
    target: string;
};
export type HeaderLink = {
    name: string;
    href: string;
    display: string;
    target: string;
    items?: Array<HeaderItem>;
};
