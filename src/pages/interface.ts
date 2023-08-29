import { NFT } from "../models";

export interface INftItem extends NFT {
	btn_disabled?: boolean;
	transfer_btn_disabled?: boolean;
	metadataJson?: {
		properties?: { trait_type: string; value: string }[];
	};
}

// export interface IPageProps {

// }
