
import chain from '../src/chain';
import {AbstractProvider,RequestArguments} from 'web3-core';
import { JsonRpcPayload } from 'web3-core-helpers';
import {WalletRPC, WalletUser, RpcCallback} from './wallet';
import * as cfg from '../config';

export default chain;

export class Web3Provider implements AbstractProvider, WalletUser {
	private _name: string;
	private _wallet: WalletRPC;

	constructor(name: string, wallet: WalletRPC) {
		this._name = name;
		this._wallet = wallet;
	}

	get connected() {
		return true;
	}

	async name() {
		return this._name;
	}

	supportsSubscriptions() {
		return false;
	}

	sendAsync(payload: JsonRpcPayload, callback: RpcCallback) {
		this._wallet.send(this, payload, callback);
	}

	send(payload: JsonRpcPayload, callback: RpcCallback) {
		this._wallet.send(this, payload, callback);
	}

	request<T = any>(args: RequestArguments) {
		return this._wallet.request<T>(this, args);
	}
}

export async function initialize(wallet: WalletRPC) {
	var provider = new Web3Provider(cfg.app.displayName, wallet);
	(globalThis as any).ethereum = provider; // meta mask plugin
	await chain.initialize();
}