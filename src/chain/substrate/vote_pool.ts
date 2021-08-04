
import * as vp from '../vote_pool';
import substrate from '.';
import user from './user';
// import somes from 'somes';

export class ApiIMPL implements vp.APIVotePool {

	contractAddress = '';

	// 通过投票id返回投票信息
	votesById(voteId: bigint): Promise<vp.Vote> {
		throw Error.new('not voteId');
	}

	// 通过订单返回竞拍活动的投票质押信息总览
	async ordersById(orderId: bigint): Promise<vp.OrderSummary> {
		// var order = (await substrate.query.orders(Number(orderId))).toJSON() as any;
		// somes.assert(order, 'not orderId');
		return {
			totalVotes: await this.orderTotalVotes(orderId),
			totalCanceledVotes: BigInt(0),
			fixedRate: BigInt(0),
			totalShares: BigInt(0),
			commission: BigInt(0),
			stoped: false,
		};
	}

	// vote
	async marginVote(orderId: bigint, amount: bigint): Promise<{
		orderId: bigint;
		voter: string;
		voteId: bigint;
		votes: bigint;
		weight: bigint;
	}> {
		var address = await user.address();
		await substrate.methods.voteOrder(Number(orderId), Number(amount) / 1e6).post();
		return {
			orderId: orderId,
			voter: address,
			voteId: BigInt(0),
			votes: amount,
			weight: BigInt(0),
		}
	}

	// 取消vote
	cancelVote(voteId: bigint): Promise<{
		orderId: bigint;
		voter: string;
		voteId: bigint;
	}> {
		throw Error.new(`It can't be cancelled`);
	}

	// 返回订单的投票总量
	async orderTotalVotes(orderId: bigint): Promise<bigint> {
		interface Vote {
			order_id: number;
			amount: number;
			owner: string;
		}
		var votes = (await substrate.query.votes(Number(orderId))).toJSON() as any as Vote[];
		var votesNum = 0;
		for (var vote of votes) {
			votesNum += vote.amount;
		}
		return Promise.resolve(BigInt(votesNum) * BigInt(1e6));
	}

	// 要释放的金额,我的收益
	canRelease(holder: string): Promise<bigint> {
		return Promise.resolve(BigInt(0));
	}

	// 尝试释放结束的投票金额,释放我的收益
	tryRelease(holder: string): Promise<bigint> {
		throw Error.new(`not release`);
	}

}

export default new ApiIMPL;