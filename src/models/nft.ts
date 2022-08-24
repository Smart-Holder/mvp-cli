
import { NFT } from '.';
import sdk from '../sdk';

export interface IGetNFTByOwnerPageProps {
	owner: string;
	curPage: number;
	pageSize: number;
	chain?: number;
	other_chain?: number;
	screenHeight?: number;
	screenWidth?: number;
	address?: string;
}

export function getNFTByOwnerPage(props: IGetNFTByOwnerPageProps): Promise<NFT[]> {
	return sdk.nft.methods.getNFTByOwnerPage(props);
}

export function getNFTByOwner(props: IGetNFTByOwnerPageProps): Promise<NFT[]> {
	return sdk.nft.methods.getNFTByOwner(props);
}