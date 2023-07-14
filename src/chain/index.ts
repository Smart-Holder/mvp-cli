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

import somes from 'somes';
import { Web3 as Web3Z } from 'web3z';
import { MemoryTransactionQueue as TransactionQueue } from 'web3z/queue';
import buffer from 'somes/buffer';
import { genPrivateKey, getAddress } from '../../deps/webpkit/deps/crypto-tx/account';
import { ChainType } from '../util/tools';
import { ChainType as ChainType1 } from '../models/def';

const AbiCoder = require('web3-eth-abi');
const crypto_tx = require('crypto-tx');

export function encodeParameters(types: any[], paramaters: any[]) {
	var str = AbiCoder.encodeParameters(types, paramaters);
	return buffer.from(str.slice(2), 'hex');
}

export class Web3IMPL extends Web3Z {

	private _metaMask: any;
	private _txQueue: TransactionQueue = new TransactionQueue(this);
	private _defaultAccount?: string;
	private _chain: ChainType = ChainType.UNKNOWN;

	get chain() {
		return this._chain;
	}

	assetChain(chain?: ChainType, msg?: string) {
		somes.assert(chain == this._chain, [100400, msg || 'chain is valid match wallet']);
	}
	// let GasPrice = await getPolygonCurrentGasPrice()

	// get async getPolygonCurrentGasPrice(){
	// 	const res = await fetch( 'https://gpoly.blockscan.com/gasapi.ashx?apikey=key&method=gasoracle');
	// 	const data = await res.json();
	// 	const { ProposeGasPrice } = data.result;
	// 	return ProposeGasPrice * 1000000000;
	// }

	get metaMask() {
		if (!this._metaMask) {
			this._metaMask = (globalThis as any).ethereum;
			// check _metaMask
			if (!this._metaMask && location.pathname != '/nft_detail') {
				// history.push('/install');
				// throw Error.new('Matemask wallet needs to be installed');
				throw Error.new('请在Dapp浏览器中打开链接,并确认当前是否创建了钱包');
			}
			var currentChainId = this._metaMask?.chainId || 4;
			console.log('currentChainId', currentChainId);
		}
		return this._metaMask;
	}

	get queue() {
		return this._txQueue;
	}

	get provider() {
		return this.metaMask;
	}

	async getDefaultAccount() {

		if (!this._defaultAccount) {
			// debugger
			var mask = this.metaMask;
			let from = '';
			let isNftdetailPage = location.pathname == '/nft_detail';
			if ((!mask?.request) || isNftdetailPage) {
				from = getAddress(genPrivateKey()) as string;
			} else {
				var [mask_from] = await mask.request({ method: 'eth_requestAccounts' });
				from = mask_from;
			}

			console.log('eth_requestAccounts', from);

			if (from) {
				from = '0x' + crypto_tx.toChecksumAddress(buffer.from(from.slice(2), 'hex'));
			}
			this._defaultAccount = (from || '') as string;

			var id = isNftdetailPage ? 4 : await this.eth.getChainId();

			this._chain = ChainType[id] ? id : ChainType.UNKNOWN;
		}
		return this._defaultAccount;
	}

	defaultAccount() {
		return this.getDefaultAccount();
	}

	async initialize() {
		var retry = 5;
		while (retry--) {
			if (await isSupport()) {
				await this.getDefaultAccount(); return;
			}
			await somes.sleep(5e2); // 500ms 等待钱包初始化
		}
	}

}

export async function isSupport() {
	return !!(globalThis as any).ethereum;
}

export default new Web3IMPL;
