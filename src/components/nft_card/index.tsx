import { React } from 'webpkit/mobile';
import Button from '../button';
import { Image } from 'antd';
import { INftItem } from '../../pages/interface';
import { getSubStr } from '../../util/tools';
import erc721 from '../../chain/erc721';
import erc1155 from '../../chain/erc1155';
import { AssetType } from '../../models';
import chain from '../../chain';

import "./index.scss";

const tp = require('tp-js-sdk');

interface INftCardProps {
	nft: INftItem;
	btnClick: () => void;
	btnText: string;
	btnLoadingText: string;
	showChain?: boolean;
	showTransferBtn?: boolean;
	transferBtnClick?: () => void;
}

const NftCard = (props: INftCardProps) => {
	let { nft, btnClick, transferBtnClick, btnText, btnLoadingText, showChain = false, showTransferBtn = navigator.userAgent.includes('TokenPocket') } = props;

	const transfer = async (nft: INftItem) => {
		// tp.getCurrentWallet().then((res: any) => {
		// 	window.alert(JSON.stringify(res.data));
		// });
		let { token, tokenId, ownerBase } = nft;
		// let owner = await chain.getDefaultAccount(); // '0xD6188Da7d84515ad4327cd29dCA8Adc1B1DABAa3'

		// tp.invokeQRScanner().then(async (address: string) => {
		// 	console.log(address, "result");

		// 	try {
		// 		if (nft.type == AssetType.ERC721) { // erc721
		// 			chain.assetChain(nft.contract?.chain, '请切换至对应链的钱包');
		// 			await erc721.safeTransferFrom(token, owner, address, BigInt(tokenId));
		// 		} else if (nft.type == AssetType.ERC1155) {
		// 			chain.assetChain(nft.contract?.chain, '请切换至对应链的钱包');
		// 			await erc1155.safeTransferFrom(token, owner, address, BigInt(tokenId), BigInt(nft.count));
		// 		} else {
		// 			// reject(t('暂时不支持这种类型的NFT存入到设备'));
		// 		}
		// 	} catch (error) {
		// 		window.alert(error);
		// 	}
		// });
	}

	const { btn_disabled, transfer_btn_disabled } = nft;

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

			<div className="nft_address_box">
				<div className="nft_hash_title">Hash</div>
				<div className="nft_hash textNoWrap">{getSubStr(nft.tokenId, 18)}</div>
			</div>

			{showChain && <div className="nft_hash_box">
				<div className="nft_hash_title">网络</div>
				<div className="nft_hash textNoWrap">{nft.contract?.chain}</div>
			</div>}
		</div>

		{!showChain && <div className={`action_btn_box ${showTransferBtn && 'btn_list'}`}>
			{showTransferBtn && <Button loading={transfer_btn_disabled} disabled={btn_disabled || transfer_btn_disabled} type="primary" ghost={true} onClick={transferBtnClick}>转移NFT</Button>}
			<Button loading={btn_disabled} disabled={transfer_btn_disabled || btn_disabled} type="primary" onClick={btnClick}>{btn_disabled ? btnLoadingText : btnText}</Button>
		</div>}
	</div>;
}

export default NftCard;