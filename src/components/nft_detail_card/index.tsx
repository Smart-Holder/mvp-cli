import { React } from 'webpkit/mobile';
import Button from '../button';
import { Image } from 'antd';
import { INftItem } from '../../pages/interface';
import { getSubStr } from '../../util/tools';
import { useTranslation } from 'react-i18next';

import "./index.scss";

interface INftCardProps {
	nft: INftItem;
	btnClick: () => void;
	btnText: string;
	btnLoadingText?: string;
	showChain?: boolean;
	showTransferBtn?: boolean;
	transferBtnClick?: () => void;
}

const NftDetailCard = (props: INftCardProps) => {
	let { nft, btnClick, transferBtnClick, btnText, btnLoadingText = btnText, showChain = false, showTransferBtn = navigator.userAgent.includes('TokenPocket') } = props;


	const { t } = useTranslation();

	return <div className="nft_card">
		<div className="nft_info_box">
			<div className="nft_img_box">
				{Boolean(Number(nft.count) > 1) && <div className="nft_count">{nft.count}</div>}
				{nft.media?.match(/\.mp4/i) ? <video controls src={nft.media} poster={nft.image}></video> : <Image width='100%' src={nft.image} alt="" placeholder={
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

			<div className="nft_address_box">
				<div className="nft_hash_title">Hash</div>
				<div className="nft_hash textNoWrap">{getSubStr(nft.tokenId, 18)}</div>
			</div>

			{showChain && <div className="nft_hash_box">
				<div className="nft_hash_title">{t('网络')}</div>
				<div className="nft_hash textNoWrap">{nft.contract?.chain}</div>
			</div>}
		</div>


	</div>;
}

export default NftDetailCard;