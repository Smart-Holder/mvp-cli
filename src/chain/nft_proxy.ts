
import somes from 'somes';
import buffer from 'somes/buffer';
import { Address, Uint256, } from 'web3z/solidity_types';
import artifacts from './artifacts';
import NFTProxy, { TransferTx } from './artifacts/NFTProxy';
import HappyContract from 'web3z/happy';
import {contracts} from '../../config';
import * as device from '../models/device';

var crypto_tx = require('crypto-tx/sign');

export default class ApiIMPL {

	private _artifacts: HappyContract<NFTProxy>;

	static New(contractAddress: string): ApiIMPL {
		return new ApiIMPL(contractAddress);
	}

	constructor(_contractAddress: string) {
		this._artifacts = artifacts.nft_proxy(_contractAddress);
	}

	get contractAddress() { return this._artifacts.address }

	ownerOf(token: Address, tokenId: Uint256) {
		return this._artifacts.api.ownerOf(token, tokenId).call();
	}
	async deposit(to: Address, token: Address, tokenId: Uint256) {
		await this._artifacts.api.deposit(to, token, tokenId).call();
		await this._artifacts.api.deposit(to, token, tokenId).post();
	}
	async withdraw(to: Address, token: Address, tokenId: Uint256) {
		await this._artifacts.api.withdraw(to, token, tokenId).call();
		await this._artifacts.api.withdraw(to, token, tokenId).post();
	}
	async transfer(to: Address, token: Address, tokenId: Uint256) {
		await this._artifacts.api.transfer(to, token, tokenId).call();
		await this._artifacts.api.transfer(to, token, tokenId).post();
	}

	private async _tx(from: Address, to: Address, token: Address, tokenId: Uint256) {
		var target = await this.ownerOf(token, tokenId) as string;
		somes.assert(from == target, '#ApiIMPL#_tx: NOT_OWN_TOKEN');
		var expiry = Math.floor((Date.now() + 6e4) / 1e3);
		var msg = crypto_tx.message([token, tokenId, to, expiry], ['address', 'uint256', 'address', 'uint256']);
		var sign_hex = await device.sign(target, buffer.from(msg)) as string;
		var sign = buffer.from(sign_hex.slice(2), 'hex');
		var tx: TransferTx = {
			token, tokenId, to, expiry: BigInt(expiry),
			rsv: {
				r: '0x' + sign.slice(0, 32).toString('hex'),
				s: '0x' + sign.slice(32, 64).toString('hex'),
				v: sign[64] + 27,
			},
		};
		return tx;
	}

	async withdrawFrom(from: Address, to: Address, token: Address, tokenId: Uint256) {
		var tx = await this._tx(from, to, token, tokenId);
		await this._artifacts.api.withdrawFrom(tx).call();
		await this._artifacts.api.withdrawFrom(tx).post();
	}
	async transferFrom(from: Address, to: Address, token: Address, tokenId: Uint256) {
		var tx = await this._tx(from, to, token, tokenId);
		await this._artifacts.api.transferFrom(tx).call();
		await this._artifacts.api.transferFrom(tx).post();
	}

}

export const erc721_proxy = ApiIMPL.New(contracts.ERC721Proxy);
