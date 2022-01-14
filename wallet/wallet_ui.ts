import { RpcCallback, Transaction, WalletManagerAbstract, WalletUser } from "./wallet";
import { JsonRpcPayload } from 'web3-core-helpers';
import { Signature, providers } from 'web3z';
import { RLPEncodedTransaction } from 'web3-core';

import native from "./native";
import buffer, { IBuffer } from 'somes/buffer';

var cryptoTx = require('crypto-tx');

export interface ISecretKey {
	readonly address: string;
	readonly keystore: any;
	unlock(pwd?: string): Promise<IBuffer>;
	sign(message: IBuffer): Promise<Signature>;
}

export class SecretKey implements ISecretKey {
	readonly address: string;
	readonly keystore: any;

	private _key?: IBuffer;

	constructor(keystore: any) {
		this.keystore = keystore;
		this.address = cryptoTx.checksumAddress('0x' + keystore.address);
	}

	async unlock(pwd?: string) {
		if (!this._key) {
			// unlock ...
			// TODO ...
			throw Error.new('Unlock keystore fail');
		}
		return this._key as IBuffer;
	}

	async sign(message: IBuffer): Promise<Signature> {
		var priv = await this.unlock();
		var signature = cryptoTx.sign(message, priv);
		return signature;
	}

}

export class UIWalletManager extends WalletManagerAbstract {

	private _accounts?: Map<string, ISecretKey>;

	// private _provider: AbstractProvider = (globalThis as any).ethereum;
	provider = new providers.HttpProvider('https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');
	//provider = new providers.HttpProvider('https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');
	// https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161
	// https://rpc-mumbai.maticvigil.com/v1/4ea0aeeeb8f8b2d8899acfc89e9852a361bf5b13
	onSend(payload: JsonRpcPayload, callback: RpcCallback, user?: WalletUser): void {
		this.provider.send(payload, callback);
	}

	setProvider() {
		this.provider = new providers.HttpProvider('https://rpc-mumbai.maticvigil.com/v1/4ea0aeeeb8f8b2d8899acfc89e9852a361bf5b13');
	}

	async keys() {
		if (!this._accounts) {
			this._accounts = new Map();
			var keysName = await native.getKeysName() || [];
			for (var name of keysName) {
				var json = await native.getKey(name);
				if (json) {
					try {
						var keystore = JSON.parse(json);
						this._accounts.set(name, new SecretKey(keystore));
					} catch(err) {}
				}
			}
		}
		return this._accounts;
	}

	async addKey(name: string, key: ISecretKey) {
		var accs = await this.keys();
		await native.setKey(name, JSON.stringify(key.keystore));
		accs.set(name, key);
	}

	async getKey(name: string) {
		var acc = (await this.keys()).get(name);
		return acc || null;
	}

	async keyFrom(address: string) {
		address = cryptoTx.checksumAddress(address);
		var keys = await this.keys();
		for (var [,v] of keys) {
			if (v.address == address) {
				return v;
			}
		}
		throw Error.new('Key not found');
	}

	async onAccounts(user?: WalletUser): Promise<string[]> {
		var l = [] as string[];
		for (var [k,v] of await this.keys())
			l.push(v.address);
		return l;
	}

	async onSign(user: WalletUser, text: string, hash: IBuffer, from: string, pwd?: string): Promise<string> {
		var key = await this.keyFrom(from);
		// TODO ...
		
		var isAgree = true;
		if (!isAgree) {
			throw Error.new('reject sign');
		}

		var signature = await key.sign(hash);

		return buffer.concat([signature.signature, [signature.recovery]]).toString('hex');
	}

	async onSignTransaction(user: WalletUser, tx: Transaction): Promise<RLPEncodedTransaction> {
		// console.log('onSignTransaction');
		var from = tx.from;
		var key = await this.keyFrom(from);
		
		// TODO ...

		var isAgree = true;
		if (!isAgree) {
			throw Error.new('reject sign or send transaction');
		}

		var signTx = await this.signTx({
			async sign(message: IBuffer): Promise<Signature> {
				var signature = await key.sign(message);
				return signature;
			}
		}, tx);

		return UIWalletManager.getRLPEncodedTransaction(tx, signTx);
	}

}

export default new UIWalletManager();