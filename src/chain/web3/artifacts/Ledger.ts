/**
 * @copyright © 2021 Copyright hardchain
 * @date 2021-01-05
 */

import {Address,Uint256, Uint8} from 'web3z/solidity_types';
import {Result} from 'web3z/happy';
import * as json from './Ledger.json';
import {contracts} from '../../../../config';

export const abi = json.abi;
export const contractName = json.contractName;
export const contractAddress = contracts.ledger;//'0x5947073453b978fc36235747031c511B57540a7c';

export default interface Ledger {
	owner(): Result<Address>;
	name(): Result<string>;
	symbol(): Result<string>;
	decimals(): Result<Uint8>;
	hasSubLedger(addr: Address): Result<Uint8>;
	totalSupply(): Result<Uint256>;
	balanceOf(account: Address): Result<Uint256>;
	transfer(recipient: Address, amount: Uint256): Result<boolean>;
	allowance(owner: Address, spender: Address): Result<Uint256>;
	approve(spender: Address, amount: Uint256): Result<boolean>;
	transferFrom(sender: Address, recipient: Address, amount: Uint256): Result<boolean>;
	increaseAllowance(spender: Address, addedValue: Uint256): Result<boolean>;
	decreaseAllowance(spender: Address, subtractedValue: Uint256): Result<boolean>;
	withdraw(receiver: Address, amount: Uint256): Result<void>;
	deposit(): Result<void>;
	lockedItems(holder: Address): Result<{locker: Address; lockId: Uint256; amount: Uint256}[]>;
}