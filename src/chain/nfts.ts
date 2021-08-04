
import {Address} from 'web3z/solidity_types';

export interface APINFTs {

	contractAddress: string;

	safeMintURI(token: string, to: Address, tokenId: bigint, tokenURI: string, data?: Uint8Array): Promise<{
		from: string;
		to: string;
		tokenId: bigint;
	}>;

	// 健全转移资产
	safeTransferFrom(token: string, from: string, to: string, tokenId: bigint, data?: Uint8Array): Promise<{
		from: string;
		to: string;
		tokenId: bigint;
	}>;

}