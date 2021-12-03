/**
 * @copyright © 2021 Copyright hardchain
 * @date 2021-01-04
 */

import {Address,Uint256,Bytes} from 'web3z/solidity_types';
import {Result} from 'web3z/happy';
import * as json from '../../../deps/mvp-ser/abi/ERC1155.json';
import {contracts} from '../../../config';

export const abi = json.abi;
export const contractName = json.contractName;
export const contractAddress = contracts.ERC1155;

export default interface ERC1155 {
	safeTransferFrom(from: Address, to: Address, tokenId: Uint256, amount: Uint256, data: Bytes): Result<void>;
	balanceOf(from: Address, tokenId: Uint256): Result<Uint256>;
}