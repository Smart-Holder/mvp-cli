
import * as ex from '../ledger';
import {Address} from 'web3z/solidity_types';

export class ApiIMPL implements ex.APILedger {

	contractAddress = '';

	// 通过账户查看eth资产数量
	balanceOf(account?: string): Promise<bigint> {
		return Promise.resolve(BigInt(0));
	}

	// 取出eth资产托管, totalSupply 总量会变少
	withdraw(receiver: string, amount: bigint): Promise<{
		from: string;
		to: string;
		value: bigint;
	}> {
		throw Error.new(`You can't withdraw money`);
	}

	// 查看锁定的eth资产列表（投票列表）现在的协约竞拍结束后不能自动取消投票
	// 需要查询此api然后调用`cancelVote()`取消投票，后投票的eth才会返回自己的账户
	lockedItems(holder: string): Promise<{
		locker: Address;
		lockId: bigint;
		amount: bigint;
	}[]> {
		return Promise.resolve([]);
	}

}

export default new ApiIMPL;