
import somes from 'somes';
import { Address, Uint256, Bytes } from 'web3z/solidity_types';
import artifacts from './artifacts';
import NFTProxy, { TransferTx } from './artifacts/NFTProxy';
import HappyContract from 'web3z/happy';
import { contracts } from '../../config';
import * as device from '../models/device';
import index, { encodeParameters } from '.';
import buffer, { IBuffer } from 'somes/buffer';
import { ChainType, AssetType } from '../models/def';

var tx_sign = require('crypto-tx/sign');
var crypto_tx = require('crypto-tx');

export default class ProxyAPI {

	private _artifacts: HappyContract<NFTProxy>;

	static New(contractAddress: string, chain?: ChainType): ProxyAPI {
		return new ProxyAPI(contractAddress, chain);
	}

	constructor(_contractAddress: string, chain?: ChainType) {
		this._artifacts = artifacts.nft_proxy(_contractAddress);
		somes.assert(chain, `ProxyAPI.constructor() "chain" parameter cannot be empty`);
		index.assetChain(chain);
	}

	get contractAddress() { return this._artifacts.address }

	encodePacked(tx: TransferTx) {
		return this._artifacts.api.encodePacked(tx).call();
	}

	balanceOf(token: Address, tokenId: Uint256, owner: Address) {
		return this._artifacts.api.balanceOf(token, tokenId, owner).call();
	}
	ownersOf(token: Address, tokenId: Uint256, owner: Address) {
		return this._artifacts.api.ownersOf(token, tokenId, owner).call();
	}

	async withdraw(to: Address, token: Address, tokenId: Uint256, amount: Uint256, data: Bytes) {
		await this._artifacts.api.withdraw(to, token, tokenId, amount, data).call();
		await this._artifacts.api.withdraw(to, token, tokenId, amount, data).post();
	}

	async transfer(to: Address[], token: Address, tokenId: Uint256, amount: Uint256, signCount: bigint = BigInt(1)) {
		await this._artifacts.api.transfer(to, token, tokenId, amount, signCount).call();
		await this._artifacts.api.transfer(to, token, tokenId, amount, signCount).post();
	}

	private async _sign(buf: IBuffer, from: string) {
		var mask = index.metaMask;
		var hex = await mask.request({
			method: 'personal_sign',
			// method: 'eth_sign',
			params: ['0x' + buf.toString('hex'), from],
		}) as string;
		return hex;//buffer.from(hex.slice(2), 'hex');
	}

	private async _tx(from: Address, to: Address[], token: Address, tokenId: Uint256, amount: Uint256, data: Bytes = '0x', signCount: number = 1) {
		var balance = await this.balanceOf(token, tokenId, from);
		//somes.assert(balance, '#ApiIMPL#_tx: NOT_OWN_TOKEN');
		var expiry = Math.floor((Date.now() + 6e4) / 1e3);

		data = data || '0x';

		var tx: TransferTx = {
			token, tokenId, from, to, amount,
			data, expiry: BigInt(expiry), signCount: BigInt(signCount),
			signer: [],
			rsv: [],
		};
		var buf = encodeParameters(
			['address', 'uint256', 'address', 'address[]', 'uint256', 'bytes', 'uint256', 'uint256'],
			[token, tokenId, from, to, amount, data, expiry, signCount],
		);
		var msg = buffer.from(crypto_tx.keccak(buf).data);
		var my = await index.getDefaultAccount();

		var owners = await this.ownersOf(token, tokenId, from);
		//var buf_hex = await this.encodePacked(tx)
		console.log(msg.toString('hex'));
		//console.log(buffer.from(crypto_tx.keccak(buffer.from(buf_hex.slice(2), 'hex')).data).toString('hex'));
		console.log(owners);

		if (my == from) {
			// var buf2 = buffer.concat([[0x19], buffer.from('Ethereum Signed Message:\n' + buf.length), buf]);
			var device_sign = [{ signer: my, sign: await this._sign(buf, my) }];
		} else {
			var device_sign = await device.sign(from as string, msg);
		}
		console.log('device.sign()', `msg=0x${msg.toString('hex')}`, `sign=${device_sign}`);

		if (typeof device_sign == 'string') { // compatible old version
			device_sign = [{ signer: from as string, sign: device_sign }];
		}

		for (var sign of device_sign) {
			if (sign.sign.slice(0, 2) == '0x') {
				sign.sign = sign.sign.slice(2);
			}
		}

		tx.signer = device_sign.map(e => e.signer);
		tx.rsv = device_sign.map(e => {
			var buf = buffer.from(e.sign, 'hex');
			return {
				r: '0x' + buf.slice(0, 32).toString('hex'),
				s: '0x' + buf.slice(32, 64).toString('hex'),
				v: buf[64] >= 27 ? buf[64] : buf[64] + 27,
			}
		});

		return tx;
	}

