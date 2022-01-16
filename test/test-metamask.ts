/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2019, hardchain
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of hardchain nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL hardchain BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 * ***** END LICENSE BLOCK ***** */

import web3 from '../src/chain';
import native from '../wallet/native';

var chain = web3;

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

async function testMetaMask() {

	var mask = web3.metaMask;

	var [from] = await mask.request({ method: 'eth_requestAccounts' });

	console.log('eth_requestAccounts', from);
	console.log('provider', web3.provider);

	console.log('web3.getBlockNumber', await web3.eth.getBlockNumber());

	var accounts = await web3.eth.getAccounts();

	console.log('defaultAccount', accounts);

	var r = await mask.request({
		method: 'personal_sign',
		// params: [from, 'SuperRare uses this cryptographic signature in place of a password, verifying that you are the owner of this Ethereum address.'],
		params: [
			'0xe6a59ae8bf99e69687',
			from
		],
	});

	console.log(r);
}

async function testTx() {
	var r = await chain.sendTransaction({
		to: '0x83093cC3595Dd8E242407f5CF149762DF83A782F',
		value: Math.pow(10, 17),
	});

	console.log(r);
}

export default async function() {
	//await testTx();
}