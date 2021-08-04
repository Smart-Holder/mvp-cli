
import {Address,Uint256} from 'web3z/solidity_types'

// 投票质押信息，用于记录每一张投票信息
export interface Vote {
	voter: Address; // 投票人
	orderId: Uint256; // 所参与的竞拍活动
	votes: Uint256; // 投票质押数量
	weight: Uint256; // 投票质押系数
	blockNumber: Uint256; // 投票区块高度
}

// 竞拍活动的投票质押信息总览
export interface OrderSummary {
	totalVotes: Uint256;// 总投票质押数量
	totalCanceledVotes: Uint256;
	fixedRate: Uint256;
	totalShares: Uint256; // 当前有效投票质押总股份（凭证）
	commission: Uint256; // 竞拍成功时质押投票分成佣金额
	stoped: boolean;
}

export interface APIVotePool {

	contractAddress: string;

	// 通过投票id返回投票信息
	votesById(voteId: bigint): Promise<Vote>;

	// 通过订单返回竞拍活动的投票质押信息总览
	ordersById(orderId: bigint): Promise<OrderSummary>;

	// vote
	marginVote(orderId: bigint, amount: bigint): Promise<{
		orderId: bigint;
		voter: string;
		voteId: bigint;
		votes: bigint;
		weight: bigint;
	}>;

	// 取消vote
	cancelVote(voteId: bigint): Promise<{
		orderId: bigint;
		voter: string;
		voteId: bigint;
	}>;

	// 返回订单的投票总量
	orderTotalVotes(orderId: bigint): Promise<bigint>;

	// 要释放的金额,我的收益
	canRelease(holder: string): Promise<bigint>;

	// 尝试释放结束的投票金额,释放我的收益
	tryRelease(holder: string): Promise<bigint>;

}