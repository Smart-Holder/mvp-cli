/**
 * @copyright © 2021 Copyright hardchain
 * @date 2021-01-04
 */

import {Address,Uint256,Bytes32,Bytes} from 'web3z/solidity_types';
import {Result} from 'web3z/happy';
import * as json from '../../../deps/mvp-ser/abi/ERC1155Proxy.json';
import {contracts} from '../../../config';

export const abi = json.abi;
export const contractName = 'NFTProxy';//json.contractName;
//export const contractAddress = contracts.ERC721Proxy;// '0x7322ee767aaD2dEf9e3527Dc1230fB5f09ead682';

export interface Owners {
	balances: Uint256; // token 数量
	signCount: Uint256; // 签名数量限制,转移资产时最小签名数量
	owners: Address[] ; // owners 第一个索引为主要owner后面的为从owner对外这个资产属于主owner
}

export interface Signature {
	r: Bytes32; s: Bytes32; v: number;
}

export interface TransferTx {
	token: Address;
	tokenId: Uint256;
	from: Address;
	to: Address[];
	amount: Uint256;
	data: Bytes;
	expiry: Uint256; // second
	signCount: Uint256;
	signer: Address[];
	rsv: Signature[];
}

export default interface NFTProxy {
	balanceOf(token: Address, tokenId: Uint256, owner: Address): Result<Uint256>;
	ownersOf(token: Address, tokenId: Uint256, owner: Address): Result<Owners>;
	withdraw(to: Address, token: Address, tokenId: Uint256, amount: Uint256, data: Bytes): Result;
	transfer(to: Address[], token: Address, tokenId: Uint256, amount: Uint256, signCount: Uint256): Result;
	encodePacked(tx: TransferTx): Result<Bytes>;
	withdrawFrom(tx: TransferTx): Result;
	transferFrom(tx: TransferTx): Result;
}