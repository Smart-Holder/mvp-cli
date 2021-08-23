
import buffer from 'somes/buffer'
import artifacts from './artifacts';

export class ApiIMPL {

	// 安全转移资产
	async safeTransferFrom(token: string, from: string, to: string, tokenId: bigint, amount: bigint, data?: Uint8Array) {
		var nft = artifacts.erc1155(token);
		var data_ = data ? '0x' + buffer.from(data).toString('hex'): '0x0';
		// var uri = await nft.api.tokenURI(tokenId).call();
		// console.log(uri);
		await nft.api.safeTransferFrom(from, to, tokenId, amount, data_).call();
		var r = await nft.api.safeTransferFrom(from, to, tokenId, amount, data_).post();
		var evt = await nft.findEventFromReceipt('TransferSingle', r);
		var values = evt[0].returnValues as any;
		return {
			from: values.address as string,
			to: values.to as string,
			tokenId: BigInt(values.id),
			amount: BigInt(values.value),
		};
	}

}

export default new ApiIMPL;