/**
 * @copyright © 2021 Copyright hardchain
 * @date 2021-01-05
 */

import {Result} from 'web3z/happy';
import {Address,Uint256} from 'web3z/solidity_types'
import * as json from './VotePool.json';
import {contracts} from '../../../../config';
import {Vote,OrderSummary} from '../../vote_pool';

export const abi = json.abi;
export const contractName = json.contractName;
export const contractAddress = contracts.votePool;//'0x8Ec6D4Eb6629B332A58d15BD8c71b45A77972fbE';

export default interface VotePool {
	owner(): Result<Address>;
	MAX_WEIGTH(): Result<Uint256>;
	MIN_WEIGTH(): Result<Uint256>;
	MAX_PENDING_VOTES(): Result<Uint256>;
	MAX_FIXED_AROR(): Result<Uint256>;
	MIN_VOTE(): Result<Uint256>;
	YEAR_DAYS(): Result<Uint256>;
	Voteing(): Result<Uint256>;
	lastVoteId(): Result<Uint256>;
	exchange(): Result<Address>;
	ledger(): Result<Address>;
	voteLockTime(): Result<Uint256>;
	votesByVoter(account: Address): Result<Uint256[]>;
	votesById(voteId: Uint256): Result<Vote>;
	ordersById(orderId: Uint256): Result<OrderSummary>;
	marginVote(orderId: Uint256): Result<Uint256>;
	cancelVote(voteId: Uint256): Result<void>;
	orderTotalVotes(orderId: Uint256): Result<Uint256>;
	canRelease(holder: Address): Result<Uint256>;
	tryRelease(holder: Address): Result<Uint256>;
	unlockAllowed(voteId: Uint256, voter: Address): Result<boolean>;
	allVotes(voter: Address): Result<Uint256[]>;
}