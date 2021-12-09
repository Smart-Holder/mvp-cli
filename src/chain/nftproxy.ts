
import somes from 'somes';
import { Address, Uint256, Bytes } from 'web3z/solidity_types';
import artifacts from './artifacts';
import NFTProxy, { TransferTx } from './artifacts/NFTProxy';
import HappyContract from 'web3z/happy';
import { contracts } from '../../config';
import * as device from '../models/device';
import index, { encodeParameters } from '.';
import buffer, { IBuffer } from 'somes/buffer';

var tx_sign = require('crypto-tx/sign');
var crypto_tx = require('crypto-tx');

export default class ApiIMPL {

	private _artifacts: HappyContract<NFTProxy>;

	static New(contractAddress: string): ApiIMPL {
		return new ApiIMPL(contractAddress);
	}

	constructor(_contractAddress: string) {
		this._artifacts = artifacts.nft_proxy(_contractAddress);
	}

	get contractAddress() { return this._artifacts.address }

	balanceOf(token: Address, tokenId: Uint256, owner: Address) {
		return this._artifacts.api.balanceOf(token, tokenId, owner).call();
	}
	async deposit(to: Address, token: Address, tokenId: Uint256, amount: Uint256) {
		await this._artifacts.api.deposit(to, token, tokenId, amount).call();
		await this._artifacts.api.deposit(to, token, tokenId, amount).post();
	}
	async withdraw(to: Address, token: Address, tokenId: Uint256, amount: Uint256) {
		await this._artifacts.api.withdraw(to, token, tokenId, amount).call();
		await this._artifacts.api.withdraw(to, token, tokenId, amount).post();
	}
	async transfer(to: Address, token: Address, tokenId: Uint256, amount: Uint256) {
		await this._artifacts.api.transfer(to, token, tokenId, amount).call();
		await this._artifacts.api.transfer(to, token, tokenId, amount).post();
	}

	private async _tx(from: Address, to: Address, token: Address, tokenId: Uint256, amount: Uint256, data?: Bytes) {
		var balance = await this.balanceOf(token, tokenId, from);
		somes.assert(balance, '#ApiIMPL#_tx: NOT_OWN_TOKEN');
		var expiry = Math.floor((Date.now() + 6e4) / 1e3);
		var msg = tx_sign.message(
			[token, tokenId, to, amount, data || '0x', expiry/*, from*/],
			['address', 'uint256', 'address', 'uint256', 'bytes', 'uint256'/*, 'address'*/]
		);
		var sign_hex = await device.sign(from as string, msg) as string;
		console.log('device.sign()', `msg=0x${msg.toString('hex')}`, `sign=${sign_hex}`);
		var sign = buffer.from(sign_hex.slice(2), 'hex');
		var tx: TransferTx = {
			token, tokenId, to, amount, expiry: BigInt(expiry),
			data: data || '0x',
			rsv: {
				r: '0x' + sign.slice(0, 32).toString('hex'),
				s: '0x' + sign.slice(32, 64).toString('hex'),
				v: sign[64] + 27,
			},
		};
		return tx;
	}

	async withdrawFrom(from: Address, to: Address, token: Address, tokenId: Uint256, amount: Uint256, data?: Bytes) {

		var tx = await this._tx(from, to, token, tokenId, amount, data);
		// var count = await this._artifacts.api.balanceOf(token, tokenId, from).call();
		await this._artifacts.api.withdrawFrom(tx).call();
		await this._artifacts.api.withdrawFrom(tx).post();
	}
	async transferFrom(from: Address, to: Address, token: Address, tokenId: Uint256, amount: Uint256, data?: Bytes) {
		var tx = await this._tx(from, to, token, tokenId, amount, data);
		await this._artifacts.api.transferFrom(tx).call();
		await this._artifacts.api.transferFrom(tx).post();
	}

	// test

	private async _sign(buf: IBuffer, from: string) {
		var mask = index.metaMask;
		var hex = await mask.request({
			method: 'personal_sign',
			// method: 'eth_sign',
			params: ['0x' + buf.toString('hex'), from],
		}) as string;
		return buffer.from(hex.slice(2), 'hex');
	}

	async test_withdrawFrom(from: Address, to: Address, token: Address, tokenId: Uint256, amount: Uint256) {

		var balance = await this.balanceOf(token, tokenId, from);
		somes.assert(balance, '#ApiIMPL#test: NOT_OWN_TOKEN');
		var expiry = Math.floor((Date.now() + 6e4) / 1e3);

		var buf = tx_sign.concat(
			[token, tokenId, from, amount, expiry],
			['address', 'uint256', 'address', 'uint256', 'uint256']
		);

		var msg = crypto_tx.keccak(buf);

		console.log(msg.hex);

		var sign = await this._sign(buf, from as string);
		var signature = sign.slice(0, 64);
		var recover = crypto_tx.publicToAddress(crypto_tx.recover(buffer.from(msg.data), signature, sign[64] - 27));

		console.log(recover);

		var tx: TransferTx = {
			token, tokenId, to, amount, expiry: BigInt(expiry),
			data: '0x00',
			rsv: {
				r: '0x' + sign.slice(0, 32).toString('hex'),
				s: '0x' + sign.slice(32, 64).toString('hex'),
				v: sign[64],
			},
		};

		var r = await this._artifacts.api.withdrawFrom(tx).call();
		console.log(r);
		await this._artifacts.api.withdrawFrom(tx).post();
	}

}

export const proxy721 = ApiIMPL.New(contracts.ERC721Proxy);
export const proxy1155 = ApiIMPL.New(contracts.ERC1155Proxy);
