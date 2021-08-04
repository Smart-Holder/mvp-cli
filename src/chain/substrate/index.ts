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
import { ApiPromise, WsProvider } from '@polkadot/api';
import { SignerOptions } from '@polkadot/api/submittable/types';
import { Signer, SignerResult, SignerPayloadJSON, SignerPayloadRaw, ISubmittableResult } from '@polkadot/types/types';
import { web3Enable, web3Accounts, web3FromSource } from '@polkadot/extension-dapp';
import * as cfg from '../../../config';
import {InjectedAccountWithMeta,} from '@polkadot/extension-inject/types';
import type { ApplyExtrinsicResult } from '@polkadot/types/interfaces';
import { history } from 'webpkit/lib/router';

const AbiCoder = require('web3-eth-abi');
const crypto_tx = require('crypto-tx');

const types = require('../../../deps/NFT101-RUST/pallets/nft/types.json');

const provider = new WsProvider(cfg.substrate); // wss://rpc.polkadot.io

export class LazySigner implements Signer {
	private _signatures: Map<string, SignerResult> = new Map();
	private _signer: any;
	private _blockHash: any = '';
	private _era: any = '';
	private _from: string;

	get from() {
		return this._from;
	}

	constructor(signer: Signer, from: string) {
		this._signer = signer;
		this._from = from;
	}

	private _hash(data: any): string {
		var keys = Object.keys(data).sort((a, b)=>(a>b?1:a<b?-1:0));
		var datas = [];
		for (var key of keys) {
			if (key != 'blockNumber')
				datas.push((data as any)[key]);
		}
		// console.log('------_hash------', datas);
		this._blockHash = data.blockHash;
		this._era = data.era;
		return crypto_tx.keccak(JSON.stringify(datas)).hex;
	}

	async signPayload(payload: SignerPayloadJSON): Promise<SignerResult> {
		var hash = this._hash(payload);
		var signature = this._signatures.get(hash);
		// console.log('------payload------', payload);
		if (!signature) {
			signature = await this._signer.signPayload(payload) as SignerResult;
			// console.log('------signature------', buffer.from(signature.signature).toString('base64'));
			this._signatures.set(hash, signature);
		}
		return signature;
	}
	async signRaw(raw: SignerPayloadRaw): Promise<SignerResult> {//debugger
		var hash = this._hash(raw);
		var signature = this._signatures.get(hash);
		if (!signature) {
			signature = await this._signer.signPayload(raw) as SignerResult;
			this._signatures.set(hash, signature);
		}
		return signature;
	}
	update(id: number, status: any) {
		this._signer.update(id, status);
	}

	get options(): Partial<SignerOptions> {
		return {blockHash: this._blockHash, era: this._era, signer: this };
	}
}

export function encodeParameters(types: any[], paramaters: any[]) {
	return AbiCoder.encodeParameters(types, paramaters);
}

export function decodeParameters(types: any[], value: string) {
	var r = AbiCoder.decodeParameters(types, value);
	r.length = types.length;
	return Array.toArray(r);
}

export interface MethodCall {
	call(): Promise<ApplyExtrinsicResult>;
	post(event?: string): Promise<any>;
	// post(cb: (result: ISubmittableResult, extra: any) => void | Promise<void>): Promise<() => void>;
}

export interface MethodContext {
	(...args: any[]): MethodCall;
}

export class Substrate {

	private __api?: ApiPromise;
	private _account?: InjectedAccountWithMeta;
	private _defaultAccount: string = '';
	private _methods: Dict<MethodContext> = function(self: Substrate) {
		return new Proxy(self, {
			get(_: any, prop_: any) {
				var prop = String(prop_);
				var func = self.api.tx.nftModule[prop];
				if (!func) {
					throw Error.new(`Method "${prop}" not found`);
				}
				return function(...args: any[]) {
					var opts = {};
					var call = func(...args);
					return {
						call: function() {
							return self._Call(call, opts);
						},
						post: function(event: any) {
							return self._Post(call, opts, event);
						},
					} as unknown as MethodCall;
				};
			}
		});
	}(this);

	get defaultAccount() {
		return this._defaultAccount;
	}

	get api() {
		return this.__api as ApiPromise;
	}

	get consts() {
		return this.api.consts.nftModule;
	}

	get errors() {
		return this.api.errors.nftModule;
	}

	get events() {
		return this.api.events.nftModule;
	}

	get query() {
		return this.api.query.nftModule;
	}

	get tx() {
		return this.api.tx.nftModule;
	}

	get methods() {
		return this._methods;
	}

	private async _callSign(call: any, opts: {signer?:LazySigner, call?: any }) {
		if (!opts.signer) {
			opts.signer = await this.signer();
			opts.call = await call.signAsync(opts.signer.from, {signer: opts.signer});
		}
		return { call: opts.call, signer: opts.signer };
	}

	private async _Call(call: any, opts: {signer?:LazySigner, submittable?: any}) {
		var {call, signer} = await this._callSign(call, opts);
		return await call.dryRun(signer.from, signer.options);
	}

	private async _Post(call: any, opts: {signer?:LazySigner, submittable?: any}, event: any) {
		// var {call} = await this._callSign(call, opts);
		var r = await this._Call(call, opts); // tryRun

		somes.assert(r.asOk.isOk, r.asOk.toHuman() + " => " + r.asOk.toString());

		return await somes.promise(async (resolve,reject)=>{
			await call.send(function({events,status}: ISubmittableResult, extra: any) {
				console.log('Transaction status:', status.type);
				if (status.isInBlock) {
					console.log('Included at block hash', status.asInBlock.toHex());
					console.log('Events:');
					resolve(events.filter(({ event: { data, method, section }, phase }) => {
						console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
						return method == event;
					}).map(e=>e.event.data.toJSON()));
				} else if (status.isFinalized) {
					console.log('Finalized block hash', status.asFinalized.toHex());
				}
			});
		})
	}

	async signer() {
		var account = await this.getInjectedAccount();
		var injected = await web3FromSource(account.meta.source);
		return new LazySigner(injected.signer, account.address);
	}

	async isSupport() {
		try {
			await web3Enable('NFTSwap');
			var metas = await web3Accounts();
			return !!metas.length;
		} catch(e) {}
		return false;
	}

	async getInjectedAccount() {
		if (!this._account) {
			var i = 10;
			var metas: InjectedAccountWithMeta[] = [];
			while(i--) {
				await web3Enable('NFTSwap');
				var metas = await web3Accounts();
				if (metas.length) {
					this._account = metas[0];
					break;
				}
				await somes.sleep(200);
			}
			if (!metas.length) {
				history.push('/install');
				throw Error.new('polkdot wallet needs to be installed and create an account');
			}
		}
		return this._account as InjectedAccountWithMeta;
	}

	async getDefaultAccount() {
		if (!this._defaultAccount) {
			var meta = await this.getInjectedAccount();
			this._defaultAccount = meta.address;
		}
		return this._defaultAccount;
	}

	async initialize() {
		// Create our API with a default connection to the local node
		this.__api = await ApiPromise.create({ provider, types });

		await this.api.isReady;

		if (await isSupport()) {
			await this.getDefaultAccount();
		}
	}

}

export function isSupport() {
	return _default.isSupport();
}

const _default = new Substrate;

export default _default;
