import { React } from 'webpkit/mobile';
import { INftItem } from '../../pages/my';
import Button from '../button';
import "./index.scss";

interface INftCardProps {
	nft: INftItem;
	btnClick: () => void;
	btnText: string;
	btnLoadingText: string;
}

const NftCard = (props: INftCardProps) => {
	let { nft, btnClick, btnText, btnLoadingText } = props;
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
			<Button loading={nft.btn_disabled} disabled={nft.btn_disabled} type="primary" onClick={btnClick}>{nft.btn_disabled ? btnLoadingText : btnText}</Button>
		</div>
	</div>;
}

export default NftCard;