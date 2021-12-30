
import buffer from 'somes/buffer'
import { Address } from 'web3z/solidity_types';
import artifacts from './artifacts';
import chain, {encodeParameters} from '.';

export class ApiIMPL {

	async balanceOf(token: string, from: string) {
		var nft = artifacts.erc721(token);
		return await nft.api.balanceOf(from).call();
	}

	// get token uri
	tokenURI(token: string, tokenId: bigint): Promise<string> {
		return artifacts.erc721(token).api.tokenURI(tokenId).call();
	}

	// 设置token uri
	async setTokenURI(token: string, tokenId: bigint, tokenURI: string): Promise<void> {
		var nft = artifacts.erc721(token);
		await nft.api.setTokenURI(tokenId, tokenURI).call();
		await nft.api.setTokenURI(tokenId, tokenURI).post();
	}

	// 创建一个新的资产
	async mint(token: string, tokenId: bigint) {
		var nft = artifacts.erc721(token);
		await nft.api.mint(tokenId).call();
		var r = await nft.api.mint(tokenId).post();
		var evt = await nft.findEventFromReceipt('Transfer', r);
		var values = evt[0].returnValues as any;
		return {
			from: values.address as string,
			to: values.to as string,
			tokenId: BigInt(values.tokenId),
		};
	}

	async safeMintURI(token: string, to: Address, tokenId: bigint, tokenURI: string, data?: Uint8Array) {
		var nft = artifacts.erc721(token);
		var data_ = data ? '0x' + buffer.from(data).toString('hex') : '0x0';
		await nft.api.safeMintURI(to, tokenId, tokenURI, data_).call();
		var r = await nft.api.safeMintURI(to, tokenId, tokenURI, data_).post();
		var evt = await nft.findEventFromReceipt('Transfer', r);
		var values = evt[0].returnValues as any;
		return {
			from: values.address as string,
			to: values.to as string,
			tokenId: BigInt(values.tokenId),
		};
	}

	// 安全转移资产
	async safeTransferFrom(token: string, from: string, to: string, tokenId: bigint, data?: Uint8Array) {
		var nft = artifacts.erc721(token);
		var data_ = data ? '0x' + buffer.from(data).toString('hex') : '0x0';
		// var uri = await nft.api.tokenURI(tokenId).call();
		// console.log(uri);
		await nft.api.safeTransferFrom(from, to, tokenId, data_).call();
		var r = await nft.api.safeTransferFrom(from, to, tokenId, data_).post();
		var evt = await nft.findEventFromReceipt('Transfer', r);
		var values = evt[0].returnValues as any;
		return {
			from: values.address as string,
			to: values.to as string,
			tokenId: BigInt(values.tokenId),
		};
	}

	// 查看资产是否存在
	exists(token: string, tokenId: bigint) {
		return artifacts.erc721(token).api.exists(tokenId).call();
	}

	async safeTransferToProxy(token: string, to: string[], tokenId: bigint, proxy: string, signCount = 1) {
		var from = await chain.getDefaultAccount();
		var buf = encodeParameters(['address[]', 'uint256'], [to, signCount]);
		await this.safeTransferFrom(token, from, proxy, tokenId, buf);
	}

}

export default new ApiIMPL;