	async withdrawFrom(from: Address, to: Address, token: Address, tokenId: Uint256, amount: Uint256, data?: Bytes) {
		var tx = await this._tx(from, [to], token, tokenId, amount, data);
		// var count = await this._artifacts.api.balanceOf(token, tokenId, from).call();
		await this._artifacts.api.withdrawFrom(tx).call();
		await this._artifacts.api.withdrawFrom(tx).post();
	}

	async transferFrom(from: Address, to: Address[], token: Address, tokenId: Uint256, amount: Uint256, data?: Bytes) {
		var tx = await this._tx(from, to, token, tokenId, amount, data);
		await this._artifacts.api.transferFrom(tx).call();
		await this._artifacts.api.transferFrom(tx).post();
	}

	// test

	async test_withdraw(from: Address, to: Address, token: Address, tokenId: Uint256, amount: Uint256) {

		var balance = await this.balanceOf(token, tokenId, from);
		somes.assert(balance, '#ApiIMPL#test: NOT_OWN_TOKEN');
		var expiry = Math.floor((Date.now() + 6e4) / 1e3);

		var buf = encodeParameters(
			['address', 'uint256', 'address', 'address[]', 'uint256', 'bytes', 'uint256', 'uint256'],
			[token, tokenId, from, [to], amount, '0x', expiry, 1],
		);
		var buf2 = buffer.concat([[0x19], buffer.from('Ethereum Signed Message:\n' + buf.length), buf]);
		var msg = buffer.from(crypto_tx.keccak(buf2).data);
		var sign = buffer.from((await this._sign(buf, from as string)).slice(2), 'hex');
		var signature = sign.slice(0, 64);
		var recover = crypto_tx.publicToAddress(crypto_tx.recover(msg, signature, sign[64] - 27));

		console.log(recover);

		var tx: TransferTx = {
			token, tokenId, from, to: [to], amount, expiry: BigInt(expiry), signCount: BigInt(1), signer: [from],
			data: '0x',
			rsv: [{
				r: '0x' + sign.slice(0, 32).toString('hex'),
				s: '0x' + sign.slice(32, 64).toString('hex'),
				v: sign[64],
			}],
		};

		var r = await this._artifacts.api.withdrawFrom(tx).call();
		console.log(r);
		await this._artifacts.api.withdrawFrom(tx).post();
	}

}

// export const proxy721_eth = ProxyAPI.New(contracts.ERC721Proxy, ChainType.ETHEREUM);
// export const proxy1155_eth = ProxyAPI.New(contracts.ERC1155Proxy, ChainType.ETHEREUM);

// export const proxy721_matic = ProxyAPI.New(contracts.ERC721Proxy_MATIC, ChainType.MATIC);
// export const proxy1155_matic = ProxyAPI.New(contracts.ERC1155Proxy_MATIC, ChainType.MATIC);

export function proxyAddress(type: AssetType, chain_?: ChainType, msg?: string): any {
	somes.assert(chain_, `ProxyAPI.constructor() "chain" parameter cannot be empty`);
	var chain = chain_ as ChainType;

	if (type == AssetType.ERC721) {
		if (chain == ChainType.ETHEREUM) {
			return contracts.ERC721Proxy;
		} else if (chain == ChainType.MATIC) {
			return contracts.ERC721Proxy_MATIC;
		}
	}
	else if (type == AssetType.ERC1155) {
		if (chain == ChainType.ETHEREUM) {
			return contracts.ERC1155Proxy;
		} else if (chain == ChainType.MATIC) {
			return contracts.ERC1155Proxy_MATIC;
		}
	}

	throw new Error(msg || 'Configuration proxy not found');
}