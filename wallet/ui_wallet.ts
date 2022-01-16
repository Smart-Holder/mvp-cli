import { Transaction, WalletManagerAbstract, WalletUser } from "./wallet";
import { JsonRpcPayload } from 'web3-core-helpers';
import { Signature, providers } from 'web3z';
import { RLPEncodedTransaction, } from 'web3-core';

import native from "./native";
import buffer, { IBuffer } from 'somes/buffer';
import storage from "somes/storage";
import * as config from '../config';


var cryptoTx = require('crypto-tx');

export class UIWalletManager extends WalletManagerAbstract {

	//private _provider: AbstractProvider = (globalThis as any).ethereum;
	provider = new providers.HttpProvider(config.defaultNetwork);

	constructor(network?: string) {
		super();
		// this.provider = new providers.HttpProvider(network || config.defaultNetwork);
		// storage.set('currNetwork', network || config.defaultNetwork);
		this.setProvider(network)
	}

	// https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161
	// https://rpc-mumbai.maticvigil.com/v1/4ea0aeeeb8f8b2d8899acfc89e9852a361bf5b13
	onSend(payload: JsonRpcPayload, callback: any, user?: WalletUser): void {
		// window.alert(JSON.stringify(payload));
		this.provider.send(payload, callback);
	}

	async setProvider(ctr_network?: string) {
		let network = await storage.get('currNetwork')
		this.provider = new providers.HttpProvider(ctr_network || network || config.defaultNetwork);
	}

	private async checkPermission(user: WalletUser) {
		// TODO check permission ...
		throw 'Err';
	}

	async onAccounts(user: WalletUser): Promise<string[]> {
		// await this.checkPermission(user);
		// TODO ...
		// debugger
		let keysNameArr = await native.getKeysName() || [];
		let addressList = keysNameArr.map(async (key) => {
			let data = await native.getKey(key);
			let address = '0x' + JSON.parse(String(data)).address
			return address;
		});
		let newAddressList = await Promise.all(addressList);
		let account = await storage.get('currAccount') || newAddressList[0];
		return [account];
	}

	async onSign(user: WalletUser, text: string, hash: IBuffer, from: string, pwd?: string): Promise<string> {
		await this.checkPermission(user);

		// TODO ...
		var isAgree = true;
		if (!isAgree) {
			throw Error.new('reject sign');
		}

		// TODO sign from privateKey
		var signature =
			cryptoTx.signv(hash, buffer.from('767eb49d3734b4e3058486b583dbc9cdc6c78a75efc14117a07fec0b11f6476c', 'hex'));

		return buffer.concat([signature.signature, [signature.recovery]]).toString('hex');
	}

	async onSignTransaction(user: WalletUser, tx: Transaction): Promise<RLPEncodedTransaction> {
		// await this.checkPermission(user);
		console.log('onSignTransaction');
		// TODO ...
		var isAgree = true;
		if (!isAgree) {
			throw Error.new('reject sign or send transaction');
		}

		var signTx = await this.signTx({
			async sign(message: IBuffer): Promise<Signature> {
				// TODO sign from privateKey
				var signature =
					cryptoTx.sign(message, buffer.from('767eb49d3734b4e3058486b583dbc9cdc6c78a75efc14117a07fec0b11f6476c', 'hex'));
				return signature;
			}
		}, tx);

		return UIWalletManager.getRLPEncodedTransaction(tx, signTx);
	}

}

export default UIWalletManager;