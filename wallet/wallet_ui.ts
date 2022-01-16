import { RpcCallback, Transaction, WalletManagerAbstract, WalletUser } from "./wallet";
import { JsonRpcPayload } from 'web3-core-helpers';
import { Signature, providers } from 'web3z';
import { RLPEncodedTransaction } from 'web3-core';
import {DeviceSigner, getDeviceFormAddress} from '../src/models/device';
import somes from 'somes';

import native from "./native";
import buffer, { IBuffer } from 'somes/buffer';

var cryptoTx = require('crypto-tx');

export interface ISecretKey {
	readonly address: string;
	// readonly address: string;
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

export class UIWalletManager extends WalletManagerAbstract implements DeviceSigner {

	private _accounts?: Dict<ISecretKey>;
	private _currentKey?: ISecretKey; // 当前选择的钱包

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

	async currentKey() {
		await this.keys();
		somes.assert(this._currentKey, 'No wallet available');
		return this._currentKey as ISecretKey;
	}

	// ---------------------------------- impl DeviceSigner ----------------------------------
	async availableOwner() {
		var key = await this.currentKey();
		return key.address;
	}

	async availablePublicKey() {
		var key = await this.currentKey();
		// 标准 keystore 在解密前只能取到地址,如果设备端验签必须要publicKey,那就只能在存keystore时把publicKey也存起来
		return key.address;
	}

	async signFrom(target: string, msg: IBuffer): Promise<Signature> {
		var device = await getDeviceFormAddress(target);
		if (device && device.owner) {
			var key = await this.keyFrom(device.owner);
		} else {
			var key = await this.currentKey();
		}
		var sign = await key.sign(msg);
		return sign;
	}
	// ---------------------------------- impl DeviceSigner end ----------------------------------

	async keys() {
		if (!this._accounts) {
			this._accounts = {};
			var keysName = await native.getKeysName() || [];
			for (var name of keysName) {
				var json = await native.getKey(name);
				if (json) {
					try {
						var keystore = JSON.parse(json);
						var key = new SecretKey(keystore);
						this._accounts[name] = key;
						if (!this._currentKey) {
							this._currentKey = key; // The first wallet is selected by default
						}
					} catch(err) {}
				}
			}
		}
		return {...this._accounts};
	}

	async addKey(name: string, key: ISecretKey) {
		await this.keys();
		await native.setKey(name, JSON.stringify(key.keystore));
		(this._accounts as any)[name] = key;
	}

	async getKey(name: string): Promise<ISecretKey | null> {
		var acc = (await this.keys())[name];
		return acc || null;
	}

	async keyFrom(address: string) {
		address = cryptoTx.checksumAddress(address);
		var keys = await this.keys();
		var key = Object.values(keys).find(e=>e.address==address);
		if (!key)
			throw Error.new('Key not found');
		return key;
	}

	async onAccounts(user?: WalletUser): Promise<string[]> {
		var key = Object.values(await this.keys()).filter(e=>e!==this._currentKey);
		if (this._currentKey)
			key.unshift(this._currentKey);
		return key.map(e=>e.address);
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