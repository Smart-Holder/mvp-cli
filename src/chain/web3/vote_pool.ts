
import * as vp from '../vote_pool';
import artifacts from './artifacts';

export class ApiIMPL implements vp.APIVotePool {

	private get _artifact() { return artifacts.vote_pool.api }

	get contractAddress() { return artifacts.vote_pool.address }

	// 投票最小锁定时间
	voteLockTime() {
		return this._artifact.voteLockTime().call();
	}

	// 投票人的投票集合
	async votes(voter: string) {
		// TODO ...
		var votes: vp.Vote[] = [];
		var voter_ids = await this._artifact.votesByVoter(voter).call();
		for (var id of voter_ids) {
			votes.push(await this.votesById(id));
		}
		return votes;
	}

	// 通过投票id返回投票信息
	votesById(voteId: bigint) {
		return this._artifact.votesById(voteId).call();
	}

	// 通过订单返回竞拍活动的投票质押信息总览
	ordersById(orderId: bigint) {
		return this._artifact.ordersById(orderId).call();
	}

	// vote
	async marginVote(orderId: bigint, amount: bigint) {
		await this._artifact.marginVote(orderId).call({ value: String(amount) });
		var r = await this._artifact.marginVote(orderId).post({ value: String(amount) });
		var evt = await artifacts.vote_pool.findEventFromReceipt('Voted', r);
		var values = evt[0].returnValues as any;
		return {
			orderId: BigInt(values.orderId),
			voter: String(values.voter), voteId: BigInt(values.voteId),
			votes: BigInt(values.votes), weight: BigInt(values.weight),
		};
	}

	// 取消vote
	async cancelVote(voteId: bigint) {
		await this._artifact.cancelVote(voteId).call();
		var r = await this._artifact.cancelVote(voteId).post();
		var evt = await artifacts.vote_pool.findEventFromReceipt('Canceled', r);
		var values = evt[0].returnValues as any;
		return {
			orderId: BigInt(values.orderId),
			voter: String(values.voter), voteId: BigInt(values.voteId),
		};
	}

	// 返回订单的投票总量
	orderTotalVotes(orderId: bigint) {
		return this._artifact.orderTotalVotes(orderId).call();
	}

	// 要释放的金额,我的收益
	canRelease(holder: string) {
		return this._artifact.canRelease(holder).call();
	}

	// 尝试释放结束的投票金额,释放我的收益
	async tryRelease(holder: string) {
		var sumProfit = await this._artifact.tryRelease(holder).call();
		await this._artifact.tryRelease(holder).post();
		return sumProfit;
	}

	// 投票人的投票凭据ID集合
	allVotes(voter: string) {
		return this._artifact.allVotes(voter).call();
	}

}

export default new ApiIMPL;