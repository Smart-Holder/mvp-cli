/**
 * @copyright © 2021 Copyright hardchain
 * @date 2021-01-05
 */

import {Address,Uint256} from 'web3z/solidity_types'
import {Result} from 'web3z/happy';
import * as json from './FeePlan.json';
import {contracts} from '../../../../config';

export const abi = json.abi;
export const contractName = json.contractName;
export const contractAddress = contracts.feePlan;//'0x99B42B2D0503ECDaB00393F95565A8B601899DcF';

export default interface FeePlan {
	owner(): Result<Address>;
	feeUnit(): Result<Uint256>;
	feeToVoterAtFirst(): Result<Uint256>;
	feeToTeamAtFirst(): Result<Uint256>;
	feeToVoter(): Result<Uint256>;
	feeToTeam(): Result<Uint256>;
	voterShareRatio(firstAuction: boolean): Result<Uint256>;
	formula(value: Uint256, firstBid: boolean, votes: Uint256): Result<{ toSeller: Uint256; toVoter: Uint256; toTeam: Uint256 }>;
}