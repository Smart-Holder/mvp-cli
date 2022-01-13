
import chain from '../src/chain';
import native from './native';
import {AbstractProvider,RequestArguments} from 'web3-core';
import { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers';
import {WalletManager, WalletUser} from './wallet';
import * as cfg from '../config';
import buffer from 'somes/buffer';

export default chain;

var cryptoTx = require('crypto-tx');

async function test() {

	var str = await native.scan();

	alert('qrcode:' + str);

	await native.setKey('a', 'A');
	await native.setKey('b', 'B');

	alert(await native.getKeysName());

	alert(await native.getKey('a'));
	alert(await native.getKey('b'));
}

async function test2() {
	var account = await chain.defaultAccount();
	var accounts = chain.eth.accounts;
	var personal = chain.eth.personal;

	//console.log(accounts.wallet.add('0xde71ace345cc617648f9965bf42d0cf7480f2a1c651b17258925c6ebf0b92acb'));
	console.log(accounts.wallet.defaultKeyName);
	console.log(accounts.wallet.length);

	for (var i = 0; i < accounts.wallet.length; i++) {
		console.log(accounts.wallet[i]);
	}

	console.log(await personal.sign('ABCD', account, ''));
	/*{
		"method": "personal_sign",
		"params": [],
		"jsonrpc": "2.0",
		"id": 1804549505,
		"origin": "http://127.0.0.1:8080",
		"tabId": 537
	}
	*/

	console.log(await chain.eth.getAccounts());
	/*
	{
		"method": "eth_accounts",
		"params": [],
	}
	*/

	console.log(await chain.eth.requestAccounts());
	/*
	{
		"method": "eth_requestAccounts",
		"params": [],
	}
	*/

	//console.log(await personal.getAccounts());
	/*
	{
		"method": "personal_listAccounts",
		"params": [],
	}
	*/

	// eth_sendTransaction
	// eth_accounts
	// eth_requestAccounts
	// personal_listAccounts
	// personal_sign

	//****************************************************************

	//console.log(await personal.newAccount(''));
	/*
	{
		"method": "personal_newAccount",
		"params": [
			""
		],
	}
	*/

	//console.log(await personal.unlockAccount(account, '', 0));
	/*
	{
		"method": "personal_unlockAccount",
		"params": [
			"0xa6e7f7de0be7601c2f88ea0467b5cb3e64fb53fa",
			"",
			0
		],
	}
	*/
	
	//console.log(await personal.importRawKey('0xde71ace345cc617648f9965bf42d0cf7480f2a1c651b17258925c6ebf0b92acb', '0000'));
	/*
	{
		"method": "personal_importRawKey",
		"params": [
			"0xde71ace345cc617648f9965bf42d0cf7480f2a1c651b17258925c6ebf0b92acb",
			"0000"
		],
	}
	*/

}

async function testRpc() {

	var mask = (globalThis as any).ethereum;

	var [from] = await mask.request({ method: 'eth_requestAccounts' });

	// var r = await mask.request({
	// 	method: 'personal_sign',
	// 	// params: [from, 'SuperRare uses this cryptographic signature in place of a password, verifying that you are the owner of this Ethereum address.'],
	// 	params: [
	// 		'0xe6a59ae8bf99e69687',
	// 		from
	// 	],
	// });
	// console.log(r);

	// var r = await mask.request({
	// 	method: 'eth_signTransaction',
	// 	params: [],
	// });
	// console.log(r);

	// from?: string | number;
	// to?: string;
	// value?: number | string | BN;
	// gas?: number | string;
	// gasPrice?: number | string | BN;
	// data?: string;
	// nonce?: number;
	// chainId?: number;
	// common?: Common;
	// chain?: string;
	// hardfork?: string;

	var tx = await chain.eth.signTransaction({
		from: from,//'0xc2C09aABe77B718DA3f3050D0FDfe80D308Ea391',
		to: '0xA6e7F7DE0Be7601C2f88eA0467B5CB3E64FB53FA',
		value: Math.pow(10, 17), // 0.1 eth
	});
	console.log(tx);

}

export class DAppUser implements AbstractProvider, WalletUser {
	private _name: string;
	private _wallet: WalletManager;

	constructor(name: string, wallet: WalletManager) {
		this._name = name;
		this._wallet = wallet;
	}

	get connected(): boolean {
		return true;
	}

	async name() {
		return this._name;
	}

	supportsSubscriptions(): boolean {
		return false;
	}

	sendAsync(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void) {
		this.send(payload, callback);
	}

	private _SpecialApi: Dict<(payload: JsonRpcPayload)=>Promise<any>> = {
		eth_accounts: (payload: JsonRpcPayload)=>this._wallet.accounts(this),
		eth_requestAccounts: (payload: JsonRpcPayload)=>this._SpecialApi.eth_accounts(payload),
		personal_listAccounts: (payload: JsonRpcPayload)=>this._SpecialApi.eth_accounts(payload),
		personal_sign: async(payload: JsonRpcPayload)=>{
			var [data, from, pwd] = payload.params;
			var sign = await this._wallet.sign(this, data.toBuffer(data), from, pwd);
			var buf = buffer.concat([sign.signature, [sign.recovery]]);
			return '0x' + buf.toString('hex');
		},
		eth_signTransaction: (payload: JsonRpcPayload)=>{
			return this._wallet.signTransaction(this, payload.params[0]);
		},
		eth_sendTransaction: async(payload: JsonRpcPayload)=>{
			// TODO ...
		},
	};

	send(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void): void {
		var method = this._SpecialApi[payload.method];
		if (!method) {
			this._wallet.request(this, payload, callback);
		} else {
			method(payload).then(result=>callback(null, {
				jsonrpc: payload.jsonrpc,
				id: Number(payload.id) || 0,
				result,
			})).catch(error=>callback(error));
		}
	}

	async request<T = any>(args: RequestArguments): Promise<T> {
		return new Promise<T>((resolve, reject)=>{
			this.send({
				jsonrpc: '2.0',
				method: args.method,
				params: args.params || [],
			}, (err, data)=>{
				if (err || !data || data.error) {
					reject(err || (data && data.error ? data.error : Error.new('err')));
				} else {
					resolve(data.result);
				}
			});
		});
	}
}

export async function initialize(wallet: WalletManager) {
	//await testRpc();
	// setTimeout(testRpc, 1e3);
	var dapp = new DAppUser(cfg.app.displayName, wallet);
	//(globalThis as any).ethereum = dapp; // meta mask plugin
	await chain.initialize();
}