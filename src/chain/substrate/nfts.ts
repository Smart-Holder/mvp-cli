
import * as nfts from '../nfts';
import substrate, {decodeParameters, encodeParameters} from '.';
import {Address} from 'web3z/solidity_types';
import buffer from 'somes/buffer';

export class ApiIMPL implements nfts.APINFTs {

	contractAddress = '';

	async safeMintURI(token: string, to: Address, tokenId: bigint, tokenURI: string, data?: Uint8Array): Promise<{
		from: string;
		to: string;
		tokenId: bigint;
	}> {
		var types = ['uint16', 'uint16', 'string'];
		var hex = data ? '0x' + buffer.from(data).toString('hex'): encodeParameters(types, [0,0,tokenId]);
		var [category,flags,title] = decodeParameters(['uint16', 'uint16', 'string'], hex);
		var desc = encodeParameters(['uint16', 'uint16', 'uint256'], [category,flags,tokenId]);
		var [[who, id]] = await substrate.methods.create(title, tokenURI, desc.slice(2)).post('NftCreated');
		if (to && who != to) {
			await substrate.methods.transfer(to, id).post('NftTransfer');
		}
		return {
			from: who,
			to: to as string,
			tokenId: BigInt(id),
		};
	}

	// 安全转移资产
	async safeTransferFrom(token: string, from: string, to: string, tokenId: bigint, data?: Uint8Array): Promise<{
		from: string;
		to: string;
		tokenId: bigint;
	}> {
		await substrate.methods.transfer(to, Number(tokenId)).post('NftTransfer');
		return Promise.resolve({
			from: from,
			to: to,
			tokenId: tokenId,
		});
	}

}

export default new ApiIMPL;