import { React } from 'webpkit/mobile';
import Button from '../button';
import { Image } from 'antd';
import "./index.scss";
import { INftItem } from '../../pages/interface';
import { getSubStr } from '../../util/tools';

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
				{Boolean(Number(nft.count) > 1) && <div className="nft_count">{nft.count}</div>}
				{nft.media.match(/\.mp4/i) ? <video controls src={nft.media} poster={nft.image}></video> : <Image width='100%' src={nft.image} alt="" placeholder={
					<Image
						preview={false}
						src={`${nft.image}?imageMogr2/thumbnail/!200x200r/blur/3x5`}
						width='100%'
					/>
				} />}
			</div>

			<div className="nft_address_box">
				<div className="nft_address_title">Address</div>
				<div className="nft_address textNoWrap">{getSubStr(nft.token, 18)}</div>
			</div>

			<div className="nft_hash_box">
				<div className="nft_hash_title">Hash</div>
				<div className="nft_hash textNoWrap">{getSubStr(nft.tokenId, 18)}</div>
			</div>
		</div>

		<div className="action_btn_box">
			<Button loading={nft.btn_disabled} disabled={nft.btn_disabled} type="primary" onClick={btnClick}>{nft.btn_disabled ? btnLoadingText : btnText}</Button>
		</div>
	</div>;
}

export default NftCard;