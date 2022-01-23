
import { RLPEncodedTransaction, TransactionConfig, RequestArguments } from 'web3-core';
import buffer, { IBuffer } from 'somes/buffer';
import { Signature } from 'web3z';
import { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers';
import req from 'somes/request';

var cryptoTx = require('crypto-tx');

export interface Transaction {
	from: string;
	to: string;
	value: string;
	data: string;
	nonce: number;
	chainId: number;
	gas: number;
	gasLimit: number;
	gasPrice: number;
}

export interface WalletUser {
	name(): Promise<string>; // app user name
}

export type RpcCallback = (error: Error | null, result?: JsonRpcResponse) => void;

export interface WalletRPC {
	send(user: WalletUser, payload: JsonRpcPayload, callback: RpcCallback, chain?: number): void;
	request<T = any>(user: WalletUser, args: RequestArguments, chain?: number): Promise<T>;
}

export interface WalletManager extends WalletRPC {
	accounts(user: WalletUser): Promise<string[]>;
	sign(user: WalletUser, data: any, from: string, pwd?: string, personal?: boolean): Promise<string>;
	signTransaction(user: WalletUser, tx: TransactionConfig): Promise<RLPEncodedTransaction>;
	sendTransaction(user: WalletUser, tx: TransactionConfig): Promise<string>; // return txHash
}

export interface Signer {
	sign(message: IBuffer): Promise<Signature>;
}

export interface SignatureTx {
	hash: string;
	signTx: IBuffer;
	rsv: {
		r: IBuffer;
		s: IBuffer;
		v: number;
	};
}

export type BlockNumber = number | 'latest' | 'pending' | 'earliest' | 'genesis';

export abstract class WalletManagerAbstract implements WalletManager {

	async suggestedGasFees(chainId: number): Promise<any | null> {
		try {
			var { statusCode, data } = await req.get(`https://gas-api.metaswap.codefi.network/networks/${chainId}/suggestedGasFees`);
			if (statusCode == 200) {
				return JSON.parse(data + '');
			}
		} catch (err) { }
		return null;
	}

	private async _FormatTx(user: WalletUser, _tx: TransactionConfig): Promise<Transaction> { // Transaction
		var tx = _tx as Transaction;

		tx.from = tx.from || (await this.accounts(user))[0];
		tx.nonce = tx.nonce || await this.getTransactionCount(tx.from as string);
		tx.chainId = tx.chainId || await this.getChainId();
		tx.value = tx.value || '0x0';
		tx.data = tx.data || '0x';

		if (!tx.gas)
			tx.gas = await this.estimateGas(tx.from, tx.to, tx.value, tx.data, tx.nonce, tx.chainId);
		if (!tx.gasLimit) // 程序运行时步数限制 default
			tx.gasLimit = parseInt(String(tx.gas * 1.2)); // suggested gas limit

		// var gas = await this.suggestedGasFees(tx.chainId);

		if (!tx.gasPrice) // 程序运行单步的wei数量wei default
			tx.gasPrice = await this.getGasPrice() || 1e5;

		return tx as Transaction;
	}

	protected abstract onSend(payload: JsonRpcPayload, callback: RpcCallback, user?: WalletUser): void;

	protected onRequest<T = any>(payload: RequestArguments, user?: WalletUser) {
		return new Promise<T>((resolve, reject) => {
			this.onSend({
				jsonrpc: '2.0',
				method: payload.method,
				params: payload.params || [],
				id: payload.id || 0,
			}, (err: Error | null, result?: JsonRpcResponse) => {
				if (err || !result || result.error) {
					reject(err || (result && result.error ? result.error : Error.new('err')));
				} else {
					resolve(result.result);
				}
			}, user);
		});
	}

	request<T = any>(user: WalletUser, args: RequestArguments, chain?: number): Promise<any> {

		var method = (this as any)[args.method] as (user: WalletUser, payload: JsonRpcPayload) => Promise<any>;
		var payload: JsonRpcPayload = {
			jsonrpc: '2.0',
			method: args.method,
			params: args.params || [],
			id: args.id,
		};
		if (!!method) {
			return method.call(this, user, payload);
		} else {
			return new Promise<T>((resolve, reject) => {
				this.onSend(payload, (error: Error | null, result?: JsonRpcResponse) => {
					if (error || !result || result.error) {
						reject(error || (result && result.error ? result.error : Error.new('err')));
					} else {
						resolve(result.result);
					}
				}, user);
			});
		}
	}

	send(user: WalletUser, payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void, chain?: number) {
		var method = (this as any)[payload.method] as (user: WalletUser, payload: JsonRpcPayload) => Promise<any>;
		if (!method) {
			this.onSend(payload, callback, user);
		} else {
			method.call(this, user, payload).then(result => callback(null, {
				jsonrpc: payload.jsonrpc,
				id: Number(payload.id) || 0,
				result,
			})).catch(error => callback(error));
		}
	}

	async signTx(signer: Signer, tx: Transaction): Promise<SignatureTx> {
		var sign = await cryptoTx.signTx(signer, tx);
		return {
			hash: sign.hash,
			signTx: sign.signTx,
			rsv: sign.rsv,
		};
	}

	static getRLPEncodedTransaction(tx: Transaction, signTx: SignatureTx) {
		return {
			raw: '0x' + signTx.signTx.toString('hex'),
			tx: {
				nonce: `0x${tx.nonce.toString(16)}`,
				gas: `0x${tx.gas.toString(16)}`,
				gasPrice: `0x${tx.gasPrice.toString(16)}`,
				to: tx.to,
				value: tx.value,
				input: tx.data,
				r: '0x' + signTx.rsv.r.toString('hex'),
				s: '0x' + signTx.rsv.s.toString('hex'),
				v: String(signTx.rsv.v),
				hash: signTx.hash,
			},
		};
	}

	async getChainId() {
		var hex = await this.onRequest<string>({ method: 'eth_chainId' });
		return Number(hex);
	}

	async getGasPrice() {
		var num = await this.onRequest<string>({ method: 'eth_gasPrice' });
		return Number(num);
	}

	async getBalance(from: string, blockNum: BlockNumber = 'latest') {
		var num = await this.onRequest<string>({ method: 'eth_getBalance', params: [from, blockNum] });
		return BigInt(num || 0);
	}

	async getTransactionCount(from: string, blockNum: BlockNumber = 'latest') {
		var num = await this.onRequest<string>({ method: 'eth_getTransactionCount', params: [from, blockNum] });
		return Number(num);
	}

	async estimateGas(from: string, to: string, value: string, data: string, nonce: number, chainId: number) {
		var num = await this.onRequest<string>({
			method: 'eth_estimateGas', params: [{
				from, to, value, data,
				nonce: '0x' + nonce.toString(16),
				chainId: '0x' + chainId.toString(16),
			}]
		});
		return Number(num);
	}

	// special api

	eth_accounts(user: WalletUser): Promise<string[]> {
		return this.accounts(user);
	}

	eth_requestAccounts(user: WalletUser) {
		return this.accounts(user);
	}

	personal_listAccounts(user: WalletUser) {
		return this.accounts(user);
	}

	personal_sign(user: WalletUser, payload: JsonRpcPayload) {
		var [data, from, pwd] = payload.params;
		return this.sign(user, cryptoTx.toBuffer(data), from, pwd, true);
	}

	eth_sign(user: WalletUser, payload: JsonRpcPayload) {
		var [data, from, pwd] = payload.params;
		return this.sign(user, data, from, pwd, false);
	}

	eth_signTransaction(user: WalletUser, payload: JsonRpcPayload) {
		return this.signTransaction(user, payload.params[0]);
	}

	eth_sendTransaction(user: WalletUser, payload: JsonRpcPayload) {
		return this.sendTransaction(user, payload.params[0]);
	}

	// --------------------

	abstract onAccounts(user: WalletUser): Promise<string[]>;
	abstract onSign(user: WalletUser, text: string, hash: IBuffer, from: string, pwd?: string): Promise<string>;
	abstract onSignTransaction(user: WalletUser, tx: Transaction): Promise<RLPEncodedTransaction>;

	accounts(user: WalletUser) {
		// var r = await this.onRequest(user, {method: 'eth_accounts', params: []});
		// return r;
		return this.onAccounts(user);
	}

	sign(user: WalletUser, data: any, from: string, pwd?: string, personal?: boolean): Promise<string> {
		var buf = cryptoTx.toBuffer(data);
		if (personal) {
			buf = buffer.concat([[0x19], buffer.from('Ethereum Signed Message:\n' + buf.length), buf]);
		}
		var hash = buffer.from(cryptoTx.keccak(buf).data);

		// var r = await this.onRequest(user, {
		// 	method: 'personal_sign',
		// 	params: ['0x' + hash.toString('hex'), from, pwd],
		// });
		return this.onSign(user, buf + '', hash, from, pwd);
	}

	async signTransaction(user: WalletUser, tx: TransactionConfig): Promise<RLPEncodedTransaction> {
		return await this.onSignTransaction(user, await this._FormatTx(user, tx));
	}

	async sendTransaction(user: WalletUser, tx: TransactionConfig): Promise<string> {
		// var r = await this.onRequest(user, {
		// 	method: 'eth_sendTransaction',
		// 	params: [tx],
		// });
		var raw = await this.signTransaction(user, tx);
		var r = await this.onRequest({ method: 'eth_sendRawTransaction', params: [raw?.raw] }, user);
		return r;
	}

}

