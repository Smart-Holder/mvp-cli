
import artifacts from './artifacts';
import user from './user';
import * as ledger from '../ledger';

export class ApiIMPL implements ledger.APILedger {

	private get _artifact() { return artifacts.ledger.api }

	get contractAddress() { return artifacts.exchange.address }

	// 当前管理eth资产总量
	totalSupply() {
		return this._artifact.totalSupply().call();
	}

	// 通过账户查看eth资产数量
	balanceOf(account?: string) {
		return this._artifact.balanceOf(account || user.addressNoJump()).call();
	}

	// 把的eth资产转移到 to
	async transfer(to: string, amount: bigint) {
		await this._artifact.transfer(to, amount).call();
		var r = await this._artifact.transfer(to, amount).post();
		var evt = await artifacts.ledger.findEventFromReceipt('Transfer', r);
		var values = evt[0].returnValues as any;
		return {
			from: values.address as string,
			to: values.to as string,
			value: BigInt(values.value),
		};
	}

	// 取出eth资产托管, totalSupply 总量会变少
	async withdraw(receiver: string, amount: bigint) {
		await this._artifact.withdraw(receiver, amount).call();
		var r = await this._artifact.withdraw(receiver, amount).post();
		var evt = await artifacts.ledger.findEventFromReceipt('Transfer', r);
		var values = evt[1].returnValues as any;
		return {
			from: values.from as string,
			to: values.to as string,
			value: BigInt(values.value),
		};
	}

	// 存入eth资产托管
	async deposit(amount: bigint) {
		await this._artifact.deposit().call({value: String(amount)});
		var r = await this._artifact.deposit().post({value: String(amount)});
		var evt = await artifacts.ledger.findEventFromReceipt('Transfer', r);
		var values = evt[0].returnValues as any;
		return {
			from: values.from as string,
			to: values.to as string,
			value: BigInt(values.value),
		};
	}

	// 查看锁定的eth资产列表（投票列表）现在的协约竞拍结束后不能自动取消投票
	// 需要查询此api然后调用`cancelVote()`取消投票，后投票的eth才会返回自己的账户
	lockedItems(holder: string) {
		return this._artifact.lockedItems(holder).call();
	}

}

export default new ApiIMPL;