/**
 * @copyright © 2021 Copyright hardchain
 * @date 2021-01-04
 */

import {Address,Uint256,Bytes32} from 'web3z/solidity_types';
import {Result} from 'web3z/happy';
import * as json from '../../../deps/mvp-sol/out/abi/NFTProxy.json';
import {contracts} from '../../../config';

export const abi = json.abi;
export const contractName = json.contractName;
export const contractAddress = contracts.ERC721Proxy;// '0x7322ee767aaD2dEf9e3527Dc1230fB5f09ead682';

export interface Signature {
	r: Bytes32; s: Bytes32; v: number;
}

export interface TransferTx {
	token: Address;
	tokenId: Uint256;
	to: Address;
	expiry: Uint256; // second
	rsv: Signature;
}

export default interface NFTProxy {
	ownerOf(token: Address, tokenId: Uint256): Result<Address>;
	deposit(to: Address, token: Address, tokenId: Uint256): Result;
	withdraw(to: Address, token: Address, tokenId: Uint256): Result;
	transfer(to: Address, token: Address, tokenId: Uint256): Result;
	withdrawFrom(tx: TransferTx): Result;
	transferFrom(tx: TransferTx): Result;
}