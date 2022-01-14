
import chain from '../src/chain';
import native from './native';
import {AbstractProvider,RequestArguments} from 'web3-core';
import { JsonRpcPayload } from 'web3-core-helpers';
import {WalletRPC, WalletUser, SendCallback} from './wallet';
import * as cfg from '../config';

export default chain;

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

	var from = await chain.defaultAccount();
	var accounts = chain.eth.accounts;
	var personal = chain.eth.personal;

	//console.log(accounts.wallet.add('0xde71ace345cc617648f9965bf42d0cf7480f2a1c651b17258925c6ebf0b92acb'));
	console.log(accounts.wallet.defaultKeyName);
	console.log(accounts.wallet.length);

	for (var i = 0; i < accounts.wallet.length; i++) {
		console.log(accounts.wallet[i]);
	}

	console.log(await chain.eth.getAccounts());
	console.log(await chain.eth.requestAccounts());
	console.log(await personal.getAccounts());

	console.log(await personal.sign('ABCD', from, ''));

	// var tx = await chain.eth.signTransaction({
	// 	from: from,//'0xc2C09aABe77B718DA3f3050D0FDfe80D308Ea391',
	// 	to: '0xA6e7F7DE0Be7601C2f88eA0467B5CB3E64FB53FA',
	// 	value: Math.pow(10, 17), // 0.1 eth
	// });
	// console.log(tx);

	var tx2 = await chain.eth.sendTransaction({
		from: from,//'0xc2C09aABe77B718DA3f3050D0FDfe80D308Ea391',
		to: '0xA6e7F7DE0Be7601C2f88eA0467B5CB3E64FB53FA',
		value: Math.pow(10, 17), // 0.1 eth
	});
	console.log(tx2);

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

}

export class DAppUser implements AbstractProvider, WalletUser {
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

	sendAsync(payload: JsonRpcPayload, callback: SendCallback) {
		this._wallet.send(this, payload, callback);
	}

	send(payload: JsonRpcPayload, callback: SendCallback) {
		this._wallet.send(this, payload, callback);
	}

	request<T = any>(args: RequestArguments) {
		return this._wallet.request<T>(this, args);
	}
}

export async function initialize(wallet: WalletRPC) {
	// await testRpc();
	setTimeout(test2, 1e3);
	var dapp = new DAppUser(cfg.app.displayName, wallet);
	(globalThis as any).ethereum = dapp; // meta mask plugin
	await chain.initialize();
}