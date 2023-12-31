import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import Header from '../util/header';
import index, { AssetOrder, NFT } from '../models';
import { Image, Spin } from 'antd';
import { Tabs } from 'antd-mobile';

import { chainTraits, copyText, getSubStr, unitChainIdLabel, unitLabel } from '../util/tools';
import { withTranslation } from 'react-i18next';
// import moment from "moment";

import '../css/nft_detail.scss';
const moment = require('moment');

class NftDetail extends NavPage<{ token: string, tokenId: string }> {

	state = {
		nft: {} as NFT,
		nftOrderList: [] as AssetOrder[],
		tabsCurrent: 0,
		loading: true
	}

	tabsConfig = [
		{ title: this.t('基本信息'), index: 0 }, { title: this.t('交易历史'), index: 1 }, { title: this.t('NFT介绍'), index: 2 }
	];


	async triggerLoad() {
		let { token, tokenId } = this.params;
		let data = await index.nft.methods.getNFT({ token, tokenId });
		let orderData = await index.utils.methods.assetOrders({ token, tokenId });
		this.setState({ nft: data[0], nftOrderList: orderData, loading: false });
	}

	getUri(item: NFT) {
		let uri = item.uri
		if (!uri) return '';
		if (uri.indexOf('0x{id}')) {
			uri = uri.replace('0x{id}', item.tokenId);
		}
		return uri;

	}

	render() {
		let { t } = this;
		let { nft, nftOrderList, loading } = this.state;
		return <div className='nft_detail_page'>
			<Header title={t("NFT详情")} page={this} />

			<div className="nft_detail_page_card_box">
				<Spin spinning={loading}>

					<div className="nft_detail_page_card">
						<div className="nft_card">
							<div className="nft_info_box">
								{Boolean(nft.tokenId) && <div className="nft_img_box">
									{Boolean(Number(nft.count) > 1) && <div className="nft_count">{nft.count}</div>}
									{nft.media?.match(/\.mp4/i) ? <video controls src={nft.media} poster={nft.image||nft.imageOrigin}></video> :
										<Image width='100%' src={nft.image||nft.imageOrigin} alt="loading" placeholder={
										<Image
											preview={false}
											src={`${nft.image||nft.imageOrigin}?imageMogr2/thumbnail/!200x200r/blur/3x5`}
											width='100%'
										/>
									} />}
								</div>}

								<Tabs tabBarActiveTextColor={"#5396F7"} tabBarUnderlineStyle={{ border: 0, height: '3px', background: 'linear-gradient(90deg, #4881FA, #6ED6F5)', borderRadius: '3px' }} tabs={this.tabsConfig}
									initialPage={0}
								>
									<div className="item_page" >
										<div className="nft_address_box">
											<div className="nft_address_title">Token ID</div>
											<div className="nft_address textNoWrap" onClick={() => {
												copyText(nft.tokenId);
											}}>{getSubStr(nft.tokenId, 18)}</div>
										</div>

										<div className="nft_address_box">
											<div className="nft_hash_title">Address</div>
											<div className="nft_hash textNoWrap" onClick={() => {
												copyText(nft.token);
											}}>{getSubStr(nft.token, 18)}</div>
										</div>

										<div className="nft_address_box">
											<div className="nft_hash_title">{t("元数据")}</div>
											<div style={{ wordWrap: 'break-word', wordBreak: 'break-all' }} className="nft_hash" onClick={() => {
												copyText(nft.uri);
											}}>{this.getUri(nft)}</div>
										</div>

									</div>
									<div className="item_page" >
										{nftOrderList.map((item,index) => {
											let { fromAddres, value, toAddress, date } = item;
											// let 
											// let unit = (chainTraits as any)[unitLabel[String(nft?.chain)]][2];
											let unitObj = (chainTraits as any)[unitChainIdLabel[Number(nft?.chain)]];
											let unit = unitObj ? unitObj[2] : nft.chain;
											return <div className="order_item" key={index}>

												<div className='order_row'>
													<div className="label letter_space">{t("事件")}</div>
													<div className="value">{t(fromAddres!=='0x0000000000000000000000000000000000000000' && fromAddres ? "转移" : "上架")}</div>
												</div>

												<div className='order_row'>
													<div className="label letter_space">{t("价格")}</div>
													<div className="value">{Number(value) / Math.pow(10, 18)} {unit}</div>
												</div>

												<div className='order_row'>
													<div className="label">{t("发送方")}</div>
													<div className="value textNoWrap">{fromAddres}</div>
												</div>

												<div className='order_row'>
													<div className="label">{t("接收方")}</div>
													<div className="value textNoWrap">{toAddress}</div>
												</div>

												<div className='order_row'>
													<div className="label letter_space">{t("日期")}</div>
													<div className="value">{moment(date).fromNow()}</div>
												</div>
											</div>
										})}

									</div>
									<div className="item_page">
										<div className="nft_info_box" dangerouslySetInnerHTML={{ __html: nft.info }}></div>
									</div>
								</Tabs>
							</div>
						</div>
					</div>
				</Spin>
			</div>

		</div>
	}
};

export default withTranslation('translations', { withRef: true })(NftDetail);