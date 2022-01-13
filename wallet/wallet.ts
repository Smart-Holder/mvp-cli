
import {RLPEncodedTransaction, TransactionConfig,HttpProvider} from 'web3-core';
import { IBuffer } from 'somes/buffer';
import { Signature, providers } from 'web3z';
import { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers';

export interface Transaction {
	from: string;
	to: string;
	value: string;
	gasLimit: number;
	gasPrice: number;
	data: string;
	nonce: number;
	chainId: number;
}

export interface WalletManager {
	accounts(user: WalletUser): Promise<string[]>;
	sign(user: WalletUser, data: IBuffer, from: string, pwd?: string): Promise<Signature>;
	signTransaction(user: WalletUser, transactionConfig: TransactionConfig): Promise<RLPEncodedTransaction>;
	// sendTransaction
	request(user: WalletUser, payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void): void;
}

export interface WalletUser {
	name(): Promise<string>; // app user name
}

export class UIWalletManager implements WalletManager {

	private _provider: HttpProvider = new providers.HttpProvider('https://rpc-mumbai.maticvigil.com/v1/4ea0aeeeb8f8b2d8899acfc89e9852a361bf5b13');

	private checkUser(user: WalletUser) {
		// noop
	}

	async accounts(user: WalletUser): Promise<string[]> {
		this.checkUser(user);
		return [];
	}

	async sign(user: WalletUser, data: IBuffer, from: string, pwd?: string): Promise<Signature> {
		this.checkUser(user);
		throw 'err';
	}

	private async formatTx(tx: TransactionConfig) { // Transaction

	// 	export interface TransactionConfig {
	// 		from?: string | number;
	// 		to?: string;
	// 		value?: number | string | BN;
	// 		gas?: number | string;
	// 		gasPrice?: number | string | BN;
	// 		data?: string;
	// 		nonce?: number;
	// 		chainId?: number;
	// 		common?: Common; --
	// 		chain?: string;
	// 		hardfork?: string; --
	// }

	}

	async signTransaction(user: WalletUser, tx: TransactionConfig): Promise<RLPEncodedTransaction> {
		this.checkUser(user);

	// 	export interface RLPEncodedTransaction {
	//     raw: string;
	//     tx: {
	//         nonce: string;
	//         gasPrice: string;
	//         gas: string;
	//         to: string;
	//         value: string;
	//         input: string;
	//         r: string;
	//         s: string;
	//         v: string;
	//         hash: string;
	//     };
	// }

		throw 'err';
	}

	request(user: WalletUser, payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse, chain?: number) => void) {
		// this.checkUser(user);
		this._provider.send(payload, callback);
	}

}

export default new UIWalletManager();