/**
 * @copyright © 2021 Copyright hardchain
 * @date 2021-01-04
 */

import {Address,Uint256,Bytes} from 'web3z/solidity_types';
import {Result} from 'web3z/happy';
import * as json from '../../../out/abi/ERC721.json';
import {contracts} from '../../../config';

export const abi = json.abi;
export const contractName = json.contractName;
export const contractAddress = contracts.erc721;// '0x7322ee767aaD2dEf9e3527Dc1230fB5f09ead682';

export default interface ERC721 {
	ownerOf(token: Address, tokenId: Uint256): Result<Address>;
	withdraw(to: Address, token: Address, tokenId: Uint256): Result;
	transfer(to: Address, token: Address, tokenId: Uint256): Result;
}