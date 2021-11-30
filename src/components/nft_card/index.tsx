import { React } from 'webpkit/mobile';
import { NFT } from '../../models';
import Button from '../button';
import "./index.scss";

interface INftCardProps {
	nft: NFT;
	saveNftOfDeviceClick: () => void;
}

const NftCard = (props: INftCardProps) => {
	let { nft, saveNftOfDeviceClick } = props;
	return <div className="nft_card">
		<div className="nft_info_box">
			<div className="nft_img_box">
				<img src={nft.image} alt="" />
			</div>

			<div className="nft_address_box">
				<div className="nft_address_title">Address</div>
				<div className="nft_address textNoWrap">{nft.token}</div>
			</div>

			<div className="nft_hash_box">
				<div className="nft_hash_title">Hash</div>
				<div className="nft_hash textNoWrap">{nft.tokenId}</div>
			</div>
		</div>

		<div className="action_btn_box">
			<Button type="primary" onClick={saveNftOfDeviceClick}>存入到设备</Button>
		</div>
	</div>;
}

export default NftCard;