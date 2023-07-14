
import buffer from 'somes/buffer'
import artifacts from './artifacts';
import chain, { encodeParameters } from '.';
import { getCurrentGasPrice } from '../util/tools';

export class ApiIMPL {

	async balanceOf(token: string, from: string, tokenId: bigint) {
		var nft = artifacts.erc1155(token);
		return await nft.api.balanceOf(from, tokenId).call();
	}

	// 安全转移资产
	async safeTransferFrom(token: string, from: string, to: string, tokenId: bigint, amount: bigint, data?: Uint8Array) {
		var nft = artifacts.erc1155(token);
		var data_ = data ? '0x' + buffer.from(data).toString('hex') : '0x0';
		// var uri = await nft.api.tokenURI(tokenId).call();
		// console.log(uri);
		let gasPrice = 0;
		if(chain.chain === 137){
			gasPrice = await getCurrentGasPrice()
		}
		await nft.api.safeTransferFrom(from, to, tokenId, amount, data_).call();
		var r = await nft.api.safeTransferFrom(from, to, tokenId, amount, data_).post(chain.chain === 137 ?{ gasPrice }:{});
		var evt = await nft.findEventFromReceipt('TransferSingle', r);
		var values = evt[0].returnValues as any;
		return {
			from: values.address as string,
			to: values.to as string,
			tokenId: BigInt(values.id),
			amount: BigInt(values.value),
		};
	}

	async safeTransferToProxy(token: string, to: string[], tokenId: bigint, amount: bigint, proxy: string, signCount = 1) {
		var from = await chain.getDefaultAccount();
		var buf = encodeParameters(['address[]', 'uint256'], [to, signCount]);
		await this.safeTransferFrom(token, from, proxy, tokenId, amount, buf);
	}

}

export default new ApiIMPL;